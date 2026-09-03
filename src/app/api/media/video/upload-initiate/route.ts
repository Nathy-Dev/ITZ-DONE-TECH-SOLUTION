import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getMediaMutationSecret, getConvexServerClient, getProviderIdFromSession } from "@/lib/convexServer";
import { getStreamConfig, MediaKind, validateMediaInput } from "@/lib/media";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const providerId = getProviderIdFromSession(session);
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name : "";
    const mimeType = typeof body?.mimeType === "string" ? body.mimeType : "";
    const sizeBytes = Number(body?.sizeBytes);
    const courseId = body?.courseId;
    const lessonId = body?.lessonId;
    if (typeof courseId !== "string" || typeof lessonId !== "string") return NextResponse.json({ error: "courseId and lessonId are required" }, { status: 400 });
    const typedCourseId = courseId as Id<"courses">;
    const typedLessonId = lessonId as Id<"lessons">;
    validateMediaInput("video" as MediaKind, mimeType, sizeBytes);

    const convex = getConvexServerClient();
    const mediaId = await convex.mutation(api.media.createPending, {
      serverSecret: getMediaMutationSecret(),
      providerId,
      courseId: typedCourseId,
      lessonId: typedLessonId,
      kind: "video",
      provider: "cloudflare_stream",
      originalName: name,
      mimeType,
      sizeBytes,
      visibility: "private",
    });
    const stream = getStreamConfig();
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${stream.accountId}/stream/direct_upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${stream.apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        maxDurationSeconds: Number(process.env.CLOUDFLARE_STREAM_MAX_DURATION_SECONDS || 7200),
        meta: { mediaId, courseId: typedCourseId, lessonId: typedLessonId, originalName: name },
        requireSignedURLs: true,
      }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success || !result?.result?.uploadURL || !result?.result?.uid) {
      await convex.mutation(api.media.updateStatus, { serverSecret: getMediaMutationSecret(), mediaId, status: "failed", failureReason: "Unable to create Stream upload session" });
      return NextResponse.json({ error: "Unable to create video upload session" }, { status: 502 });
    }
    await convex.mutation(api.media.updateStatus, { serverSecret: getMediaMutationSecret(), mediaId, status: "processing", providerAssetId: result.result.uid });
    return NextResponse.json({ mediaId, uploadUrl: result.result.uploadURL, providerAssetId: result.result.uid, resumable: true });
  } catch (error) {
    console.error("[media/video/upload-initiate]", error);
    const message = error instanceof Error ? error.message : "Unable to initialize video upload";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
