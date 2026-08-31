import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { verifyWebhookSignature, getConvexMutationSecret } from "@/lib/flutterwave";

export async function POST(req: NextRequest) {
  try {
    // 1. Capture the raw body BEFORE parsing (signature is computed over it)
    const rawBody = await req.text();
    const signature = req.headers.get("verif-hash");

    // 2. Verify the signature — reject anything unsigned/tampered
    const isValid = await verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("[payments/webhook] Invalid signature — rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Parse the event
    const event = JSON.parse(rawBody);
    const eventType: string | undefined = event?.event;
    const data = event?.data;

    if (!data?.tx_ref) {
      return NextResponse.json({ received: true });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error("[payments/webhook] NEXT_PUBLIC_CONVEX_URL not set");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }
    const convex = new ConvexHttpClient(convexUrl);

    // 4. Handle the event. We only trust the webhook payload for the tx_ref;
    //    the actual status is re-verified against Flutterwave's API below.
    if (eventType === "charge.completed" && data.status === "successful") {
      // Defensive: verify the transaction directly with Flutterwave before
      // granting access (protects against forged webhook bodies).
      const { verifyFlutterwaveTransaction } = await import("@/lib/flutterwave");
      const verification = await verifyFlutterwaveTransaction(Number(data.id));
      const tx = verification.data;

      if (tx.status === "successful" && tx.tx_ref === data.tx_ref) {
        await convex.mutation(api.payments.completePayment, {
          serverSecret: getConvexMutationSecret(),
          txRef: tx.tx_ref,
          flutterwaveTransactionId: tx.id,
          amountPaid: tx.amount,
          paymentMethod: tx.payment_type ?? undefined,
        });
      } else {
        console.warn(
          `[payments/webhook] Verification mismatch for tx ${data.id}: status=${tx.status}`
        );
      }
    } else if (eventType === "charge.completed" && data.status === "failed") {
      await convex.mutation(api.payments.failPayment, {
        serverSecret: getConvexMutationSecret(),
        txRef: data.tx_ref,
        reason: "failed",
      });
    }

    // Always 200 so Flutterwave doesn't retry indefinitely
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[payments/webhook] Error:", error);
    // Return 500 so Flutterwave retries the webhook
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
