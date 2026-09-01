"use client";
import Link from "next/link";
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Zap, CreditCard } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, removeItem, totalPrice, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex flex-col items-center justify-center px-4 sm:px-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-md mb-6 font-medium">
          Whether you want to master AI, Web Development, or Design, your journey starts with a single course. Browse our catalog and start learning today.
        </p>
        <Link 
          href="/courses" 
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
        >
          Browse Courses
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-grow space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Shopping Cart</h1>
              <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                {itemCount} {itemCount === 1 ? 'Course' : 'Courses'}
              </span>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5 group hover:border-blue-600/30 transition-colors"
                >
                  <div className="w-full md:w-48 aspect-video rounded-2xl overflow-hidden relative shadow-md">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center font-semibold text-blue-600/20 text-xl">ITS-DONE</div>
                    )}
                  </div>

                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium italic">By {item.instructor}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-blue-600 mt-3">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        Instant Access
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Lifetime Update
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                    <div className="text-xl font-bold">{formatPrice(item.price)}</div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors group/btn"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Summary */}
          <aside className="w-full lg:w-96 shrink-0">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {/* Decorative element */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                
                <h2 className="text-lg font-semibold mb-5">Order Summary</h2>
                
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-slate-500">
                    <span>Original Price</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pb-3 border-b border-slate-100">
                    <span>Discounts</span>
                    <span className="text-emerald-400">-{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-slate-500 text-sm">Total</span>
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <Link 
                  href="/checkout" 
                  className="w-full py-3 bg-white text-slate-950 font-semibold rounded-2xl hover:bg-slate-50 transition-all shadow-md flex items-center justify-center gap-2 relative z-10 active:scale-95 group/checkout"
                >
                  Checkout Now
                  <ArrowRight className="w-5 h-5 group-hover/checkout:translate-x-1 transition-transform" />
                </Link>

                <div className="mt-5 flex items-center justify-center gap-3 text-slate-400">
                  <CreditCard className="w-6 h-6" />
                  <span className="text-[10px] font-medium uppercase tracking-wide">Secure Payment Processing</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold mb-4">Promotions</h3>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/10 transition-all font-bold text-sm"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-medium uppercase tracking-wide rounded-md hover:bg-blue-700 transition-colors">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
