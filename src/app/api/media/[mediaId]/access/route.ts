import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/auth";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getConvexServerClient, getProviderIdFromSession } from "@/lib/convexServer";
import { getR2Config, getStreamConfig, getStreamPlaybackUrl, clampExpiry, safeContentDisposition } from "@/lib/media";

export const runtime = "nodejs";

async function createStreamToken(uid: string) {
  const stream = getStreamConfig();
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${stream.accountId}/stream/${encodeURIComponent(uid)}/token`, {
    method: "POST",
    headers: { Authorization: `Bearer ${stream.apiToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ downloadable: false, exp: Math.floor(Date.now() / 1000) + clampExpiry(600) }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success || !result?.result?.token) throw new Error("Unable to authorize video playback");
  return result.result.token as string;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ mediaId: string }> }) {
  try {
    const session = await auth();
    const providerId = getProviderIdFromSession(session);
    const mediaId: Id<"mediaAssets"> = (await context.params).mediaId as Id<"mediaAssets">;
    const convex = getConvexServerClient();
    const user = await convex.query(api.users.getUserByProviderId, { providerId, email: session?.user?.email ?? undefined });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const media = await convex.query(api.media.getForPlayback, { mediaId, userId: user._id });
    if (media?.provider === "cloudflare_stream" && media.providerAssetId) {
      const token = await createStreamToken(media.providerAssetId);
      return NextResponse.json({ type: "video", url: getStreamPlaybackUrl(media.providerAssetId, token), expiresIn: 600 }, { headers: { "Cache-Control": "private, no-store" } });
    }
    const resource = await convex.query(api.media.getForDownload, { mediaId, userId: user._id });
    if (!resource?.objectKey || resource.provider !== "cloudflare_r2") return NextResponse.json({ error: "Media unavailable" }, { status: 404 });
    if (resource.kind === "avatar") return NextResponse.json({ error: "Avatar access is not available through this endpoint" }, { status: 403 });
    const r2 = getR2Config();
    const url = await getSignedUrl(r2.client, new GetObjectCommand({ Bucket: r2.bucket, Key: resource.objectKey, ResponseContentType: resource.mimeType, ResponseContentDisposition: safeContentDisposition(resource.originalName) }), { expiresIn: clampExpiry(300) });
    return NextResponse.json({ type: "resource", url, expiresIn: 300 }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[media/access]", error);
    const message = error instanceof Error ? error.message : "Unable to authorize media";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 });
  }
}
