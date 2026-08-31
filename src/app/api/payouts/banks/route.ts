import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listNigerianBanks } from "@/lib/flutterwave";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await listNigerianBanks();
    // Return a minimal, sorted list for the dropdown
    const banks = result.data
      .map((b) => ({ code: b.code, name: b.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ banks });
  } catch (error) {
    console.error("[payouts/banks] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch banks";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
