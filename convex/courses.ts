import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Verify the caller (identified by providerId) is allowed to act as an
 * instructor — either has the instructor role or is an admin.
 */
async function requireInstructor(ctx: QueryCtx, providerId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_provider_id", (q) => q.eq("providerId", providerId))
    .unique();
  if (!user) throw new Error("Unauthorized: user not found");
  if (user.role !== "instructor" && user.role !== "admin") {
    throw new Error("Forbidden: only instructors can perform this action");
  }
  return user;
}

/**
 * Verify the caller owns the given course (or is an admin).
 */
async function requireCourseOwner(
  ctx: QueryCtx,
  courseId: Id<"courses">,
  providerId: string
): Promise<{ user: Doc<"users">; course: Doc<"courses"> }> {
  const user = await requireInstructor(ctx, providerId);
  const course = await ctx.db.get(courseId);
  if (!course) throw new Error("Course not found");
  if (user.role !== "admin" && course.instructorId !== user._id) {
    throw new Error("Forbidden: you do not own this course");
  }
  return { user, course };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();
    return courses.filter((c) => c.status === "published" || (!c.status && c.isPublished));
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
    providerId: v.string(),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    instructorId: v.id("users"),
    duration: v.string(),
    thumbnailUrl: v.string(),
    thumbnailMediaId: v.optional(v.id("mediaAssets")),
    category: v.string(),
    level: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireInstructor(ctx, args.providerId);
    // The course must belong to the authenticated instructor
    if (user.role !== "admin" && args.instructorId !== user._id) {
      throw new Error("Forbidden: you can only create courses for yourself");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { providerId, ...courseData } = args;
    const courseId = await ctx.db.insert("courses", {
      ...courseData,
      studentsEnrolled: 0,
      rating: 0,
      isPublished: false,
      status: "draft",
    });
    return courseId;
  },
});

/**
 * Update course details (title, description, price, etc.).
 * Ownership-checked: only the course owner (or an admin) can update.
 */
export const updateCourse = mutation({
  args: {
    providerId: v.string(),
    id: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    duration: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    thumbnailMediaId: v.optional(v.id("mediaAssets")),
    category: v.optional(v.string()),
    level: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCourseOwner(ctx, args.id, args.providerId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, providerId, ...updates } = args;
    await ctx.db.patch(id, updates);
    return true;
  },
});

export const submitForReview = mutation({
  args: { providerId: v.string(), id: v.id("courses") },
  handler: async (ctx, args) => {
    const { course } = await requireCourseOwner(ctx, args.id, args.providerId);

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
