import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const issueCertificate = mutation({
  args: {
    courseId: v.id("courses"),
    certificateId: v.string(), // Randomly generated on client or server
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", identity.subject))
      .unique();

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
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", identity.subject))
      .unique();

    if (!user) return null;

    return await ctx.db
      .query("certificates")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .unique();
  },
});
