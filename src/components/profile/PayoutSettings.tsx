"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  Landmark,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface Bank {
  code: string;
  name: string;
}

export default function PayoutSettings() {
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

  const savedAccount = useQuery(
    api.payouts.getMyPayoutAccount,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const savePayoutAccount = useMutation(api.payouts.savePayoutAccount);
  const deletePayoutAccount = useMutation(api.payouts.deletePayoutAccount);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);

  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load the bank list from Flutterwave (via our authenticated API)
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const res = await fetch("/api/payouts/banks");
        const data = await res.json();
        if (res.ok && data.banks) {
          setBanks(data.banks);
        }
      } catch {
        // Non-fatal — the dropdown will just be empty
      } finally {
        setBanksLoading(false);
      }
    };
    loadBanks();
  }, []);

  // Resolve the account name whenever a full 10-digit number + bank are entered
  useEffect(() => {
    setResolvedName(null);
    setError(null);

    if (!/^\d{10}$/.test(accountNumber) || !bankCode) return;

    let cancelled = false;
    const resolve = async () => {
      setResolving(true);
      try {
        const res = await fetch("/api/payouts/resolve-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountNumber, bankCode }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.accountName) {
          setResolvedName(data.accountName);
        } else {
          setError(data.error ?? "Could not verify this account. Please check the details.");
        }
      } catch {
        if (!cancelled) setError("Could not verify this account. Please try again.");
      } finally {
        if (!cancelled) setResolving(false);
      }
    };

    const timer = setTimeout(resolve, 600); // debounce
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [accountNumber, bankCode]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convexUser) return;
    if (!resolvedName) {
      setError("Please verify your account number before saving.");
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const bank = banks.find((b) => b.code === bankCode);
      await savePayoutAccount({
        userId: convexUser._id,
        bankName: bank?.name ?? "",
        bankCode,
        accountNumber,
        accountName: resolvedName,
      });
      setSaved(true);
      setAccountNumber("");
      setResolvedName(null);
      setBankCode("");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save bank account");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!convexUser) return;
    setDeleting(true);
    try {
      await deletePayoutAccount({ userId: convexUser._id });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
          <Landmark className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-black text-lg">Payout Account</h3>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
            Receive your 60% course earnings
          </p>
        </div>
      </div>

      {savedAccount ? (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-sm">{savedAccount.accountName}</p>
                <p className="text-xs text-muted-foreground font-bold">
                  {savedAccount.bankName} • {savedAccount.accountNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              Verified — payouts will be sent to this account
            </div>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all disabled:opacity-60"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Remove Account
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Bank selector */}
          <div className="grid gap-2">
            <label htmlFor="bank" className="text-xs font-black uppercase tracking-widest text-slate-500">
              Bank
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                id="bank"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                required
                disabled={banksLoading}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold focus:border-blue-800 dark:focus:border-cyan-400 focus:outline-none transition-colors appearance-none disabled:opacity-60"
              >
                <option value="">
                  {banksLoading ? "Loading banks…" : "Select your bank"}
                </option>
                {banks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account number */}
          <div className="grid gap-2">
            <label htmlFor="accountNumber" className="text-xs font-black uppercase tracking-widest text-slate-500">
              Account Number (10 digits)
            </label>
            <div className="relative">
              <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="accountNumber"
                type="text"
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold focus:border-blue-800 dark:focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder="0123456789"
              />
            </div>
          </div>

          {/* Resolved account name */}
          {resolving && (
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-sm font-bold text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying account…
            </div>
          )}
          {resolvedName && !resolving && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Verified Account Name
                </p>
                <p className="font-black text-sm">{resolvedName}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Bank account saved and verified!
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !resolvedName || !bankCode}
            className={cn(
              "w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all",
              saving || !resolvedName || !bankCode
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-800 text-white hover:bg-blue-900 shadow-lg shadow-blue-800/20 active:scale-95"
            )}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Save & Verify Account
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
            Account details are verified securely via Flutterwave
          </p>
        </form>
      )}
    </div>
  );
}
