import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

/**
 * Resolve a Convex storage ID to its public URL. Requires authentication
 * (used by the profile avatar upload flow).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storageId = req.nextUrl.searchParams.get("storageId");
    if (!storageId) {
      return NextResponse.json({ error: "storageId is required" }, { status: 400 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const convex = new ConvexHttpClient(convexUrl);
    const url = await convex.query(api.files.getImageUrl, { storageId });
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[files/url] Error:", error);
    return NextResponse.json({ error: "Failed to resolve URL" }, { status: 400 });
  }
}
