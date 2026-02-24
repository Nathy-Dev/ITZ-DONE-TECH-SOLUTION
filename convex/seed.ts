import { mutation } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const courses = [
      {
        title: "Mastering Next.js 15: The Complete Full-Stack Guide",
        description: "Learn Next.js 15, TypeScript, and Tailwind CSS by building real-world projects.",
        instructorId: "Nathy Dev",
        rating: 4.9,
        price: 49.99,
        thumbnailUrl: "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?q=80&w=1000",
        category: "Web Development",
        level: "Advanced",
        duration: "24h 45m",
        studentsEnrolled: 1250,
      },
      {
        title: "AI Engineering with Python & OpenAI API",
        description: "Build intelligent applications using Python and the OpenAI API.",
        instructorId: "Sarah Johnson",
        rating: 4.8,
        price: 89.99,
        thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000",
        category: "AI & ML",
        level: "Intermediate",
        duration: "18h 20m",
        studentsEnrolled: 840,
      },
      {
        title: "Modern UI/UX Design with Figma & Framer",
        description: "Master digital product design with Figma and Framer.",
        instructorId: "Alex Rivera",
        rating: 4.7,
        price: 39.99,
        thumbnailUrl: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=1000",
        category: "Design",
        level: "Beginner",
        duration: "12h 15m",
        studentsEnrolled: 2100,
      },
    ];

    for (const course of courses) {
      const existing = await ctx.db
        .query("courses")
        .withIndex("by_title", (q) => q.eq("title", course.title))
        .first();

      if (!existing) {
        await ctx.db.insert("courses", course);
      }
    }
  },
});
