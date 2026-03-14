import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mentorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    bio: v.string(),
    expertise: v.array(v.string()),
    hourlyRate: v.number(),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mentorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        bio: args.bio,
        expertise: args.expertise,
        hourlyRate: args.hourlyRate,
        isAvailable: args.isAvailable,
      });
    } else {
      return await ctx.db.insert("mentorProfiles", {
        userId: args.userId,
        bio: args.bio,
        expertise: args.expertise,
        hourlyRate: args.hourlyRate,
        isAvailable: args.isAvailable,
        rating: 0,
        totalSessions: 0,
        createdAt: Date.now(),
      });
    }
  },
});

export const listMentors = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("mentorProfiles")
      .withIndex("by_availability", (q) => q.eq("isAvailable", true))
      .collect();

    return await Promise.all(
      profiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          ...profile,
          user: {
            name: user?.name,
            profileImage: user?.profileImage,
          },
        };
      })
    );
  },
});
