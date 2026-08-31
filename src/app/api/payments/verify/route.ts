import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { verifyFlutterwaveTransaction, getConvexMutationSecret } from "@/lib/flutterwave";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const txRef: string | undefined = body?.txRef;
    const transactionId: number | undefined = body?.transactionId
      ? Number(body.transactionId)
      : undefined;

    if (!txRef) {
      return NextResponse.json({ error: "txRef is required" }, { status: 400 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }
    const convex = new ConvexHttpClient(convexUrl);

    // Check our DB first — the webhook may have already processed it
    const payment = await convex.query(api.payments.getByTxRef, { txRef });
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "successful") {
      return NextResponse.json({ status: "successful", payment });
    }

    // Not yet processed: verify directly with Flutterwave (requires the
    // transaction_id Flutterwave appends to the redirect URL)
    if (!transactionId) {
      return NextResponse.json({ status: payment.status, payment });
    }

    const verification = await verifyFlutterwaveTransaction(transactionId);
    const tx = verification.data;

    if (tx.tx_ref !== txRef) {
      return NextResponse.json({ error: "Transaction reference mismatch" }, { status: 400 });
    }

    if (tx.status === "successful") {
      await convex.mutation(api.payments.completePayment, {
        serverSecret: getConvexMutationSecret(),
        txRef,
        flutterwaveTransactionId: tx.id,
        amountPaid: tx.amount,
        paymentMethod: tx.payment_type ?? undefined,
      });
      const updated = await convex.query(api.payments.getByTxRef, { txRef });
      return NextResponse.json({ status: "successful", payment: updated });
    }

    if (tx.status === "failed" || tx.status === "cancelled") {
      await convex.mutation(api.payments.failPayment, {
        serverSecret: getConvexMutationSecret(),
        txRef,
        reason: tx.status,
      });
      const updated = await convex.query(api.payments.getByTxRef, { txRef });
      return NextResponse.json({ status: tx.status, payment: updated });
    }

    return NextResponse.json({ status: tx.status, payment });
  } catch (error) {
    console.error("[payments/verify] Error:", error);
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
