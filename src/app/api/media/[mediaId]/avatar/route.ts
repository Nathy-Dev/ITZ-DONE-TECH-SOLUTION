import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/auth";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getConvexServerClient } from "@/lib/convexServer";
import { getR2Config, clampExpiry } from "@/lib/media";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ mediaId: string }> }) {
  try {
    const session = await auth();
    const providerId = session?.user?.id;
    if (!providerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const mediaId = (await context.params).mediaId as Id<"mediaAssets">;
    const convex = getConvexServerClient();
    const avatar = await convex.query(api.media.getAvatarForOwner, { providerId, mediaId });
    if (!avatar?.objectKey) return NextResponse.json({ error: "Image unavailable" }, { status: 404 });
    const r2 = getR2Config();
    const url = await getSignedUrl(r2.client, new GetObjectCommand({ Bucket: r2.bucket, Key: avatar.objectKey, ResponseContentType: avatar.mimeType, ResponseContentDisposition: "inline" }), { expiresIn: clampExpiry(300) });
    return NextResponse.redirect(url, { status: 307, headers: { "Cache-Control": "private, max-age=60" } });
  } catch (error) {
    console.error("[media/avatar]", error);
    const message = error instanceof Error ? error.message : "Unable to load avatar";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 });
  }
}
