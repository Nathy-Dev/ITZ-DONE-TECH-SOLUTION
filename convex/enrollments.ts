import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createEnrollment = mutation({
  args: {
    courseId: v.id("courses"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if already enrolled
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => 
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .first();

    if (existing) return existing._id;

    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userId,
      courseId: args.courseId,
      status: "active",
      enrolledAt: Date.now(),
    });

    // Increment studentsEnrolled in course
    const course = await ctx.db.get(args.courseId);
    if (course) {
      await ctx.db.patch(args.courseId, {
        studentsEnrolled: (course.studentsEnrolled || 0) + 1,
      });
    }

    return enrollmentId;
  },
});

export const getEnrollment = query({
  args: {
    courseId: v.id("courses"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => 
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .first();
  },
});

export const listMyEnrollments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const results = [];
    for (const enrollment of enrollments) {
      const course = await ctx.db.get(enrollment.courseId);
      if (course) {
        // Fetch progress
        const completedLessons = await ctx.db
          .query("progress")
          .withIndex("by_user_course", (q) => 
            q.eq("userId", args.userId).eq("courseId", enrollment.courseId)
          )
          .collect();

        const sections = await ctx.db
          .query("sections")
          .withIndex("by_course", (q) => q.eq("courseId", enrollment.courseId))
          .collect();
        
        let totalLessonsCount = 0;
        for (const section of sections) {
          const lessons = await ctx.db
            .query("lessons")
            .withIndex("by_section", (q) => q.eq("sectionId", section._id))
            .collect();
          totalLessonsCount += lessons.length;
        }

        results.push({
          ...enrollment,
          course,
          progress: {
            completedCount: completedLessons.length,
            totalCount: totalLessonsCount,
            percentage: totalLessonsCount > 0 
              ? Math.round((completedLessons.length / totalLessonsCount) * 100) 
              : 0,
          }
        });
      }
    }
    return results;
  },
});
