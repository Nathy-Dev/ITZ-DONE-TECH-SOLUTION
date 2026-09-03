import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/auth";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getConvexServerClient, getMediaMutationSecret, getProviderIdFromSession } from "@/lib/convexServer";
import { createObjectKey, getR2Config, MediaKind, validateMediaInput } from "@/lib/media";

export const runtime = "nodejs";

const ALLOWED_KINDS = new Set<MediaKind>(["document", "image", "avatar"]);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const providerId = getProviderIdFromSession(session);
    const body = await req.json().catch(() => null);
    const kind = body?.kind as MediaKind;
    const name = typeof body?.name === "string" ? body.name : "";
    const mimeType = typeof body?.mimeType === "string" ? body.mimeType : "";
    const sizeBytes = Number(body?.sizeBytes);
    const courseId = typeof body?.courseId === "string" && body.courseId ? body.courseId as Id<"courses"> : undefined;
    const lessonId = typeof body?.lessonId === "string" && body.lessonId ? body.lessonId as Id<"lessons"> : undefined;
    if (!ALLOWED_KINDS.has(kind)) return NextResponse.json({ error: "Invalid media kind" }, { status: 400 });
    validateMediaInput(kind, mimeType, sizeBytes);
    if (kind === "document" && !courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    if (kind === "image" && lessonId) return NextResponse.json({ error: "Images cannot be attached to lessons" }, { status: 400 });
    if (kind === "avatar" && (courseId || lessonId)) return NextResponse.json({ error: "Avatars cannot be attached to courses" }, { status: 400 });
    const convex = getConvexServerClient();
    const r2 = getR2Config();
    const objectKey = createObjectKey(kind, crypto.randomUUID(), name, mimeType);
    const mediaId = await convex.mutation(api.media.createPending, {
      serverSecret: getMediaMutationSecret(), providerId, courseId, lessonId, kind,
      provider: "cloudflare_r2", objectKey, originalName: name, mimeType, sizeBytes,
      visibility: kind === "image" || kind === "avatar" ? "public" : "private",
    });
    const uploadUrl = await getSignedUrl(r2.client, new PutObjectCommand({
      Bucket: r2.bucket, Key: objectKey, ContentType: mimeType, ContentLength: sizeBytes,
      Metadata: { mediaid: mediaId },
    }), { expiresIn: 900 });
    return NextResponse.json({ mediaId, uploadUrl, objectKey, expiresIn: 900 });
  } catch (error) {
    console.error("[media/file/upload-initiate]", error);
    const message = error instanceof Error ? error.message : "Unable to initialize upload";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
