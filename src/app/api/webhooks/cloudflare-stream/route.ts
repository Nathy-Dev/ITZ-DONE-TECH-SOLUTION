import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { api } from "../../../../../convex/_generated/api";
import { getConvexServerClient, getMediaMutationSecret } from "@/lib/convexServer";
import { getStreamConfig } from "@/lib/media";

export const runtime = "nodejs";

type StreamPayload = {
  uid?: string;
  status?: { state?: string; errorReasonCode?: string; errorReasonText?: string };
  meta?: { mediaId?: string };
  duration?: number;
  input?: { size?: number };
};

function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const timestamp = signature.split(",").find((part) => part.trim().startsWith("time="))?.split("=")[1];
  const provided = signature.split(",").find((part) => part.trim().startsWith("sig1="))?.split("=")[1];
  if (!timestamp || !provided || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return provided.length === expected.length && crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const stream = getStreamConfig();
    if (!stream.webhookSecret || !verifySignature(rawBody, req.headers.get("Webhook-Signature"), stream.webhookSecret)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }
    const payload = JSON.parse(rawBody) as StreamPayload;
    if (!payload.uid || !payload.meta?.mediaId) return NextResponse.json({ received: true });
    const state = payload.status?.state;
    const status = state === "ready" ? "ready" : state === "error" ? "failed" : "processing";
    await getConvexServerClient().mutation(api.media.updateStatus, {
      serverSecret: getMediaMutationSecret(),
      mediaId: payload.meta.mediaId as never,
      status,
      providerAssetId: payload.uid,
      durationSeconds: typeof payload.duration === "number" ? payload.duration : undefined,
      sizeBytes: typeof payload.input?.size === "number" ? payload.input.size : undefined,
      failureReason: status === "failed" ? (payload.status?.errorReasonText || payload.status?.errorReasonCode || "Video processing failed") : undefined,
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhooks/cloudflare-stream]", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
