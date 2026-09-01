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
        <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-slate-50">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Loading checkout…</p>
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-slate-50">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid Checkout Session</h1>
        <p className="text-slate-500 text-xs text-center max-w-xs mb-5">
          No payment reference was found. Please start your checkout again.
        </p>
        <Link
          href="/courses"
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all"
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-slate-50">
        <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mb-5 shadow-sm shadow-emerald-500/20 animate-in zoom-in duration-500">
          <CheckCircle2 className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
          Payment Successful!
        </h1>
        <p className="text-slate-500 text-xs text-center max-w-xs mb-5 animate-in fade-in duration-1000">
          Welcome to the ITZ-DONE community.{" "}
          {itemCount > 0 && (
            <span>You&apos;ve been enrolled in {itemCount} course{itemCount > 1 ? "s" : ""}. </span>
          )}
          Your courses have been added to your dashboard.
        </p>

        <div className="bg-white border border-slate-200 rounded-lg px-5 py-4 mb-5 shadow-xs space-y-2 w-full max-w-xs">
          <div className="flex items-center justify-between gap-6 text-xs">
            <span className="text-slate-500">Amount Paid</span>
            <span className="text-blue-600 font-bold">{formatPrice(amount)}</span>
          </div>
          <div className="flex items-center justify-between gap-6 text-xs border-t border-slate-100 pt-2">
            <span className="text-slate-500">Reference</span>
            <span className="font-mono text-[11px] text-slate-700 truncate max-w-[150px]">{txRef}</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="px-5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-1.5"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-5 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3" />
          A receipt has been sent to your email
        </p>
      </div>
    );
  }

  // ── Failed / Cancelled ─────────────────────────────────────────────────
  if (status === "failed" || status === "cancelled") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-slate-50">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Payment Not Completed</h1>
        <p className="text-slate-500 text-xs text-center max-w-xs mb-5">
          Your payment could not be completed. No charges were made — you can try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/cart"
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all text-center"
          >
            Try Again
          </Link>
          <Link
            href="/courses"
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-all text-center"
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-slate-50">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Still Confirming Your Payment</h1>
        <p className="text-slate-500 text-xs text-center max-w-xs mb-3">
          We&apos;re taking longer than usual. If you were debited, your enrollment will appear in your dashboard within a few minutes.
        </p>
        <p className="text-[10px] text-slate-400 mb-5 flex items-center gap-1.5">
          <Receipt className="w-3 h-3" />
          Ref: {txRef}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setAttempts(0);
              void verify();
            }}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Check Again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-all text-center"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Pending / Verifying ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-slate-50">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
      <h1 className="text-xl font-bold text-slate-900 mb-2">Confirming Your Payment…</h1>
      <p className="text-slate-500 text-xs text-center max-w-xs">
        We&apos;re verifying your payment with Flutterwave. This usually takes a few seconds — please don&apos;t close this page.
      </p>
      <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1.5">
        <Receipt className="w-3 h-3" />
        Ref: {txRef}
      </p>
      <button
        onClick={() => void verify()}
        disabled={verifying}
        className="mt-5 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-all disabled:opacity-60"
      >
        {verifying ? "Checking…" : "Check Status"}
      </button>
    </div>
  );
}
