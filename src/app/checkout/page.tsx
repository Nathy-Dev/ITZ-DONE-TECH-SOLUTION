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
    <div className="min-h-screen pt-16 pb-8 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4 group w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Cart
        </Link>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Form & Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-1">Finalize Checkout</h1>
              <p className="text-slate-500 text-xs">
                Complete your enrollment by confirming your order details.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">Secure Payment</h3>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      Powered by Flutterwave
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      You&apos;ll be redirected to Flutterwave&apos;s secure checkout to complete
                      your payment. Card details are handled entirely by Flutterwave. Supports cards, bank transfers, USSD, and more.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      Card • Transfer • USSD • Wallets
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600 text-white p-4 rounded-lg shadow-xs">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-xs text-white">100% Satisfaction Guarantee</h3>
                    <p className="text-blue-100 text-[11px] mt-0.5 leading-relaxed">
                      Not happy with your learning experience? Our 30-day money-back guarantee covers
                      all individual course purchases.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <p className="text-[11px] leading-relaxed">
                By clicking Complete Enrollment, you agree to ITZ-DONE TECH
                SOLUTION&apos;s Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>

          {/* Right Column: Summary & CTA */}
          <div className="lg:block">
            <div className="sticky top-20 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 pb-3">
                <h2 className="text-sm font-bold text-slate-900 mb-4">Order Summary</h2>
                <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 group">
                      <div className="w-16 aspect-video bg-slate-100 rounded overflow-hidden shrink-0 relative">
                        {item.image && (
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-xs text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 pt-0 space-y-4">
                <div className="h-px bg-slate-100 my-2" />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Taxes</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-100 text-slate-900">
                    <span>Total</span>
                    <span className="text-blue-600 font-bold text-base">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  {totalPrice > 0 && (
                    <p className="text-[10px] text-slate-400 text-right">
                      ≈ {formatPrice(ngnToUsd(totalPrice, fxRate), "USD")} • charged in Naira
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || !convexUser}
                  className={cn(
                    "w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-600/20 active:scale-95",
                    isProcessing || !convexUser
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-blue-200" />
                      Complete Enrollment
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <p className="text-[9px] text-center text-slate-400 uppercase tracking-wider">
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
