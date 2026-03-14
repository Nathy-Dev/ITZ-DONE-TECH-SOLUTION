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

export const getByIdDetailed = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) return null;

    const instructor = await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", course.instructorId))
      .unique();

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_course", (q) => q.eq("courseId", args.id))
      .collect();

    return {
      ...course,
      instructor: instructor ? {
        name: instructor.name,
        profileImage: instructor.profileImage,
        bio: instructor.bio,
      } : null,
      totalReviews: reviews.length,
    };
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
    level: v.optional(v.string()),
    isFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const q = ctx.db.query("courses")
      .withSearchIndex("search_courses", (q) => {
        let searchQ = q.search("title", args.searchQuery).eq("isPublished", true);
        if (args.category) {
          searchQ = searchQ.eq("category", args.category);
        }
        return searchQ;
      });

    const results = await q.collect();

    // Secondary filtering for fields not in search index or complex logic
    return results.filter((course) => {
      const matchesLevel = args.level ? course.level === args.level : true;
      const matchesPrice = args.isFree !== undefined 
        ? (args.isFree ? course.price === 0 : course.price > 0) 
        : true;
      
      return matchesLevel && matchesPrice;
    });
  },
});

export const listFiltered = query({
  args: {
    category: v.optional(v.string()),
    level: v.optional(v.string()),
    isFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("courses")
      .withIndex("by_published_category", (q) => q.eq("isPublished", true));
    
    if (args.category) {
      q = ctx.db.query("courses")
        .withIndex("by_published_category", (q) => 
          q.eq("isPublished", true).eq("category", args.category as string)
        );
    }

    const results = await q.collect();

    return results.filter((course) => {
      const matchesLevel = args.level ? course.level === args.level : true;
      const matchesPrice = args.isFree !== undefined 
        ? (args.isFree ? course.price === 0 : course.price > 0) 
        : true;
      return matchesLevel && matchesPrice;
    });
  },
});
