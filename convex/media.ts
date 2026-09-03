import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const KINDS = ["video", "document", "image", "avatar"] as const;
const PROVIDERS = ["cloudflare_stream", "cloudflare_r2"] as const;
const STATUSES = ["pending", "processing", "ready", "failed", "deleting", "deleted"] as const;

async function getUser(ctx: QueryCtx | MutationCtx, providerId: string) {
  const user = await ctx.db.query("users").withIndex("by_provider_id", (q) => q.eq("providerId", providerId)).unique();
  if (!user) throw new Error("Unauthorized: user not found");
  return user;
}

async function requireInstructor(ctx: QueryCtx | MutationCtx, providerId: string) {
  const user = await getUser(ctx, providerId);
  if (user.role !== "instructor" && user.role !== "admin") throw new Error("Forbidden: instructor access required");
  return user;
}

async function requireCourseOwner(ctx: QueryCtx | MutationCtx, courseId: Id<"courses">, providerId: string) {
  const user = await requireInstructor(ctx, providerId);
  const course = await ctx.db.get(courseId);
  if (!course) throw new Error("Course not found");
  if (user.role !== "admin" && course.instructorId !== user._id) throw new Error("Forbidden: course ownership required");
  return { user, course };
}

async function validateLessonCourse(ctx: QueryCtx | MutationCtx, lessonId: Id<"lessons">, courseId: Id<"courses">) {
  const lesson = await ctx.db.get(lessonId);
  if (!lesson) throw new Error("Lesson not found");
  const section = await ctx.db.get(lesson.sectionId);
  if (!section || section.courseId !== courseId) throw new Error("Lesson does not belong to course");
  return lesson;
}

function requireServerSecret(serverSecret: string) {
  const expectedSecret = process.env.MEDIA_MUTATION_SECRET ?? process.env.CONVEX_MUTATION_SECRET;
  if (!expectedSecret || serverSecret !== expectedSecret) throw new Error("Unauthorized media operation");
}

export const createPending = mutation({
  args: {
    serverSecret: v.string(), providerId: v.string(), courseId: v.optional(v.id("courses")), lessonId: v.optional(v.id("lessons")),
    kind: v.string(), provider: v.string(), providerAssetId: v.optional(v.string()), objectKey: v.optional(v.string()),
    originalName: v.string(), mimeType: v.string(), sizeBytes: v.number(), visibility: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args.serverSecret);
    if (!KINDS.includes(args.kind as (typeof KINDS)[number])) throw new Error("Invalid media kind");
    if (!PROVIDERS.includes(args.provider as (typeof PROVIDERS)[number])) throw new Error("Invalid media provider");
    if (args.provider === "cloudflare_stream" && args.kind !== "video") throw new Error("Stream assets must be videos");
    if (args.provider === "cloudflare_r2" && args.kind === "video") throw new Error("Video assets must use Stream");
    if (args.kind === "video" && (!args.courseId || !args.lessonId)) throw new Error("Videos must belong to a lesson");
    if (args.kind === "avatar" && (args.courseId || args.lessonId)) throw new Error("Avatars cannot belong to a course");
    if (args.kind !== "video" && args.lessonId) throw new Error("Only videos can be attached to lessons");
    if (!args.originalName.trim() || args.originalName.length > 255) throw new Error("Invalid file name");
    if (args.sizeBytes <= 0 || !Number.isSafeInteger(args.sizeBytes)) throw new Error("Invalid file size");
    const user = await requireInstructor(ctx, args.providerId);
    if (args.courseId) await requireCourseOwner(ctx, args.courseId, args.providerId);
    if (args.lessonId && args.courseId) await validateLessonCourse(ctx, args.lessonId, args.courseId);
    const now = Date.now();
    return await ctx.db.insert("mediaAssets", {
      courseId: args.courseId, lessonId: args.lessonId, ownerId: user._id, kind: args.kind, provider: args.provider,
      providerAssetId: args.providerAssetId, objectKey: args.objectKey, originalName: args.originalName.trim(), mimeType: args.mimeType,
      sizeBytes: args.sizeBytes, status: "pending", visibility: args.visibility, createdAt: now, updatedAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: {
    serverSecret: v.string(), mediaId: v.id("mediaAssets"), status: v.string(), providerAssetId: v.optional(v.string()),
    sizeBytes: v.optional(v.number()), durationSeconds: v.optional(v.number()), failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args.serverSecret);
    if (!STATUSES.includes(args.status as (typeof STATUSES)[number])) throw new Error("Invalid media status");
    const media = await ctx.db.get(args.mediaId);
    if (!media) throw new Error("Media not found");
    if (args.status === "ready" && !(args.providerAssetId ?? media.providerAssetId)) throw new Error("Ready media must have a provider asset");
    const now = Date.now();
    await ctx.db.patch(args.mediaId, {
      status: args.status, providerAssetId: args.providerAssetId ?? media.providerAssetId, objectKey: media.objectKey,
      sizeBytes: args.sizeBytes ?? media.sizeBytes, durationSeconds: args.durationSeconds ?? media.durationSeconds,
      failureReason: args.failureReason, updatedAt: now,
      completedAt: args.status === "ready" ? (media.completedAt ?? now) : media.completedAt,
      deletedAt: args.status === "deleted" ? (media.deletedAt ?? now) : media.deletedAt,
    });
    return true;
  },
});

export const listForCourse = query({
  args: { providerId: v.string(), courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await requireCourseOwner(ctx, args.courseId, args.providerId);
    return await ctx.db.query("mediaAssets").withIndex("by_course", (q) => q.eq("courseId", args.courseId)).order("desc").collect();
  },
});

export const getForPlayback = query({
  args: { mediaId: v.id("mediaAssets"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media || media.kind !== "video" || media.status !== "ready" || !media.courseId) return null;
    const lesson = media.lessonId ? await ctx.db.get(media.lessonId) : null;
    if (lesson?.isFree) return media;
    const enrollment = await ctx.db.query("enrollments").withIndex("by_user_course", (q) => q.eq("userId", args.userId).eq("courseId", media.courseId!)).first();
    return enrollment?.status === "active" ? media : null;
  },
});

export const getForDownload = query({
  args: { mediaId: v.id("mediaAssets"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media || media.kind === "video" || media.status !== "ready") return null;
    if (media.kind === "avatar" && media.ownerId === args.userId) return media;
    if (!media.courseId) return null;
    const lesson = media.lessonId ? await ctx.db.get(media.lessonId) : null;
    if (lesson?.isFree) return media;
    const enrollment = await ctx.db.query("enrollments").withIndex("by_user_course", (q) => q.eq("userId", args.userId).eq("courseId", media.courseId!)).first();
    return enrollment?.status === "active" ? media : null;
  },
});

export const getPublicImage = query({
  args: { mediaId: v.id("mediaAssets") },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media || media.kind !== "image" || media.provider !== "cloudflare_r2" || media.status !== "ready" || media.visibility !== "public" || !media.objectKey) return null;
    return media;
  },
});

export const getImageForAccess = query({
  args: { mediaId: v.id("mediaAssets"), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media || media.kind !== "image" || media.provider !== "cloudflare_r2" || media.status !== "ready") return null;
    if (media.visibility === "public") return media;
    return args.userId && media.ownerId === args.userId ? media : null;
  },
});

export const getAvatarForOwner = query({
  args: { providerId: v.string(), mediaId: v.id("mediaAssets") },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media || media.kind !== "avatar" || media.provider !== "cloudflare_r2" || media.status !== "ready" || !media.objectKey) return null;
    const user = await getUser(ctx, args.providerId);
    return media.ownerId === user._id || user.role === "admin" ? media : null;
  },
});

export const getByIdForOwner = query({
  args: { providerId: v.string(), mediaId: v.id("mediaAssets") },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media) return null;
    const user = await requireInstructor(ctx, args.providerId);
    return user.role === "admin" || media.ownerId === user._id ? media : null;
  },
});

export const markDeleted = mutation({
  args: { providerId: v.string(), mediaId: v.id("mediaAssets") },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media) return false;
    const user = await requireInstructor(ctx, args.providerId);
    if (user.role !== "admin" && media.ownerId !== user._id) throw new Error("Forbidden");
    await ctx.db.patch(args.mediaId, { status: "deleting", updatedAt: Date.now() });
    return true;
  },
});
