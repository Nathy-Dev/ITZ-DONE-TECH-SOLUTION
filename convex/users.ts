import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { SUPER_ADMIN_EMAILS } from "./constants";

/**
 * Real notifications for a user, derived from platform activity:
 * - Course status changes (published/rejected) for instructors
 * - New enrollments in an instructor's courses
 * - Payout status changes for instructors
 * - Successful payment confirmations for students
 */
export const getMyNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    const notifications: {
      id: string;
      type: string;
      title: string;
      message: string;
      createdAt: number;
    }[] = [];

    const isInstructor = user.role === "instructor" || user.role === "admin";

    if (isInstructor) {
      // Course status changes on my courses
      const myCourses = await ctx.db
        .query("courses")
        .filter((q) => q.eq(q.field("instructorId"), args.userId))
        .collect();

      for (const course of myCourses) {
        if (course.status === "published" && course.publishedAt) {
          notifications.push({
            id: `course-published-${course._id}`,
            type: "success",
            title: "Course Published!",
            message: `"${course.title}" is now live and open for enrollments.`,
            createdAt: course.publishedAt,
          });
        }
        if (course.status === "rejected") {
          notifications.push({
            id: `course-rejected-${course._id}`,
            type: "warning",
            title: "Course Needs Changes",
            message: `"${course.title}" was sent back: ${course.rejectionReason ?? "please review the guidelines"}.`,
            createdAt: course.publishedAt ?? Date.now(),
          });
        }
      }

      // Recent sales (last 10 earnings)
      const earnings = await ctx.db
        .query("earnings")
        .withIndex("by_instructor", (q) => q.eq("instructorId", args.userId))
        .order("desc")
        .take(10);
      for (const e of earnings) {
        const course = await ctx.db.get(e.courseId);
        notifications.push({
          id: `earning-${e._id}`,
          type: "success",
          title: "New Sale!",
          message: `You earned ₦${e.instructorAmount.toLocaleString()} from "${course?.title ?? "a course"}".`,
          createdAt: e.createdAt,
        });
      }

      // Payout updates
      const payouts = await ctx.db
        .query("payouts")
        .withIndex("by_instructor", (q) => q.eq("instructorId", args.userId))
        .order("desc")
        .take(10);
      for (const p of payouts) {
        if (p.status === "paid") {
          notifications.push({
            id: `payout-paid-${p._id}`,
            type: "success",
            title: "Payout Sent",
            message: `₦${p.amount.toLocaleString()} was sent to your ${p.bankName ?? "bank"} account.`,
            createdAt: p.processedAt ?? p.requestedAt,
          });
        } else if (p.status === "failed") {
          notifications.push({
            id: `payout-failed-${p._id}`,
            type: "warning",
            title: "Payout Failed",
            message: `Payout of ₦${p.amount.toLocaleString()} failed: ${p.failureReason ?? "unknown error"}.`,
            createdAt: p.processedAt ?? p.requestedAt,
          });
        } else if (p.status === "requested") {
          notifications.push({
            id: `payout-requested-${p._id}`,
            type: "info",
            title: "Payout Requested",
            message: `Your ₦${p.amount.toLocaleString()} payout request is awaiting review.`,
            createdAt: p.requestedAt,
          });
        }
      }
    }

    // Student: payment confirmations
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);
    for (const p of payments) {
      if (p.status === "successful") {
        notifications.push({
          id: `payment-${p._id}`,
          type: "success",
          title: "Payment Successful",
          message: `Your enrollment payment of ₦${(p.amountPaid ?? p.amountExpected).toLocaleString()} was confirmed.`,
          createdAt: p.completedAt ?? p.createdAt,
        });
      }
    }

    // Most recent first, capped at 15
    return notifications
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 15);
  },
});


export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getUserByProviderId = query({
  args: { providerId: v.string(), email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", args.providerId))
      .unique();

    if (!user && args.email) {
      const email = args.email;
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();
    }
    if (!user) return null;

    const isSuperAdmin = !!(user.email && SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === user.email?.toLowerCase()));
    const isAdmin = isSuperAdmin || user.role === "admin";

    return {
      ...user,
      isAdmin,
    };
  },
});

export const createOrUpdateUser = mutation({
  args: {
    providerId: v.string(),
    email: v.string(),
    name: v.string(),
    profileImage: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Try to find user by providerId (OAuth case)
    let user = await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", args.providerId))
      .unique();

    // 2. If not found, try to find by email (Link OAuth to existing Credentials or vice-versa)
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();
    }

    if (user) {
      // Update existing user without wiping selected role
      await ctx.db.patch(user._id, {
        name: args.name,
        email: args.email,
        profileImage: args.profileImage,
        providerId: args.providerId,
      });
    } else {
      // Create new user
      const isSuperAdmin = SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === args.email.toLowerCase());
      await ctx.db.insert("users", {
        providerId: args.providerId,
        name: args.name,
        email: args.email,
        profileImage: args.profileImage,
        role: args.role ?? (isSuperAdmin ? "instructor" : "learner"),
      });
    }

  },
});

export const registerUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      throw new Error("User already exists");
    }

    const isSuperAdmin = SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === args.email.toLowerCase());
    return await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name,
      providerId: args.email, // Use email as providerId for uniqueness
      role: isSuperAdmin ? "admin" : "learner",
    });
  },
});

export const deleteUser = mutation({
  args: { providerId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", args.providerId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

export const updateUserRole = mutation({
  args: { 
    providerId: v.string(),
    role: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let user = null;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    }
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_provider_id", (q) => q.eq("providerId", args.providerId))
        .unique();
    }
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.providerId))
        .unique();
    }

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      role: args.role,
    });
    
    return args.role;
  },
});

/**
 * Change password for credential-based accounts. Verifies the current
 * password before setting the new one. The password is hashed server-side.
 */
export const changePassword = mutation({
  args: {
    providerId: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let user = null;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    }
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_provider_id", (q) => q.eq("providerId", args.providerId))
        .unique();
    }
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.providerId))
        .unique();
    }

    if (!user) throw new Error("User not found");
    if (!user.password) {
      throw new Error("This account uses social sign-in and has no password to change");
    }

    // Verify current password (bcryptjs compare)
    const bcrypt = await import("bcryptjs");
    const isCorrect = await bcrypt.compare(args.currentPassword, user.password);
    if (!isCorrect) throw new Error("Current password is incorrect");

    if (args.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }

    const hashed = await bcrypt.hash(args.newPassword, 10);
    await ctx.db.patch(user._id, { password: hashed });
    return true;
  },
});

export const updateProfile = mutation({
  args: {
    providerId: v.string(),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let user = null;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    }
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_provider_id", (q) => q.eq("providerId", args.providerId))
        .unique();
    }
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.providerId))
        .unique();
    }

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<typeof user> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.profileImage !== undefined) updates.profileImage = args.profileImage;

    await ctx.db.patch(user._id, updates);
    return true;
  },
});
