import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Helper to check admin access
async function checkAdmin(ctx: any, providerId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_provider_id", (q: any) => q.eq("providerId", providerId))
    .unique();

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

export const getPlatformStats = query({
  args: { providerId: v.string() },
  handler: async (ctx, args) => {
    await checkAdmin(ctx, args.providerId);

    const users = await ctx.db.query("users").collect();
    const courses = await ctx.db.query("courses").collect();
    const enrollments = await ctx.db.query("enrollments").collect();

    const totalUsers = users.length;
    const totalCourses = courses.length;
    const totalEnrollments = enrollments.length;
    
    // Calculate revenue based on actual successful enrollments
    const totalRevenue = enrollments.reduce((sum, enrollment) => {
      const course = courses.find((c) => c._id === enrollment.courseId);
      return sum + (course?.price || 0);
    }, 0);

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
    };
  },
});

export const listUsers = query({
  args: { providerId: v.string() },
  handler: async (ctx, args) => {
    await checkAdmin(ctx, args.providerId);
    return await ctx.db.query("users").order("desc").collect();
  },
});

export const listCourses = query({
  args: { providerId: v.string() },
  handler: async (ctx, args) => {
    await checkAdmin(ctx, args.providerId);
    return await ctx.db.query("courses").order("desc").collect();
  },
});

export const listWaitlist = query({
  args: { providerId: v.string() },
  handler: async (ctx, args) => {
    await checkAdmin(ctx, args.providerId);
    return await ctx.db.query("waitlist").order("desc").collect();
  },
});

export const updateUserRole = mutation({
  args: {
    providerId: v.string(), // The admin's providerId
    targetUserId: v.id("users"), // The user being updated
    newRole: v.string(),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx, args.providerId);

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    await ctx.db.patch(args.targetUserId, {
      role: args.newRole,
    });
    return true;
  },
});

export const reviewCourse = mutation({
  args: {
    providerId: v.string(), // The admin's providerId
    courseId: v.id("courses"),
    status: v.string(), // "published" or "rejected"
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx, args.providerId);

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    if (args.status !== "published" && args.status !== "rejected") {
      throw new Error("Invalid status");
    }

    await ctx.db.patch(args.courseId, {
      status: args.status,
      rejectionReason: args.status === "rejected" ? args.rejectionReason : undefined,
      publishedAt: args.status === "published" ? Date.now() : undefined,
    });

    // Find the instructor to get their email
    const instructor = await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", course.instructorId))
      .unique();

    if (instructor && instructor.email) {
      await ctx.scheduler.runAfter(0, internal.emails.sendCourseStatusEmail, {
        email: instructor.email,
        courseTitle: course.title,
        status: args.status,
        rejectionReason: args.status === "rejected" ? args.rejectionReason : undefined,
      });
    }

    return true;
  },
});
