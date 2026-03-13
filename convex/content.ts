import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    courseId: v.id("courses"),
    title: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sections", args);
  },
});

export const updateSection = mutation({
  args: {
    id: v.id("sections"),
    title: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteSection = mutation({
  args: { id: v.id("sections") },
  handler: async (ctx, args) => {
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
    sectionId: v.id("sections"),
    title: v.string(),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.string()),
    order: v.number(),
    isFree: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lessons", args);
  },
});

export const updateLesson = mutation({
  args: {
    id: v.id("lessons"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.string()),
    order: v.optional(v.number()),
    isFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteLesson = mutation({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
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
