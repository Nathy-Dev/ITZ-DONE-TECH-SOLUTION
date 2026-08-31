import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Revenue split constants (60% instructor / 40% platform) ─────────────
export const INSTRUCTOR_SHARE = 0.6;
export const PLATFORM_SHARE = 0.4;

/**
 * Guard for server-to-server mutations. These mutations are invoked by our
 * Next.js API routes (webhook/verify) — never by browsers — and are
 * protected with a shared secret that only the server holds.
 */
async function requireServerSecret(secret: string) {
  const expected = process.env.CONVEX_MUTATION_SECRET;
  if (!expected || secret !== expected) {
    throw new Error("Forbidden: invalid server secret");
  }
}

/**
 * Create a pending payment record. Called by the Next.js API route BEFORE
 * redirecting the student to Flutterwave. Prices are re-computed server-side
 * from the database (never trusted from the client).
 */
export const createPendingPayment = mutation({
  args: {
    txRef: v.string(),
    userId: v.id("users"),
    courseIds: v.array(v.id("courses")),
  },
  handler: async (ctx, args) => {
    // Idempotency: if this txRef already exists, return it
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_tx_ref", (q) => q.eq("txRef", args.txRef))
      .unique();
    if (existing) return existing._id;

    // Build items from authoritative DB data
    const items = [];
    let amountExpected = 0;

    for (const courseId of args.courseIds) {
      const course = await ctx.db.get(courseId);
      if (!course) throw new Error(`Course not found: ${courseId}`);
      if (course.status !== "published") {
        throw new Error(`Course "${course.title}" is not available for purchase`);
      }

      // Skip courses the user already owns
      const existingEnrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_user_course", (q) =>
          q.eq("userId", args.userId).eq("courseId", courseId)
        )
        .first();
      if (existingEnrollment) continue;

      items.push({
        courseId: course._id,
        title: course.title,
        price: course.price,
        instructorId: course.instructorId,
      });
      amountExpected += course.price;
    }

    if (items.length === 0) {
      throw new Error("No purchasable courses in cart (already enrolled or unavailable)");
    }

    return await ctx.db.insert("payments", {
      txRef: args.txRef,
      userId: args.userId,
      items,
      amountExpected,
      currency: "NGN",
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

/**
 * Mark a payment as successful, create enrollments, and split revenue 60/40.
 * Called ONLY from the verified webhook or the server-side verification
 * route (guarded by a server secret). Idempotent by txRef.
 */
export const completePayment = mutation({
  args: {
    serverSecret: v.string(),
    txRef: v.string(),
    flutterwaveTransactionId: v.optional(v.number()),
    amountPaid: v.number(),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireServerSecret(args.serverSecret);
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_tx_ref", (q) => q.eq("txRef", args.txRef))
      .unique();

    if (!payment) throw new Error(`Payment not found for txRef: ${args.txRef}`);

    // Idempotent: already processed
    if (payment.status === "successful") {
      return { paymentId: payment._id, alreadyProcessed: true };
    }

    // Amount sanity check (Flutterwave amounts can include fees rounding)
    if (args.amountPaid < payment.amountExpected) {
      await ctx.db.patch(payment._id, {
        status: "failed",
        completedAt: Date.now(),
        amountPaid: args.amountPaid,
      });
      throw new Error(
        `Amount paid (${args.amountPaid}) is less than expected (${payment.amountExpected})`
      );
    }

    await ctx.db.patch(payment._id, {
      status: "successful",
      amountPaid: args.amountPaid,
      flutterwaveTransactionId: args.flutterwaveTransactionId,
      paymentMethod: args.paymentMethod,
      completedAt: Date.now(),
    });

    // Create enrollments + earnings for each course
    for (const item of payment.items) {
      // Enroll student (idempotent)
      const existingEnrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_user_course", (q) =>
          q.eq("userId", payment.userId).eq("courseId", item.courseId)
        )
        .first();

      if (!existingEnrollment) {
        await ctx.db.insert("enrollments", {
          userId: payment.userId,
          courseId: item.courseId,
          status: "active",
          enrolledAt: Date.now(),
        });

        const course = await ctx.db.get(item.courseId);
        if (course) {
          await ctx.db.patch(item.courseId, {
            studentsEnrolled: (course.studentsEnrolled || 0) + 1,
          });
        }
      }

      // Idempotent earnings: skip if an earning already exists for this payment+course
      const existingEarning = await ctx.db
        .query("earnings")
        .withIndex("by_payment", (q) => q.eq("paymentId", payment._id))
        .filter((q) => q.eq(q.field("courseId"), item.courseId))
        .first();
      if (existingEarning) continue;

      const instructorAmount = Math.round(item.price * INSTRUCTOR_SHARE);
      const platformAmount = item.price - instructorAmount;

      await ctx.db.insert("earnings", {
        instructorId: item.instructorId,
        paymentId: payment._id,
        courseId: item.courseId,
        studentId: payment.userId,
        coursePrice: item.price,
        instructorAmount,
        platformAmount,
        status: "available",
        createdAt: Date.now(),
      });
    }

    return { paymentId: payment._id, alreadyProcessed: false };
  },
});

/**
 * Mark a payment as failed/cancelled. Idempotent.
 */
export const failPayment = mutation({
  args: {
    serverSecret: v.string(),
    txRef: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireServerSecret(args.serverSecret);
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_tx_ref", (q) => q.eq("txRef", args.txRef))
      .unique();

    if (!payment) throw new Error(`Payment not found for txRef: ${args.txRef}`);
    if (payment.status === "successful") return payment._id; // Never downgrade a successful payment

    await ctx.db.patch(payment._id, {
      status: args.reason === "cancelled" ? "cancelled" : "failed",
      completedAt: Date.now(),
    });
    return payment._id;
  },
});

/**
 * Get payment status by txRef (used by the success page to confirm).
 */
export const getByTxRef = query({
  args: { txRef: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_tx_ref", (q) => q.eq("txRef", args.txRef))
      .unique();
  },
});

/**
 * List a user's payment history.
 */
export const listMyPayments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});
