import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Verify the caller (by providerId) owns the course that a section belongs
 * to (or is an admin). Returns the caller's user doc.
 */
async function requireSectionOwner(ctx: QueryCtx, sectionId: Id<"sections">, providerId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_provider_id", (q) => q.eq("providerId", providerId))
    .unique();
  if (!user) throw new Error("Unauthorized: user not found");

  const section = await ctx.db.get(sectionId);
  if (!section) throw new Error("Section not found");

  const course = await ctx.db.get(section.courseId);
  if (!course) throw new Error("Course not found");

  if (user.role !== "admin" && course.instructorId !== user._id) {
    throw new Error("Forbidden: you do not own this course");
  }
  return { user, section, course };
}

/**
 * Verify the caller owns the course (or is an admin).
 */
async function requireCourseOwner(ctx: QueryCtx, courseId: Id<"courses">, providerId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_provider_id", (q) => q.eq("providerId", providerId))
    .unique();
  if (!user) throw new Error("Unauthorized: user not found");

  const course = await ctx.db.get(courseId);
  if (!course) throw new Error("Course not found");

  if (user.role !== "admin" && course.instructorId !== user._id) {
    throw new Error("Forbidden: you do not own this course");
  }
  return { user, course };
}

/**
 * Verify the caller owns the course that a lesson belongs to (or is an admin).
 */
async function requireLessonOwner(ctx: QueryCtx, lessonId: Id<"lessons">, providerId: string) {
  const lesson = await ctx.db.get(lessonId);
  if (!lesson) throw new Error("Lesson not found");
  const { user, course } = await requireSectionOwner(ctx, lesson.sectionId, providerId);
  return { user, course, lesson };
}

// --- Sections ---

export const listSections = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sections")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

export const createSection = mutation({
  args: {
    providerId: v.string(),
    courseId: v.id("courses"),
    title: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireCourseOwner(ctx, args.courseId, args.providerId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { providerId, ...sectionData } = args;
    return await ctx.db.insert("sections", sectionData);
  },
});

export const updateSection = mutation({
  args: {
    providerId: v.string(),
    id: v.id("sections"),
    title: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSectionOwner(ctx, args.id, args.providerId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, providerId, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteSection = mutation({
  args: { providerId: v.string(), id: v.id("sections") },
  handler: async (ctx, args) => {
    await requireSectionOwner(ctx, args.id, args.providerId);

    // Also delete lessons in this section
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_section", (q) => q.eq("sectionId", args.id))
      .collect();
    
    for (const lesson of lessons) {
      await ctx.db.delete(lesson._id);
    }
    
    await ctx.db.delete(args.id);
  },
});

// --- Lessons ---

export const listLessons = query({
  args: { sectionId: v.id("sections") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .collect();
  },
});

export const getLessonById = query({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createLesson = mutation({
  args: {
    providerId: v.string(),
    sectionId: v.id("sections"),
    title: v.string(),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.string()),
    order: v.number(),
    isFree: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireSectionOwner(ctx, args.sectionId, args.providerId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { providerId, ...lessonData } = args;
    return await ctx.db.insert("lessons", lessonData);
  },
});

export const updateLesson = mutation({
  args: {
    providerId: v.string(),
    id: v.id("lessons"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.string()),
    order: v.optional(v.number()),
    isFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireLessonOwner(ctx, args.id, args.providerId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, providerId, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteLesson = mutation({
  args: { providerId: v.string(), id: v.id("lessons") },
  handler: async (ctx, args) => {
    await requireLessonOwner(ctx, args.id, args.providerId);
    await ctx.db.delete(args.id);
  },
});

export const getFirstLesson = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("sections")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    if (sections.length === 0) return null;

    // Sort sections by order
    const sortedSections = sections.sort((a, b) => a.order - b.order);

    for (const section of sortedSections) {
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_section", (q) => q.eq("sectionId", section._id))
        .collect();

      if (lessons.length > 0) {
        // Return the first lesson by order
        return lessons.sort((a, b) => a.order - b.order)[0];
      }
    }

    return null;
  },
});

export const listAllLessonsOrdered = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("sections")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const sortedSections = sections.sort((a, b) => a.order - b.order);
    const allLessons: Doc<"lessons">[] = [];

    for (const section of sortedSections) {
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_section", (q) => q.eq("sectionId", section._id))
        .collect();
      
      const sortedLessons = lessons.sort((a, b) => a.order - b.order);
      allLessons.push(...sortedLessons);
    }

    return allLessons;
  },
});

export const reorderSections = mutation({
  args: {
    providerId: v.string(),
    updates: v.array(v.object({ id: v.id("sections"), order: v.number() }))
  },
  handler: async (ctx, args) => {
    // Verify ownership of every section being reordered
    for (const update of args.updates) {
      await requireSectionOwner(ctx, update.id, args.providerId);
    }
    for (const update of args.updates) {
      await ctx.db.patch(update.id, { order: update.order });
    }
    return true;
  }
});

export const reorderLessons = mutation({
  args: {
    providerId: v.string(),
    updates: v.array(v.object({ id: v.id("lessons"), order: v.number() }))
  },
  handler: async (ctx, args) => {
    // Verify ownership of every lesson being reordered
    for (const update of args.updates) {
      await requireLessonOwner(ctx, update.id, args.providerId);
    }
    for (const update of args.updates) {
      await ctx.db.patch(update.id, { order: update.order });
    }
    return true;
  }
});
