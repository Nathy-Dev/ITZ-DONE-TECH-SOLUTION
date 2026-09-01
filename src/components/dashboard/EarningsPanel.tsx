"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
  ArrowDownToLine,
  Landmark,
  AlertCircle,
  Receipt,
} from "lucide-react";
import Link from "next/link";

export default function EarningsPanel() {
  const { data: session } = useSession();

  const convexUser = useQuery(
    api.users.getUserByProviderId,
    session?.user?.id
      ? {
          providerId: session.user.id,
          email: session.user.email ?? undefined,
        }
      : "skip"
  );

  const earnings = useQuery(
    api.payouts.getMyEarnings,
    convexUser?._id ? { instructorId: convexUser._id } : "skip"
  );

  const payouts = useQuery(
    api.payouts.listMyPayouts,
    convexUser?._id ? { instructorId: convexUser._id } : "skip"
  );

  const bankAccount = useQuery(
    api.payouts.getMyPayoutAccount,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const requestPayout = useMutation(api.payouts.requestPayout);

  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasPendingRequest = payouts?.some(
    (p) => p.status === "requested" || p.status === "processing"
  );

  const handleRequestPayout = async () => {
    if (!convexUser) return;
    setRequesting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await requestPayout({ instructorId: convexUser._id });
      setSuccess(
        `Payout request submitted for ${formatPrice(result.amount)}. You'll receive it in your bank account after review.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request payout");
    } finally {
      setRequesting(false);
    }
  };

  if (earnings === undefined || payouts === undefined) {
    return (
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-xs flex items-center justify-center min-h-[150px]">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Balance cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-blue-600 text-white rounded-lg p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-100" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-100">
              Available Balance
            </p>
          </div>
          <p className="text-2xl font-bold">{formatPrice(earnings.available)}</p>
          <p className="text-[10px] text-blue-100 mt-1">
            Your 60% share, ready to withdraw
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Lifetime Earnings
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatPrice(earnings.lifetime)}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            From {earnings.totalSales} sale{earnings.totalSales === 1 ? "" : "s"}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Total Paid Out
            </p>
          </div>
          <p className="text-3xl font-semibold">{formatPrice(earnings.paidOut)}</p>
          <p className="text-[10px] text-muted-foreground font-bold mt-2">
            {formatPrice(earnings.processing)} processing
          </p>
        </div>
      </div>

      {/* Withdraw card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Withdraw Earnings</h3>
              {bankAccount ? (
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-slate-400" />
                  {bankAccount.bankName} • {bankAccount.accountNumber} ({bankAccount.accountName})
                </p>
              ) : (
                <p className="text-xs text-amber-600 mt-0.5">
                  Add your bank account in{" "}
                  <Link href="/profile" className="underline font-semibold hover:text-amber-700">
                    Profile Settings
                  </Link>{" "}
                  to receive payouts.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleRequestPayout}
            disabled={
              requesting ||
              hasPendingRequest ||
              !bankAccount ||
              earnings.available < 1000
            }
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0",
              requesting || hasPendingRequest || !bankAccount || earnings.available < 1000
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20 active:scale-95"
            )}
          >
            {requesting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Requesting…
              </>
            ) : (
              <>
                <Wallet className="w-3.5 h-3.5" />
                Request Payout
              </>
            )}
          </button>
        </div>

        {hasPendingRequest && (
          <p className="text-xs text-amber-600 font-medium mt-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            You have a payout request being processed.
          </p>
        )}
        {!bankAccount && (
          <p className="text-[10px] text-slate-400 mt-2">
            Minimum payout: ₦1,000
          </p>
        )}
        {error && (
          <div className="flex items-start gap-2 p-3 mt-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 p-3 mt-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {success}
          </div>
        )}
      </div>

      {/* Recent earnings */}
      <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-xs">
        <h3 className="font-semibold text-sm text-slate-900 mb-3">Recent Earnings</h3>
        {earnings.recent.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg">
            <p className="text-xs text-slate-400">
              No earnings yet. Publish a course and start earning 60% of every sale!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {earnings.recent.map((e) => (
              <div
                key={e._id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="min-w-0">
                  <p className="font-medium text-xs text-slate-900 truncate">{e.courseTitle}</p>
                  <p className="text-[11px] text-slate-500">
                    {e.studentName} • {new Date(e.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-xs text-emerald-600">
                    +{formatPrice(e.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    of {formatPrice(e.coursePrice)} sale
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout history */}
      {payouts.length > 0 && (
        <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-xs">
          <h3 className="font-semibold text-sm text-slate-900 mb-3">Payout History</h3>
          <div className="space-y-2">
            {payouts.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="min-w-0">
                  <p className="font-medium text-xs text-slate-900 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-slate-400" />
                    {formatPrice(p.amount)}
                    <span className="text-[11px] text-slate-500">
                      to {p.bankName}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {p.reference} • {new Date(p.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shrink-0",
                    p.status === "paid" &&
                      "bg-emerald-50 text-emerald-700",
                    p.status === "requested" &&
                      "bg-amber-50 text-amber-700",
                    p.status === "processing" &&
                      "bg-blue-50 text-blue-700",
                    p.status === "failed" &&
                      "bg-red-50 text-red-700"
                  )}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
