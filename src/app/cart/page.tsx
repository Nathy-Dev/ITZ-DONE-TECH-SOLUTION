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
      <div className="min-h-screen pt-16 pb-8 flex flex-col items-center justify-center px-4 sm:px-6 text-center bg-slate-50">
        <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-4 shadow-xs">
          <ShoppingCart className="w-7 h-7 text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-slate-500 max-w-sm mb-5 text-xs">
          Whether you want to master AI, Web Development, or Design, your journey starts with a single course. Browse our catalog and start learning today.
        </p>
        <Link 
          href="/courses" 
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
        >
          Browse Courses
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-8 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items List */}
          <div className="flex-grow space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-slate-900">Shopping Cart</h1>
              <span className="text-xs text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                {itemCount} {itemCount === 1 ? 'Course' : 'Courses'}
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3.5 group hover:border-slate-300 transition-all"
                >
                  <div className="w-full sm:w-36 aspect-video rounded-md overflow-hidden relative shrink-0 bg-slate-900">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="absolute inset-0 bg-blue-50 flex items-center justify-center font-semibold text-blue-600 text-xs">ITS-DONE</div>
                    )}
                  </div>

                  <div className="flex-grow flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">By {item.instructor}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 text-[11px] text-blue-600 mt-2">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-current" />
                        Instant Access
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <ShieldCheck className="w-3 h-3" />
                        Lifetime Update
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-sm sm:text-base font-bold text-slate-900">{formatPrice(item.price)}</div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Summary */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
                <h2 className="text-sm font-bold text-slate-900 mb-3">Order Summary</h2>
                
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Original Price</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pb-2 border-b border-slate-100">
                    <span>Discounts</span>
                    <span className="text-emerald-600">-{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-1">
                    <span className="text-slate-700 font-medium">Total</span>
                    <span className="text-lg font-bold text-blue-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <Link 
                  href="/checkout" 
                  className="w-full py-2 px-4 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-1.5 active:scale-95 group/checkout"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-3.5 h-3.5 group-hover/checkout:translate-x-0.5 transition-transform" />
                </Link>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-slate-400">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">Secure Payment Processing</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <h3 className="font-semibold text-xs text-slate-800 mb-2">Promotions</h3>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="Coupon Code" 
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-xs"
                  />
                  <button className="absolute right-1.5 px-2 py-1 bg-blue-600 text-white text-[10px] font-semibold rounded hover:bg-blue-700 transition-colors">
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
