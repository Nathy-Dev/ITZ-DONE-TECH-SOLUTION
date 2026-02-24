import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const getById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    instructorId: v.string(),
    duration: v.string(),
    thumbnailUrl: v.string(),
    category: v.string(),
    level: v.string(),
  },
  handler: async (ctx, args) => {
    const courseId = await ctx.db.insert("courses", {
      ...args,
      studentsEnrolled: 0,
      rating: 0,
    });
    return courseId;
  },
});
