"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  CheckCircle2,
  Loader2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { formatPrice } from "@/lib/format";

const MAX_VERIFY_ATTEMPTS = 6;

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-16 h-16 text-blue-800 animate-spin mb-8" />
          <p className="text-muted-foreground font-medium">Loading checkout…</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const txRef = searchParams.get("tx_ref") ?? searchParams.get("txRef");
  const transactionId = searchParams.get("transaction_id");

  // Live payment record from Convex (reactive — updates when the webhook lands)
  const payment = useQuery(api.payments.getByTxRef, txRef ? { txRef } : "skip");

  // Server-side verification attempts (fallback when webhook is delayed)
  const [attempts, setAttempts] = useState(0);
  const [verifying, setVerifying] = useState(false);

  const verify = useCallback(async () => {
    if (!txRef || verifying) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txRef, transactionId }),
      });
      const data = await res.json();
      // The Convex `payment` query updates reactively once the server
      // processes the payment, so we only need to track attempt count here.
      if (data.error) {
        console.warn("[checkout/success] verify error:", data.error);
      }
    } catch (err) {
      console.warn("[checkout/success] verify request failed:", err);
    } finally {
      setVerifying(false);
      setAttempts((a) => a + 1);
    }
  }, [txRef, transactionId, verifying]);

  // Kick off verification on mount
  useEffect(() => {
    void verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txRef]);

  // ── Derived UI state (no setState in effects) ──────────────────────────
  const status = payment?.status;

  const isTimedOut =
    attempts >= MAX_VERIFY_ATTEMPTS &&
    status !== "successful" &&
    status !== "failed" &&
    status !== "cancelled";

  if (!txRef) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50 dark:bg-slate-950">
        <XCircle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-black mb-4">Invalid Checkout Session</h1>
        <p className="text-muted-foreground text-center max-w-md mb-8 font-medium">
          No payment reference was found. Please start your checkout again.
        </p>
        <Link
          href="/courses"
          className="px-8 py-4 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 transition-all"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────
  if (status === "successful") {
    const amount = payment?.amountPaid ?? payment?.amountExpected ?? 0;
    const itemCount = payment?.items?.length ?? 0;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20 animate-in zoom-in duration-500">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-black mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground text-center max-w-md mb-6 font-medium animate-in fade-in duration-1000">
          Welcome to the ITZ-DONE community.{" "}
          {itemCount > 0 && (
            <span>
              You&apos;ve been enrolled in {itemCount} course{itemCount > 1 ? "s" : ""}.
            </span>
          )}{" "}
          Your courses have been added to your dashboard.
        </p>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl px-8 py-6 mb-8 shadow-xl shadow-blue-800/5 space-y-3">
          <div className="flex items-center justify-between gap-12 text-sm font-bold">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="text-blue-800 dark:text-cyan-400 font-black">
              {formatPrice(amount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-12 text-sm font-bold">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-mono text-xs">{txRef}</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="px-10 py-5 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 shadow-2xl shadow-blue-800/30 transition-all active:scale-95 flex items-center gap-3 text-lg"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-8 flex items-center gap-2">
          <AlertCircle className="w-3 h-3" />
          A receipt has been sent to your email
        </p>
      </div>
    );
  }

  // ── Failed / Cancelled ─────────────────────────────────────────────────
  if (status === "failed" || status === "cancelled") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-red-500/20">
          <XCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-black mb-4">Payment Not Completed</h1>
        <p className="text-muted-foreground text-center max-w-md mb-8 font-medium">
          Your payment could not be completed. No charges were made — you can try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/cart"
            className="px-8 py-4 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 transition-all text-center"
          >
            Try Again
          </Link>
          <Link
            href="/courses"
            className="px-8 py-4 bg-slate-100 dark:bg-slate-800 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  // ── Timeout (still unconfirmed after several attempts) ─────────────────
  if (isTimedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-amber-500/20">
          <AlertCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-black mb-4">Still Confirming Your Payment</h1>
        <p className="text-muted-foreground text-center max-w-md mb-4 font-medium">
          We&apos;re taking longer than usual to confirm your payment. If you were debited, your
          enrollment will appear in your dashboard within a few minutes.
        </p>
        <p className="text-xs text-slate-400 font-bold mb-8 flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Reference: {txRef}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              setAttempts(0);
              void verify();
            }}
            className="px-8 py-4 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 transition-all"
          >
            Check Again
          </button>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-slate-100 dark:bg-slate-800 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Pending / Verifying ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50 dark:bg-slate-950">
      <Loader2 className="w-16 h-16 text-blue-800 animate-spin mb-8" />
      <h1 className="text-3xl font-black mb-4">Confirming Your Payment…</h1>
      <p className="text-muted-foreground text-center max-w-md font-medium">
        We&apos;re verifying your payment with Flutterwave. This usually takes a few seconds —
        please don&apos;t close this page.
      </p>
      <p className="text-xs text-slate-400 font-bold mt-6 flex items-center gap-2">
        <Receipt className="w-4 h-4" />
        Reference: {txRef}
      </p>
      <button
        onClick={() => void verify()}
        disabled={verifying}
        className="mt-8 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm disabled:opacity-60"
      >
        {verifying ? "Checking…" : "Check Status"}
      </button>
    </div>
  );
}
