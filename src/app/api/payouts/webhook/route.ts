import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { verifyWebhookSignature, getConvexMutationSecret } from "@/lib/flutterwave";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("verif-hash");

    const isValid = await verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("[payouts/webhook] Invalid signature — rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType: string | undefined = event?.event;
    const data = event?.data;

    if (!data?.reference) {
      return NextResponse.json({ received: true });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }
    const convex = new ConvexHttpClient(convexUrl);

    // Find the payout by its reference
    const payouts = await convex.query(api.payouts.adminListPayouts, {});
    const payout = payouts.find((p) => p.reference === data.reference);
    if (!payout) {
      console.warn(`[payouts/webhook] No payout found for reference ${data.reference}`);
      return NextResponse.json({ received: true });
    }

    if (eventType === "transfer.completed") {
      if (data.status === "SUCCESSFUL") {
        await convex.mutation(api.payouts.completePayout, {
          serverSecret: getConvexMutationSecret(),
          payoutId: payout._id as Id<"payouts">,
          flutterwaveTransferId: data.id ? Number(data.id) : undefined,
        });
      } else if (data.status === "FAILED") {
        await convex.mutation(api.payouts.failPayout, {
          serverSecret: getConvexMutationSecret(),
          payoutId: payout._id as Id<"payouts">,
          reason: data.complete_message ?? "Transfer failed",
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[payouts/webhook] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
