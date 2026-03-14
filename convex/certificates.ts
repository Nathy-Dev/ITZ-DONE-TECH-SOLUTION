import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const issueCertificate = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.id("users"),
    certificateId: v.string(), // Randomly generated on client or server
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Check if user is enrolled
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .unique();

    if (!enrollment) throw new Error("You must be enrolled to receive a certificate");

    // Existing certificate check
    const existing = await ctx.db
      .query("certificates")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("certificates", {
      userId: user._id,
      courseId: args.courseId,
      certificateId: args.certificateId,
      issuedAt: Date.now(),
    });
  },
});

export const getCertificateByCourse = query({
  args: { courseId: v.id("courses"), userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_user_course", (q) => q.eq("userId", args.userId).eq("courseId", args.courseId))
      .unique();
  },
});
