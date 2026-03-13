import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleLessonCompletion = mutation({
  args: {
    lessonId: v.id("lessons"),
    courseId: v.id("courses"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user_lesson", (q) => 
        q.eq("userId", args.userId).eq("lessonId", args.lessonId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { completed: false };
    } else {
      await ctx.db.insert("progress", {
        userId: args.userId,
        courseId: args.courseId,
        lessonId: args.lessonId,
        completedAt: Date.now(),
      });
      return { completed: true };
    }
  },
});

export const getCourseProgress = query({
  args: {
    courseId: v.id("courses"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const completedLessons = await ctx.db
      .query("progress")
      .withIndex("by_user_course", (q) => 
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    // Re-calculating total lessons (could be optimized if stored on course)
    const sections = await ctx.db
      .query("sections")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    
    let totalLessonsCount = 0;
    for (const section of sections) {
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_section", (q) => q.eq("sectionId", section._id))
        .collect();
      totalLessonsCount += lessons.length;
    }

    return {
      completedCount: completedLessons.length,
      totalCount: totalLessonsCount,
      percentage: totalLessonsCount > 0 
        ? Math.round((completedLessons.length / totalLessonsCount) * 100) 
        : 0,
    };
  },
});

export const getCompletedLessonIds = query({
  args: {
    courseId: v.id("courses"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("progress")
      .withIndex("by_user_course", (q) => 
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();
    
    return progress.map(p => p.lessonId);
  },
});
