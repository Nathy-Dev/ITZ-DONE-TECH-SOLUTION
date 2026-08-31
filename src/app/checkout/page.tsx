"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatPrice, ngnToUsd } from "@/lib/format";
import { useFxRate } from "@/hooks/useFxRate";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items, totalPrice, clearCart, itemCount } = useCart();
  const router = useRouter();
  const fxRate = useFxRate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convexUser = useQuery(
    api.users.getUserByProviderId,
    session?.user?.id
      ? {
          providerId: session.user.id,
          email: session.user.email ?? undefined,
        }
      : "skip"
  );

  if (status === "unauthenticated") {
    redirect("/login?callbackUrl=/checkout");
  }

  // Checkout is a learner flow — instructors don't purchase courses
  if (convexUser?.role === "instructor") {
    redirect("/courses");
  }

  if (itemCount === 0) {
    redirect("/courses");
  }

  const handleCheckout = async () => {
    if (!convexUser) {
      setError("User profile not found. Please try again or re-login.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Ask our server to create a pending payment and get a Flutterwave link.
      //    Prices are computed server-side — the client total is display-only.
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseIds: items.map((i) => i.id) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to initiate payment");
      }

      // 2. Free cart (all courses ₦0): enrollment is done server-side
      if (data.free) {
        clearCart();
        router.push(data.redirectUrl);
        return;
      }

      // 3. Redirect the student to Flutterwave's secure hosted checkout
      clearCart();
      window.location.href = data.paymentLink;
    } catch (err) {
      console.error("Checkout failed:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong during checkout. Please try again."
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-blue-800 transition-colors mb-12 group w-fit"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Cart
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Form & Info */}
          <div className="space-y-12">
            <div>
              <h1 className="text-4xl font-black mb-4">Finalize Checkout</h1>
              <p className="text-muted-foreground font-medium">
                Complete your enrollment by confirming your order details.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-800/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-800 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-800/20">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Secure Payment</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                      Powered by Flutterwave
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      You&apos;ll be redirected to Flutterwave&apos;s secure checkout to complete
                      your payment. Card details are handled entirely by Flutterwave — they never
                      touch our servers. Supports cards, bank transfers, USSD, and more.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 opacity-70">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Card • Transfer • USSD • Wallets
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-800 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-800/20 relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 flex items-start gap-4">
                  <ShieldCheck className="w-8 h-8 text-cyan-400 shrink-0" />
                  <div className="space-y-4">
                    <h3 className="font-black text-xl leading-tight">100% Satisfaction Guarantee</h3>
                    <p className="text-blue-100/80 text-sm font-medium leading-relaxed">
                      Not happy with your learning experience? Our 30-day money-back guarantee covers
                      all individual course purchases.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold leading-relaxed">
                By clicking Complete Enrollment, you agree to ITZ-DONE TECH
                SOLUTION&apos;s Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>

          {/* Right Column: Summary & CTA */}
          <div className="lg:block">
            <div className="sticky top-32 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-8 pb-4">
                <h2 className="text-2xl font-black mb-8">Order Summary</h2>
                <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-20 aspect-video bg-slate-100 rounded-lg overflow-hidden shrink-0 relative">
                        {item.image && (
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-sm truncate group-hover:text-blue-800 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 pt-0 space-y-8 bg-gradient-to-t from-slate-50/50 dark:from-slate-800/30 to-transparent">
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

                <div className="space-y-4 font-bold text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span>Total</span>
                    <span className="text-blue-800 dark:text-cyan-400">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  {totalPrice > 0 && (
                    <p className="text-xs text-muted-foreground font-medium text-right">
                      ≈ {formatPrice(ngnToUsd(totalPrice, fxRate), "USD")} • charged in Naira
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400 text-xs font-bold animate-in shake duration-500">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || !convexUser}
                  className={cn(
                    "w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group/btn",
                    isProcessing || !convexUser
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-black shadow-2xl shadow-black/10 active:scale-95"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                      Complete Enrollment
                      <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                  Secured by Flutterwave • PCI-DSS Compliant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
