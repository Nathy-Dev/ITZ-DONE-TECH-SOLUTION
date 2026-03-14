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

export const listByInstructor = query({
  args: { instructorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("instructorId"), args.instructorId))
      .collect();
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
      isPublished: false,
    });
    return courseId;
  },
});

export const togglePublish = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) throw new Error("Course not found");

    const newStatus = !course.isPublished;
    await ctx.db.patch(args.id, {
      isPublished: newStatus,
      publishedAt: newStatus ? Date.now() : undefined,
    });
    return newStatus;
  },
});

export const search = query({
  args: {
    searchQuery: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const q = (ctx.db.query("courses") as any).withSearchIndex("search_courses", (q: any) => {
      let searchQ = q.search("title", args.searchQuery);
      if (args.category) {
        searchQ = searchQ.eq("category", args.category);
      }
      return searchQ;
    });

    // Only return published courses in public search
    const results = await q.collect();
    return results.filter((course: any) => course.isPublished);
  },
});
