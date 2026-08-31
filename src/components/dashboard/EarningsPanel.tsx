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
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-blue-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Balance cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white rounded-[28px] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-blue-800/30 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-cyan-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Available Balance
              </p>
            </div>
            <p className="text-3xl font-black">{formatPrice(earnings.available)}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-2">
              Your 60% share, ready to withdraw
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Lifetime Earnings
            </p>
          </div>
          <p className="text-3xl font-black">{formatPrice(earnings.lifetime)}</p>
          <p className="text-[10px] text-muted-foreground font-bold mt-2">
            From {earnings.totalSales} course sale{earnings.totalSales === 1 ? "" : "s"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Total Paid Out
            </p>
          </div>
          <p className="text-3xl font-black">{formatPrice(earnings.paidOut)}</p>
          <p className="text-[10px] text-muted-foreground font-bold mt-2">
            {formatPrice(earnings.processing)} processing
          </p>
        </div>
      </div>

      {/* Withdraw card */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-cyan-400 rounded-2xl flex items-center justify-center shrink-0">
              <ArrowDownToLine className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg">Withdraw Earnings</h3>
              {bankAccount ? (
                <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-2">
                  <Landmark className="w-4 h-4" />
                  {bankAccount.bankName} • {bankAccount.accountNumber} ({bankAccount.accountName})
                </p>
              ) : (
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-1">
                  Add your bank account in{" "}
                  <Link href="/profile" className="underline font-bold">
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
              "px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shrink-0",
              requesting || hasPendingRequest || !bankAccount || earnings.available < 1000
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-800 text-white hover:bg-blue-900 shadow-xl shadow-blue-800/20 active:scale-95"
            )}
          >
            {requesting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Requesting…
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Request Payout
              </>
            )}
          </button>
        </div>

        {hasPendingRequest && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            You have a payout request being processed.
          </p>
        )}
        {!bankAccount && (
          <p className="text-xs text-muted-foreground font-bold mt-4">
            Minimum payout: ₦1,000
          </p>
        )}
        {error && (
          <div className="flex items-start gap-3 p-4 mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 p-4 mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            {success}
          </div>
        )}
      </div>

      {/* Recent earnings */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
        <h3 className="font-black text-xl mb-6">Recent Earnings</h3>
        {earnings.recent.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
            <p className="text-muted-foreground font-bold italic">
              No earnings yet. Publish a course and start earning 60% of every sale!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {earnings.recent.map((e) => (
              <div
                key={e._id}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{e.courseTitle}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {e.studentName} • {new Date(e.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-emerald-600 dark:text-emerald-400">
                    +{formatPrice(e.amount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
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
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
          <h3 className="font-black text-xl mb-6">Payout History</h3>
          <div className="space-y-3">
            {payouts.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-slate-400" />
                    {formatPrice(p.amount)}
                    <span className="text-xs text-muted-foreground font-medium">
                      to {p.bankName}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground font-medium truncate">
                    {p.reference} • {new Date(p.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shrink-0",
                    p.status === "paid" &&
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                    p.status === "requested" &&
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    p.status === "processing" &&
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    p.status === "failed" &&
                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
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
