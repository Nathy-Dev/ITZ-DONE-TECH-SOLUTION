import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const saveMedia = mutation({
  args: {
    courseId: v.id("courses"),
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("courseMedia", args);
  },
});

export const listMedia = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const media = await ctx.db
      .query("courseMedia")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
      
    return await Promise.all(
      media.map(async (m) => ({
        ...m,
        resolvedUrl: await ctx.storage.getUrl(m.storageId)
      }))
    );
  },
});

export const deleteMedia = mutation({
  args: { id: v.id("courseMedia"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.id);
  },
});
