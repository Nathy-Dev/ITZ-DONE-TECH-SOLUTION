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

    const instructor = await ctx.db.get(course.instructorId);

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
  args: { instructorId: v.id("users") },
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
    instructorId: v.id("users"),
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
      status: "draft",
    });
    return courseId;
  },
});

export const submitForReview = mutation({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);
    if (!course) throw new Error("Course not found");

    if (course.status !== "draft" && course.status !== "rejected") {
      throw new Error("Course is not in a valid state to be submitted for review");
    }

    await ctx.db.patch(args.id, {
      status: "in_review",
    });
    
    return true;
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
        let searchQ = q.search("title", args.searchQuery).eq("status", "published");
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
      .withIndex("by_status_category", (q) => q.eq("status", "published"));
    
    if (args.category) {
      q = ctx.db.query("courses")
        .withIndex("by_status_category", (q) => 
          q.eq("status", "published").eq("category", args.category as string)
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

export const listFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_status_category", (q) => q.eq("status", "published"))
      .collect();

    // Sort by students enrolled descending to get the most popular
    courses.sort((a, b) => (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0));

    const limited = courses.slice(0, args.limit ?? 4);

    // Enrich with instructor name and review count
    return await Promise.all(
      limited.map(async (course) => {
        const instructor = await ctx.db.get(course.instructorId);

        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .collect();

        return {
          ...course,
          instructorName: instructor?.name || "Instructor",
          totalReviews: reviews.length,
        };
      })
    );
  },
});

export const getCategoriesWithCounts = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    const counts: Record<string, number> = {};
    for (const course of courses) {
      const cat = course.category || "Other";
      counts[cat] = (counts[cat] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },
});
