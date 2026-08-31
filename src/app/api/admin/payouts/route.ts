import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { SUPER_ADMIN_EMAILS } from "../../../../../convex/constants";
import {
  createFlutterwaveTransfer,
  getAppBaseUrl,
  getConvexMutationSecret,
} from "@/lib/flutterwave";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate + authorize admin
    const session = await auth();
    if (!session?.user?.email || !SUPER_ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const payoutId: string | undefined = body?.payoutId;
    const action: "approve" | "reject" = body?.action;

    if (!payoutId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "payoutId and action ('approve' | 'reject') are required" },
        { status: 400 }
      );
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }
    const convex = new ConvexHttpClient(convexUrl);

    // 2. Fetch the payout and validate its state
    const payouts = await convex.query(api.payouts.adminListPayouts, {});
    const payout = payouts.find((p) => p._id === payoutId);
    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }
    if (payout.status !== "requested") {
      return NextResponse.json(
        { error: `Payout is not in 'requested' state (current: ${payout.status})` },
        { status: 400 }
      );
    }

    // 3. Handle rejection — revert earnings to available
    if (action === "reject") {
      await convex.mutation(api.payouts.failPayout, {
        serverSecret: getConvexMutationSecret(),
        payoutId: payoutId as Id<"payouts">,
        reason: "Rejected by admin",
      });
      return NextResponse.json({ status: "rejected" });
    }

    // 4. Approve: mark processing, then execute the Flutterwave transfer
    await convex.mutation(api.payouts.markPayoutProcessing, {
      serverSecret: getConvexMutationSecret(),
      payoutId: payoutId as Id<"payouts">,
    });

    try {
      const transfer = await createFlutterwaveTransfer({
        accountBank: payout.bankCode ?? "",
        accountNumber: payout.accountNumber ?? "",
        amount: payout.amount,
        currency: "NGN",
        narration: `ITZ-DONE instructor payout ${payout.reference}`,
        reference: payout.reference,
        callbackUrl: `${getAppBaseUrl()}/api/payouts/webhook`,
      });

      await convex.mutation(api.payouts.completePayout, {
        serverSecret: getConvexMutationSecret(),
        payoutId: payoutId as Id<"payouts">,
        flutterwaveTransferId: transfer.data.id,
      });

      return NextResponse.json({ status: "paid", transferId: transfer.data.id });
    } catch (transferError) {
      // Transfer failed — revert the payout and release the earnings
      console.error("[admin/payouts] Transfer failed:", transferError);
      const message =
        transferError instanceof Error ? transferError.message : "Transfer failed";
      await convex.mutation(api.payouts.failPayout, {
        serverSecret: getConvexMutationSecret(),
        payoutId: payoutId as Id<"payouts">,
        reason: message,
      });
      return NextResponse.json({ error: `Transfer failed: ${message}` }, { status: 400 });
    }
  } catch (error) {
    console.error("[admin/payouts] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to process payout";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
