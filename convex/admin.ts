import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    
    // In a real app, revenue might be tracked in a separate payments table.
    // For now, we estimate based on course price * students enrolled, or similar.
    const totalRevenue = courses.reduce((sum, course) => {
      return sum + ((course.price || 0) * (course.studentsEnrolled || 0));
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

export const toggleCoursePublishStatus = mutation({
  args: {
    providerId: v.string(), // The admin's providerId
    courseId: v.id("courses"),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx, args.providerId);

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    await ctx.db.patch(args.courseId, {
      isPublished: args.isPublished,
    });
    return true;
  },
});
