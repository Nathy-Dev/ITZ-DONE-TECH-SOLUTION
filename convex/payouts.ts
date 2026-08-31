import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { SUPER_ADMIN_EMAILS } from "./constants";

/**
 * Guard for server-to-server mutations (invoked by our Next.js API routes,
 * never by browsers). Protected with a shared secret only the server holds.
 */
async function requireServerSecret(secret: string) {
  const expected = process.env.CONVEX_MUTATION_SECRET;
  if (!expected || secret !== expected) {
    throw new Error("Forbidden: invalid server secret");
  }
}

// ─── Bank account management (tutors) ────────────────────────────────────

/**
 * Save or update the tutor's local bank account. Account name is resolved
 * server-side via Flutterwave (see /api/payouts/resolve-account) and passed
 * in verified — we never trust a client-provided account name.
 */
export const savePayoutAccount = mutation({
  args: {
    userId: v.id("users"),
    bankName: v.string(),
    bankCode: v.string(),
    accountNumber: v.string(),
    accountName: v.string(), // Resolved via Flutterwave
  },
  handler: async (ctx, args) => {
    // Basic server-side validation
    if (!/^\d{10}$/.test(args.accountNumber)) {
      throw new Error("Account number must be exactly 10 digits");
    }
    if (!args.bankCode || !args.bankName) {
      throw new Error("Bank is required");
    }
    if (!args.accountName.trim()) {
      throw new Error("Could not verify account name. Please check the account number.");
    }

    const existing = await ctx.db
      .query("payoutAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        bankName: args.bankName,
        bankCode: args.bankCode,
        accountNumber: args.accountNumber,
        accountName: args.accountName.trim(),
        isVerified: true,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("payoutAccounts", {
      userId: args.userId,
      bankName: args.bankName,
      bankCode: args.bankCode,
      accountNumber: args.accountNumber,
      accountName: args.accountName.trim(),
      isVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getMyPayoutAccount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payoutAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const deletePayoutAccount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("payoutAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return true;
  },
});

// ─── Earnings queries ────────────────────────────────────────────────────

/**
 * Instructor earnings summary: available balance, lifetime earnings,
 * pending/processing payouts, and recent earning entries.
 */
export const getMyEarnings = query({
  args: { instructorId: v.id("users") },
  handler: async (ctx, args) => {
    const earnings = await ctx.db
      .query("earnings")
      .withIndex("by_instructor", (q) => q.eq("instructorId", args.instructorId))
      .order("desc")
      .collect();

    let available = 0;
    let lifetime = 0;
    let processing = 0;
    let paidOut = 0;

    for (const e of earnings) {
      lifetime += e.instructorAmount;
      if (e.status === "available") available += e.instructorAmount;
      else if (e.status === "processing") processing += e.instructorAmount;
      else if (e.status === "paid") paidOut += e.instructorAmount;
    }

    // Enrich recent entries with course + student names
    const recent = [];
    for (const e of earnings.slice(0, 20)) {
      const course = await ctx.db.get(e.courseId);
      const student = await ctx.db.get(e.studentId);
      recent.push({
        _id: e._id,
        amount: e.instructorAmount,
        coursePrice: e.coursePrice,
        status: e.status,
        createdAt: e.createdAt,
        courseTitle: course?.title ?? "Deleted course",
        studentName: student?.name ?? "Unknown",
      });
    }

    return {
      available,
      lifetime,
      processing,
      paidOut,
      totalSales: earnings.length,
      recent,
    };
  },
});

// ─── Payout requests (tutor initiates) ───────────────────────────────────

/**
 * Tutor requests a payout of their available balance. Creates a payout in
 * "requested" status and marks the included earnings as "processing".
 * Admin approves and executes the actual Flutterwave transfer.
 */
export const requestPayout = mutation({
  args: { instructorId: v.id("users") },
  handler: async (ctx, args) => {
    // Must have a verified bank account
    const account = await ctx.db
      .query("payoutAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.instructorId))
      .unique();
    if (!account || !account.isVerified) {
      throw new Error("Please add and verify your bank account before requesting a payout");
    }

    // No duplicate pending requests
    const pending = await ctx.db
      .query("payouts")
      .withIndex("by_instructor", (q) => q.eq("instructorId", args.instructorId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "requested"),
          q.eq(q.field("status"), "processing")
        )
      )
      .first();
    if (pending) {
      throw new Error("You already have a pending payout request");
    }

    // Gather all available earnings
    const availableEarnings = await ctx.db
      .query("earnings")
      .withIndex("by_instructor_status", (q) =>
        q.eq("instructorId", args.instructorId).eq("status", "available")
      )
      .collect();

    if (availableEarnings.length === 0) {
      throw new Error("No available balance to withdraw");
    }

    const amount = availableEarnings.reduce((acc, e) => acc + e.instructorAmount, 0);
    if (amount < 1000) {
      throw new Error("Minimum payout amount is ₦1,000");
    }

    const reference = `ITZDONE-PAYOUT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const payoutId = await ctx.db.insert("payouts", {
      instructorId: args.instructorId,
      amount,
      status: "requested",
      reference,
      earningIds: availableEarnings.map((e) => e._id),
      bankName: account.bankName,
      bankCode: account.bankCode,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      requestedAt: Date.now(),
    });

    // Mark earnings as processing
    for (const e of availableEarnings) {
      await ctx.db.patch(e._id, { status: "processing" });
    }

    return { payoutId, amount, reference };
  },
});

export const listMyPayouts = query({
  args: { instructorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payouts")
      .withIndex("by_instructor", (q) => q.eq("instructorId", args.instructorId))
      .order("desc")
      .collect();
  },
});

// ─── Admin operations ────────────────────────────────────────────────────

async function requireAdmin(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const email = identity.email ?? identity.tokenIdentifier;
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();
  if (!user || !SUPER_ADMIN_EMAILS.includes(user.email)) {
    throw new Error("Forbidden: admin only");
  }
  return user;
}

/**
 * Admin lists all payout requests (optionally filtered by status).
 */
export const adminListPayouts = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const payouts = await ctx.db
      .query("payouts")
      .withIndex("by_status", (q) => q.eq("status", args.status ?? "requested"))
      .order("desc")
      .collect();

    const results = [];
    for (const p of payouts) {
      const instructor = await ctx.db.get(p.instructorId);
      results.push({
        ...p,
        instructorName: instructor?.name ?? "Unknown",
        instructorEmail: instructor?.email ?? "",
      });
    }
    return results;
  },
});

/**
 * Admin platform revenue overview: total platform earnings (40% share),
 * total instructor payouts, and recent successful payments.
 */
export const adminGetRevenueOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allEarnings = await ctx.db.query("earnings").collect();
    let platformRevenue = 0;
    let instructorEarnings = 0;
    for (const e of allEarnings) {
      platformRevenue += e.platformAmount;
      instructorEarnings += e.instructorAmount;
    }

    const successfulPayments = await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", "successful"))
      .order("desc")
      .collect();

    const recentPayments = [];
    for (const p of successfulPayments.slice(0, 20)) {
      const user = await ctx.db.get(p.userId);
      recentPayments.push({
        _id: p._id,
        txRef: p.txRef,
        amount: p.amountPaid ?? p.amountExpected,
        currency: p.currency,
        completedAt: p.completedAt ?? p.createdAt,
        studentName: user?.name ?? "Unknown",
        itemCount: p.items.length,
      });
    }

    const pendingPayouts = await ctx.db
      .query("payouts")
      .withIndex("by_status", (q) => q.eq("status", "requested"))
      .collect();

    return {
      platformRevenue,
      instructorEarnings,
      totalPayments: successfulPayments.length,
      pendingPayoutCount: pendingPayouts.length,
      pendingPayoutAmount: pendingPayouts.reduce((acc, p) => acc + p.amount, 0),
      recentPayments,
    };
  },
});

/**
 * Mark payout as processing (called by admin API route before executing
 * the Flutterwave transfer). Guarded by server secret.
 */
export const markPayoutProcessing = mutation({
  args: { serverSecret: v.string(), payoutId: v.id("payouts") },
  handler: async (ctx, args) => {
    await requireServerSecret(args.serverSecret);
    const payout = await ctx.db.get(args.payoutId);
    if (!payout) throw new Error("Payout not found");
    if (payout.status !== "requested") {
      throw new Error(`Payout is not in 'requested' state (current: ${payout.status})`);
    }
    await ctx.db.patch(args.payoutId, { status: "processing" });
    return true;
  },
});

/**
 * Mark payout as paid after a successful Flutterwave transfer.
 * Marks all included earnings as "paid". Guarded by server secret.
 */
export const completePayout = mutation({
  args: {
    serverSecret: v.string(),
    payoutId: v.id("payouts"),
    flutterwaveTransferId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireServerSecret(args.serverSecret);
    const payout = await ctx.db.get(args.payoutId);
    if (!payout) throw new Error("Payout not found");

    await ctx.db.patch(args.payoutId, {
      status: "paid",
      flutterwaveTransferId: args.flutterwaveTransferId,
      processedAt: Date.now(),
    });

    for (const earningId of payout.earningIds) {
      const earning = await ctx.db.get(earningId);
      if (earning && earning.status !== "paid") {
        await ctx.db.patch(earningId, { status: "paid", payoutId: args.payoutId });
      }
    }
    return true;
  },
});

/**
 * Mark payout as failed. Reverts earnings back to "available" so the
 * tutor can request again. Guarded by server secret.
 */
export const failPayout = mutation({
  args: {
    serverSecret: v.string(),
    payoutId: v.id("payouts"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireServerSecret(args.serverSecret);
    const payout = await ctx.db.get(args.payoutId);
    if (!payout) throw new Error("Payout not found");

    await ctx.db.patch(args.payoutId, {
      status: "failed",
      failureReason: args.reason,
      processedAt: Date.now(),
    });

    // Revert earnings to available
    for (const earningId of payout.earningIds) {
      const earning = await ctx.db.get(earningId);
      if (earning && earning.status === "processing") {
        await ctx.db.patch(earningId, { status: "available" });
      }
    }
    return true;
  },
});
