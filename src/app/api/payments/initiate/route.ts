import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  initiateFlutterwavePayment,
  generateTxRef,
  getAppBaseUrl,
  getConvexMutationSecret,
} from "@/lib/flutterwave";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the student
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse course IDs from the request body
    const body = await req.json().catch(() => null);
    const courseIds: string[] = Array.isArray(body?.courseIds) ? body.courseIds : [];
    if (courseIds.length === 0) {
      return NextResponse.json({ error: "No courses provided" }, { status: 400 });
    }

    // 3. Look up the Convex user
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }
    const convex = new ConvexHttpClient(convexUrl);

    const convexUser = await convex.query(api.users.getUserByProviderId, {
      providerId: session.user.id,
      email: session.user.email ?? undefined,
    });
    if (!convexUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // 4. Create a pending payment record (prices computed server-side in Convex)
    const txRef = generateTxRef();
    const paymentId = await convex.mutation(api.payments.createPendingPayment, {
      txRef,
      userId: convexUser._id as Id<"users">,
      courseIds: courseIds as Id<"courses">[],
    });

    // Re-fetch to get the authoritative amount
    const payment = await convex.query(api.payments.getByTxRef, { txRef });
    if (!payment) {
      return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
    }

    // 5. Free courses edge case: no Flutterwave needed
    if (payment.amountExpected === 0) {
      await convex.mutation(api.payments.completePayment, {
        serverSecret: getConvexMutationSecret(),
        txRef,
        amountPaid: 0,
      });
      return NextResponse.json({
        free: true,
        txRef,
        paymentId,
        redirectUrl: `/checkout/success?tx_ref=${txRef}`,
      });
    }

    // 6. Initiate Flutterwave Standard Payment
    const baseUrl = getAppBaseUrl();
    const result = await initiateFlutterwavePayment({
      txRef,
      amount: payment.amountExpected,
      currency: payment.currency,
      redirectUrl: `${baseUrl}/checkout/success?tx_ref=${txRef}`,
      customer: {
        email: session.user.email,
        name: session.user.name ?? convexUser.name,
      },
      customizations: {
        title: "ITZ-DONE TECH SOLUTION",
        description: `Course enrollment (${payment.items.length} course${payment.items.length > 1 ? "s" : ""})`,
      },
    });

    return NextResponse.json({
      free: false,
      txRef,
      paymentId,
      paymentLink: result.data.link,
    });
  } catch (error) {
    console.error("[payments/initiate] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to initiate payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
