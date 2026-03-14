import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addReview = mutation({
  args: {
    courseId: v.id("courses"),
    rating: v.number(),
    comment: v.string(),
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

    if (!enrollment) throw new Error("You must be enrolled to leave a review");

    // Check for existing review
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", args.courseId))
      .unique();

    if (existingReview) {
      return await ctx.db.patch(existingReview._id, {
        rating: args.rating,
        comment: args.comment,
        createdAt: Date.now(),
      });
    }

    const reviewId = await ctx.db.insert("reviews", {
      userId: user._id,
      courseId: args.courseId,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    });

    // Update course average rating (simplified for now)
    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const totalRating = allReviews.reduce((acc, rev) => acc + rev.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await ctx.db.patch(args.courseId, {
      rating: averageRating,
    });

    return reviewId;
  },
});

export const getReviewsByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .order("desc")
      .collect();

    return await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          user: {
            name: user?.name || "Anonymous",
            profileImage: user?.profileImage,
          },
        };
      })
    );
  },
});
