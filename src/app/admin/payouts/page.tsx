"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import {
  Loader2,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  AlertCircle,
} from "lucide-react";

export default function AdminPayoutsPage() {
  const { data: session, status } = useSession();

  const overview = useQuery(
    api.payouts.adminGetRevenueOverview,
    session?.user?.email ? {} : "skip"
  );

  const [statusFilter, setStatusFilter] = useState<string>("requested");
  const payouts = useQuery(api.payouts.adminListPayouts, { status: statusFilter });

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAction = async (payoutId: string, action: "approve" | "reject") => {
    setProcessingId(payoutId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to process payout");

      setSuccess(
        action === "approve"
          ? `Payout approved — ${formatPrice(data.transferId ? 1 : 0)} transfer sent to the instructor's bank.`
          : "Payout request rejected. Earnings returned to the instructor's balance."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process payout");
    } finally {
      setProcessingId(null);
    }
  };

  if (status === "loading" || overview === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Payouts & Revenue</h1>
        <p className="text-muted-foreground font-medium">
          Review instructor payout requests and track platform revenue (40% share).
        </p>
      </div>

      {/* Revenue overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 text-white rounded-[24px] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-blue-800/30 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Platform Revenue
              </p>
            </div>
            <p className="text-3xl font-black">{formatPrice(overview.platformRevenue)}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-2">40% of all course sales</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-emerald-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Instructor Earnings
            </p>
          </div>
          <p className="text-3xl font-black">{formatPrice(overview.instructorEarnings)}</p>
          <p className="text-[10px] text-muted-foreground font-bold mt-2">
            60% share owed to instructors
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="w-5 h-5 text-blue-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Successful Payments
            </p>
          </div>
          <p className="text-3xl font-black">{overview.totalPayments}</p>
          <p className="text-[10px] text-muted-foreground font-bold mt-2">All-time via Flutterwave</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Pending Payouts
            </p>
          </div>
          <p className="text-3xl font-black">{overview.pendingPayoutCount}</p>
          <p className="text-[10px] text-muted-foreground font-bold mt-2">
            {formatPrice(overview.pendingPayoutAmount)} awaiting review
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          {success}
        </div>
      )}

      {/* Payout requests */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-black">Payout Requests</h2>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
            {["requested", "processing", "paid", "failed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all",
                  statusFilter === s
                    ? "bg-white dark:bg-slate-900 shadow-sm text-blue-800 dark:text-cyan-400"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {payouts === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-800 animate-spin" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
            <p className="text-muted-foreground font-bold italic">
              No {statusFilter} payout requests.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payouts.map((p) => (
              <div
                key={p._id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border border-slate-50 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-black text-lg">{formatPrice(p.amount)}</p>
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
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
                  <p className="text-sm font-bold">{p.instructorName}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {p.bankName} • {p.accountNumber} ({p.accountName})
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {p.reference} • requested {new Date(p.requestedAt).toLocaleString()}
                  </p>
                  {p.failureReason && (
                    <p className="text-xs text-red-500 font-bold">Reason: {p.failureReason}</p>
                  )}
                </div>

                {p.status === "requested" && (
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleAction(p._id, "approve")}
                      disabled={processingId === p._id}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-800/20 active:scale-95 disabled:opacity-60 text-sm"
                    >
                      {processingId === p._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Approve & Pay
                    </button>
                    <button
                      onClick={() => handleAction(p._id, "reject")}
                      disabled={processingId === p._id}
                      className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-black rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95 disabled:opacity-60 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent payments */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
        <h2 className="text-2xl font-black mb-6">Recent Payments</h2>
        {overview.recentPayments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
            <p className="text-muted-foreground font-bold italic">No payments yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overview.recentPayments.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm">{p.studentName}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {p.itemCount} course{p.itemCount > 1 ? "s" : ""} •{" "}
                    {new Date(p.completedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-emerald-600 dark:text-emerald-400">
                    {formatPrice(p.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{p.txRef}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
