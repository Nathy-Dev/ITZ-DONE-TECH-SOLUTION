"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items, totalPrice, clearCart, itemCount } = useCart();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convexUser = useQuery(api.users.getUserByProviderId, 
    session?.user?.id ? { 
      providerId: session.user.id,
      email: session.user.email ?? undefined 
    } : "skip"
  );

  const createEnrollment = useMutation(api.enrollments.createEnrollment);

  if (status === "unauthenticated") {
    redirect("/login?callbackUrl=/checkout");
  }

  if (itemCount === 0 && !isSuccess) {
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
      // In a real app, you'd integrate Stripe here.
      // For this implementation, we'll simulate a payment and then enroll the user in Convex.
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Enroll user in all courses in cart
      for (const item of items) {
        await createEnrollment({
          userId: convexUser._id,
          courseId: item.id as Id<"courses">
        });
      }

      setIsSuccess(true);
      clearCart();
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err) {
        console.error("Checkout failed:", err);
        setError("Something went wrong during checkout. Please try again.");
    } finally {
        setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20 animate-in zoom-in duration-500">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-black mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700">Payment Successful!</h1>
        <p className="text-muted-foreground text-center max-w-md mb-10 font-medium animate-in fade-in duration-1000">
          Welcome to the ITS-DONE community. Your courses have been added to your dashboard. Preparing your learning environment...
        </p>
        <div className="flex items-center gap-3 text-blue-800 dark:text-cyan-400 font-bold animate-pulse">
           <Loader2 className="w-5 h-5 animate-spin" />
           Navigating to Dashboard
        </div>
      </div>
    );
  }

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
                   <p className="text-muted-foreground font-medium">Complete your enrollment by confirming your order details.</p>
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
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Mock Checkout Experience</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-6 bg-slate-900 rounded flex items-center justify-center overflow-hidden">
                                        <div className="grid grid-cols-2 gap-0.5">
                                            <div className="w-2 h-2 bg-amber-400 rounded-full" />
                                            <div className="w-2 h-2 bg-red-400 rounded-full" />
                                        </div>
                                    </div>
                                    <span className="font-bold text-sm">Visa •••• 4242</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-800 dark:text-cyan-400">Default</span>
                            </div>
                            
                            <p className="text-xs text-muted-foreground text-center font-medium italic">
                                Note: This is a demo environment. No real funds will be deducted.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-800 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-800/20 relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 flex items-start gap-4">
                           <ShieldCheck className="w-8 h-8 text-cyan-400 shrink-0" />
                           <div className="space-y-4">
                              <h3 className="font-black text-xl leading-tight">100% Satisfaction Guarantee</h3>
                              <p className="text-blue-100/80 text-sm font-medium leading-relaxed">
                                Not happy with your learning experience? Our 30-day money-back guarantee covers all individual course purchases.
                              </p>
                           </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-xs font-bold leading-relaxed">
                        By clicking &quot;Complete Enrollment&quot;, you agree to ITS-DONE TECH SOLUTION&apos;s Terms of Service and Privacy Policy.
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
                                    {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                                </div>
                                <div className="flex-grow min-w-0">
                                   <p className="font-bold text-sm truncate group-hover:text-blue-800 transition-colors">{item.title}</p>
                                   <p className="text-xs text-muted-foreground font-medium">{formatPrice(item.price)}</p>
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
                              <span className="text-blue-800 dark:text-cyan-400">{formatPrice(totalPrice)}</span>
                           </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold animate-in shake duration-500">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
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
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
