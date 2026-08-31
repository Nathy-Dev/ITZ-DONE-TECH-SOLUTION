import { v } from "convex/values";
import { query } from "./_generated/server";

export const getInstructorStats = query({
  args: { instructorId: v.id("users") },
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("instructorId"), args.instructorId))
      .collect();

    if (courses.length === 0) {
      return {
        totalStudents: 0,
        totalRevenue: 0,
        averageRating: 0,
        totalCourses: 0,
        recentEarnings: [] as { name: string; amount: number }[],
      };
    }

    const totalStudents = courses.reduce((acc, course) => acc + (course.studentsEnrolled || 0), 0);

    // Real instructor revenue: sum of actual earnings records (60% share)
    const earnings = await ctx.db
      .query("earnings")
      .withIndex("by_instructor", (q) => q.eq("instructorId", args.instructorId))
      .collect();
    const totalRevenue = earnings.reduce((acc, e) => acc + e.instructorAmount, 0);

    const ratedCourses = courses.filter(c => (c.rating ?? 0) > 0);
    const averageRating = ratedCourses.length > 0
      ? ratedCourses.reduce((acc, course) => acc + (course.rating || 0), 0) / ratedCourses.length
      : 0;

    // Real monthly earnings for the last 6 months from earnings records
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const recentEarnings: { name: string; amount: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = monthDate.getTime();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1).getTime();
      const monthName = months[monthDate.getMonth()];

      const monthTotal = earnings
        .filter(e => e.createdAt >= monthStart && e.createdAt < monthEnd)
        .reduce((acc, e) => acc + e.instructorAmount, 0);

      recentEarnings.push({ name: monthName, amount: monthTotal });
    }

    return {
      totalStudents,
      totalRevenue,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalCourses: courses.length,
      recentEarnings,
    };
  },
});

export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    const totalCourses = courses.length;
    const totalStudents = courses.reduce((acc, c) => acc + (c.studentsEnrolled || 0), 0);

    const mentors = await ctx.db
      .query("mentorProfiles")
      .collect();
    const totalMentors = mentors.length;

    const reviews = await ctx.db.query("reviews").collect();
    const totalReviews = reviews.length;

    const avgSatisfaction = reviews.length > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 20)
      : 0;

    return {
      totalCourses,
      totalStudents,
      totalMentors,
      totalReviews,
      satisfactionRate: avgSatisfaction,
    };
  },
});
