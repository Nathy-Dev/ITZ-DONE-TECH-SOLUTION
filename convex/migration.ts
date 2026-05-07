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
// Run via: npx convex run migration:migrateInstructorIds
export const migrateInstructorIds = mutation({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();
    let migratedCount = 0;
    let failedCount = 0;

    for (const course of courses) {
      // If it's already an ID (or looks like one), skip or handle accordingly
      // Since it was a string before, it might be a providerId (like "google-123")
      const currentId = course.instructorId as any;
      
      // Try to find the user with this providerId
      const user = await ctx.db
        .query("users")
        .withIndex("by_provider_id", (q) => q.eq("providerId", currentId))
        .unique();

      if (user) {
        await ctx.db.patch(course._id, {
          instructorId: user._id,
        });
        migratedCount++;
      } else {
        // If not found by providerId, maybe it's already a userId?
        // Or maybe the user was deleted.
        failedCount++;
      }
    }

    return `Successfully migrated ${migratedCount} courses. Failed/Skipped ${failedCount}.`;
  },
});

// Run via: npx convex run migration:cleanInvalidCourses
export const cleanInvalidCourses = mutation({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();
    let deletedCount = 0;

    for (const course of courses) {
      const currentId = course.instructorId as any;
      
      // If it's a string and doesn't look like a Convex ID, or we can't find the user
      // Since we already ran migrateInstructorIds, anything still a string is invalid
      if (typeof currentId === "string") {
        await ctx.db.delete(course._id);
        deletedCount++;
      }
    }

    return `Successfully deleted ${deletedCount} invalid courses.`;
  },
});
