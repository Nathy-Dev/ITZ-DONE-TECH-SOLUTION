import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const postMessage = mutation({
  args: {
    lessonId: v.id("lessons"),
    userId: v.id("users"),
    content: v.string(),
    parentMessageId: v.optional(v.id("discussions")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Check if user is enrolled (optional, but recommended for quality)
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const section = await ctx.db.get(lesson.sectionId);
    if (!section) throw new Error("Section not found");

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => q.eq("userId", user._id).eq("courseId", section.courseId))
      .unique();

    if (!enrollment) throw new Error("You must be enrolled to participate in discussions");

    return await ctx.db.insert("discussions", {
      userId: user._id,
      lessonId: args.lessonId,
      content: args.content,
      parentMessageId: args.parentMessageId,
      createdAt: Date.now(),
    });
  },
});

export const getMessagesByLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("discussions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (msg) => {
        const user = await ctx.db.get(msg.userId);
        return {
          ...msg,
          user: {
            name: user?.name || "Anonymous",
            profileImage: user?.profileImage,
          },
        };
      })
    );
  },
});

export const deleteMessage = mutation({
  args: { id: v.id("discussions"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    if (!message) throw new Error("Message not found");

    const user = await ctx.db.get(args.userId);
    if (!user || (user._id !== message.userId && user.role !== "instructor")) {
      throw new Error("Permission denied");
    }

    // Delete replies as well
    const replies = await ctx.db
      .query("discussions")
      .withIndex("by_parent", (q) => q.eq("parentMessageId", args.id))
      .collect();

    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }

    await ctx.db.delete(args.id);
  },
});
