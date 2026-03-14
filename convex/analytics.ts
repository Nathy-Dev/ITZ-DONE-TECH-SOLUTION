import { v } from "convex/values";
import { query } from "./_generated/server";

export const getInstructorStats = query({
  args: { instructorId: v.string() },
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
        recentEarnings: [
          { name: "Jan", amount: 0 },
          { name: "Feb", amount: 0 },
          { name: "Mar", amount: 0 },
          { name: "Apr", amount: 0 },
          { name: "May", amount: 0 },
          { name: "Jun", amount: 0 },
        ],
      };
    }

    const totalStudents = courses.reduce((acc, course) => acc + (course.studentsEnrolled || 0), 0);
    const totalRevenue = courses.reduce((acc, course) => acc + (course.price * (course.studentsEnrolled || 0)), 0);
    
    const ratedCourses = courses.filter(c => (c.rating ?? 0) > 0);
    const averageRating = ratedCourses.length > 0 
      ? ratedCourses.reduce((acc, course) => acc + (course.rating || 0), 0) / ratedCourses.length
      : 0;

    // Simulation of monthly earnings for the chart
    // In a real app, this would query an 'orders' or 'transactions' table
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const recentEarnings = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      // Mocking some distribution of existing revenue across recent months
      const amount = totalRevenue > 0 ? (totalRevenue / (6 + Math.random() * 4)) : 0;
      recentEarnings.push({
        name: months[monthIdx],
        amount: Math.round(amount),
      });
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
