import { NextRequest, NextResponse } from "next/server";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getConvexServerClient, getMediaMutationSecret, getProviderIdFromSession } from "@/lib/convexServer";
import { getR2Config, validateMediaInput, MediaKind } from "@/lib/media";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const providerId = getProviderIdFromSession(session);
    const body = await req.json().catch(() => null);
    const mediaId = body?.mediaId;
    const objectKey = body?.objectKey;
    if (typeof mediaId !== "string" || typeof objectKey !== "string") {
      return NextResponse.json({ error: "mediaId and objectKey are required" }, { status: 400 });
    }

    const convex = getConvexServerClient();
    const typedMediaId: Id<"mediaAssets"> = mediaId as Id<"mediaAssets">;
    const media = await convex.query(api.media.getByIdForOwner, { providerId, mediaId: typedMediaId });
    if (!media || media.provider !== "cloudflare_r2" || media.objectKey && media.objectKey !== objectKey) {
      return NextResponse.json({ error: "Media upload not found" }, { status: 404 });
    }

    const r2 = getR2Config();
    if (media.status === "ready") return NextResponse.json({ mediaId, status: "ready" });
    const head = await r2.client.send(new HeadObjectCommand({ Bucket: r2.bucket, Key: objectKey }));
    if (!head.ContentLength || head.ContentLength !== media.sizeBytes || (head.ContentType && head.ContentType !== media.mimeType)) {
      await convex.mutation(api.media.updateStatus, { serverSecret: getMediaMutationSecret(), mediaId: typedMediaId, status: "failed", failureReason: "Uploaded object metadata did not match the upload request" });
      return NextResponse.json({ error: "Uploaded file validation failed" }, { status: 400 });
    }
    validateMediaInput(media.kind as MediaKind, head.ContentType || media.mimeType, head.ContentLength);
    await convex.mutation(api.media.updateStatus, { serverSecret: getMediaMutationSecret(), mediaId: typedMediaId, status: "ready", providerAssetId: media.providerAssetId ?? media.objectKey, sizeBytes: head.ContentLength });
    return NextResponse.json({ mediaId, status: "ready" });
  } catch (error) {
    console.error("[media/file/complete]", error);
    const message = error instanceof Error ? error.message : "Unable to complete upload";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
