import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { getConvexServerClient } from "@/lib/convexServer";
import { getR2Config, clampExpiry } from "@/lib/media";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ mediaId: string }> }) {
  try {
    const mediaId = (await context.params).mediaId as Id<"mediaAssets">;
    const convex = getConvexServerClient();
    // Public marketplace image; sessionless redirect to a short-lived R2 URL.
    const publicImage = await convex.query(api.media.getPublicImage, { mediaId });
    if (!publicImage?.objectKey) return NextResponse.json({ error: "Image unavailable" }, { status: 404 });
    const r2 = getR2Config();
    const url = await getSignedUrl(r2.client, new GetObjectCommand({ Bucket: r2.bucket, Key: publicImage.objectKey, ResponseContentType: publicImage.mimeType, ResponseContentDisposition: "inline" }), { expiresIn: clampExpiry(300) });
    return NextResponse.redirect(url, { status: 307, headers: { "Cache-Control": "public, max-age=300" } });
  } catch (error) {
    console.error("[media/thumbnail]", error);
    return NextResponse.json({ error: "Unable to load image" }, { status: 403 });
  }
}
