import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveBankAccount } from "@/lib/flutterwave";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const accountNumber: string | undefined = body?.accountNumber;
    const bankCode: string | undefined = body?.bankCode;

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { error: "accountNumber and bankCode are required" },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        { error: "Account number must be exactly 10 digits" },
        { status: 400 }
      );
    }

    const result = await resolveBankAccount(accountNumber, bankCode);
    return NextResponse.json({
      accountNumber: result.data.account_number,
      accountName: result.data.account_name,
    });
  } catch (error) {
    console.error("[payouts/resolve-account] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to resolve account";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
