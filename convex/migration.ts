import { mutation } from "./_generated/server";

// Run via: npx convex run migration:migrateCourses
export const migrateCourses = mutation({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();
    let migratedCount = 0;

    for (const course of courses) {
      if (course.status === undefined) {
        await ctx.db.patch(course._id, {
          status: course.isPublished ? "published" : "draft",
        });
        migratedCount++;
      }
    }

    return `Successfully migrated ${migratedCount} courses.`;
  },
});
