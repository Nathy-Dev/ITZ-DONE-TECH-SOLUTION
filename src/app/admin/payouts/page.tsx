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
  const providerId = session?.user?.id;

  const overview = useQuery(
    api.payouts.adminGetRevenueOverview,
    providerId ? { providerId } : "skip"
  );

  const [statusFilter, setStatusFilter] = useState<string>("requested");
  const payouts = useQuery(
    api.payouts.adminListPayouts,
    providerId ? { providerId, status: statusFilter } : "skip"
  );

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
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Payouts & Revenue</h1>
        <p className="text-muted-foreground font-medium">
          Review instructor payout requests and track platform revenue (40% share).
        </p>
      </div>

      {/* Revenue overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600 text-white rounded-xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-100" />
              <p className="text-xs font-medium uppercase tracking-wide text-blue-100">
                Platform Revenue
              </p>
            </div>
            <p className="text-3xl font-bold">{formatPrice(overview.platformRevenue)}</p>
            <p className="text-xs text-blue-100 mt-2">40% of all course sales</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-emerald-500" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Instructor Earnings
            </p>
          </div>
          <p className="text-3xl font-semibold">{formatPrice(overview.instructorEarnings)}</p>
          <p className="text-[10px] text-muted-foreground font-bold mt-2">
            60% share owed to instructors
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="w-5 h-5 text-blue-500" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Successful Payments
            </p>
          </div>
          <p className="text-3xl font-semibold">{overview.totalPayments}</p>
          <p className="text-[10px] text-muted-foreground font-bold mt-2">All-time via Flutterwave</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Pending Payouts
            </p>
          </div>
          <p className="text-3xl font-semibold">{overview.pendingPayoutCount}</p>
          <p className="text-[10px] text-muted-foreground font-bold mt-2">
            {formatPrice(overview.pendingPayoutAmount)} awaiting review
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          {success}
        </div>
      )}

      {/* Payout requests */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-md shadow-blue-600/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-semibold">Payout Requests</h2>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
            {["requested", "processing", "paid", "failed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all",
                  statusFilter === s
                    ? "bg-white  shadow-sm text-blue-600 "
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
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-muted-foreground font-bold italic">
              No {statusFilter} payout requests.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payouts.map((p) => (
              <div
                key={p._id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border border-slate-50 rounded-2xl bg-slate-50/50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-lg">{formatPrice(p.amount)}</p>
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full",
                        p.status === "paid" &&
                          "bg-emerald-100 text-emerald-700  ",
                        p.status === "requested" &&
                          "bg-amber-100 text-amber-700  ",
                        p.status === "processing" &&
                          "bg-blue-100 text-blue-700  ",
                        p.status === "failed" &&
                          "bg-red-100 text-red-700  "
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
                      className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-800/20 active:scale-95 disabled:opacity-60 text-sm"
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
                      className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-2xl hover:bg-red-100 transition-all active:scale-95 disabled:opacity-60 text-sm"
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
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-md shadow-blue-600/5">
        <h2 className="text-2xl font-semibold mb-6">Recent Payments</h2>
        {overview.recentPayments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-muted-foreground font-bold italic">No payments yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overview.recentPayments.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm">{p.studentName}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {p.itemCount} course{p.itemCount > 1 ? "s" : ""} •{" "}
                    {new Date(p.completedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-emerald-600">
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
