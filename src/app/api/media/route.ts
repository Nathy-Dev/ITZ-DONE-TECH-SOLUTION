import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getConvexServerClient, getMediaMutationSecret, getProviderIdFromSession } from "@/lib/convexServer";
import { getR2Config, getStreamConfig } from "@/lib/media";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const providerId = getProviderIdFromSession(session);
    const body = await req.json().catch(() => null);
    if (typeof body?.mediaId !== "string") return NextResponse.json({ error: "mediaId is required" }, { status: 400 });
    const mediaId = body.mediaId as Id<"mediaAssets">;
    const convex = getConvexServerClient();
    const media = await convex.query(api.media.getByIdForOwner, { providerId, mediaId });
    if (!media) return NextResponse.json({ error: "Media not found" }, { status: 404 });
    await convex.mutation(api.media.markDeleted, { providerId, mediaId });
    if (media.provider === "cloudflare_r2" && media.objectKey) {
      const r2 = getR2Config();
      await r2.client.send(new DeleteObjectCommand({ Bucket: r2.bucket, Key: media.objectKey }));
    } else if (media.provider === "cloudflare_stream" && media.providerAssetId) {
      const stream = getStreamConfig();
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${stream.accountId}/stream/${encodeURIComponent(media.providerAssetId)}`, { method: "DELETE", headers: { Authorization: `Bearer ${stream.apiToken}` }, cache: "no-store" });
      if (!response.ok) throw new Error("Provider video deletion failed");
    }
    await convex.mutation(api.media.updateStatus, { serverSecret: getMediaMutationSecret(), mediaId, status: "deleted", providerAssetId: media.providerAssetId ?? media.objectKey });
    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    console.error("[media/delete]", error);
    const message = error instanceof Error ? error.message : "Unable to delete media";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
