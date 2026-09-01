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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-0.5">Payouts & Revenue</h1>
        <p className="text-slate-500 text-xs">
          Review instructor payout requests and track platform revenue (40% share).
        </p>
      </div>

      {/* Revenue overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-blue-600 text-white rounded-lg p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-100" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-100">
              Platform Revenue
            </p>
          </div>
          <p className="text-2xl font-bold">{formatPrice(overview.platformRevenue)}</p>
          <p className="text-[10px] text-blue-100 mt-1">40% share of all sales</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Instructor Earnings
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatPrice(overview.instructorEarnings)}</p>
          <p className="text-[10px] text-slate-400 mt-1">60% share to instructors</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <Receipt className="w-4 h-4 text-blue-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Payments
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{overview.totalPayments}</p>
          <p className="text-[10px] text-slate-400 mt-1">All-time transactions</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Pending Payouts
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{overview.pendingPayoutCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {formatPrice(overview.pendingPayoutAmount)} awaiting
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          {success}
        </div>
      )}

      {/* Payout requests */}
      <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-slate-900">Payout Requests</h2>
          <div className="flex bg-slate-100 p-0.5 rounded-lg w-fit">
            {["requested", "processing", "paid", "failed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium capitalize transition-all",
                  statusFilter === s
                    ? "bg-white shadow-xs text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {payouts === undefined ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
            <p className="text-xs text-slate-400">
              No {statusFilter} payout requests.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {payouts.map((p) => (
              <div
                key={p._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50/70"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-slate-900">{formatPrice(p.amount)}</p>
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded",
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
                  <p className="text-xs font-medium text-slate-800">{p.instructorName}</p>
                  <p className="text-[11px] text-slate-500">
                    {p.bankName} • {p.accountNumber} ({p.accountName})
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {p.reference} • requested {new Date(p.requestedAt).toLocaleString()}
                  </p>
                  {p.failureReason && (
                    <p className="text-[11px] text-red-600 font-medium">Reason: {p.failureReason}</p>
                  )}
                </div>

                {p.status === "requested" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(p._id, "approve")}
                      disabled={processingId === p._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-xs active:scale-95 disabled:opacity-60 text-xs"
                    >
                      {processingId === p._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Approve & Pay
                    </button>
                    <button
                      onClick={() => handleAction(p._id, "reject")}
                      disabled={processingId === p._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-all active:scale-95 disabled:opacity-60 text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
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
      <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-xs">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Recent Payments</h2>
        {overview.recentPayments.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
            <p className="text-xs text-slate-400">No payments yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {overview.recentPayments.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="min-w-0">
                  <p className="font-medium text-xs text-slate-900">{p.studentName}</p>
                  <p className="text-[11px] text-slate-500">
                    {p.itemCount} course{p.itemCount > 1 ? "s" : ""} •{" "}
                    {new Date(p.completedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-xs text-emerald-600">
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
