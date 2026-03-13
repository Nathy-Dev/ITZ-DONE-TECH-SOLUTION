import Link from "next/link";
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Zap, CreditCard } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, totalPrice, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
          <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-700" />
        </div>
        <h1 className="text-3xl font-black mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-md mb-10 font-medium">
          Whether you want to master AI, Web Development, or Design, your journey starts with a single course. Browse our catalog and start learning today.
        </p>
        <Link 
          href="/courses" 
          className="px-10 py-4 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 shadow-xl shadow-blue-800/20 transition-all active:scale-95 flex items-center gap-2"
        >
          Browse Courses
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="flex-grow space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black">Shopping Cart</h1>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                {itemCount} {itemCount === 1 ? 'Course' : 'Courses'}
              </span>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 group hover:border-blue-800/20 transition-all"
                >
                  <div className="w-full md:w-48 aspect-video rounded-2xl overflow-hidden relative shadow-md">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 bg-blue-800/10 flex items-center justify-center font-black text-blue-800/20 text-xl">ITZ-DONE</div>
                    )}
                  </div>

                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <h3 className="text-xl font-black mb-1 group-hover:text-blue-800 transition-colors line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium italic">By {item.instructor}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs font-bold text-cyan-500 uppercase tracking-widest mt-4">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        Instant Access
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-800 dark:text-cyan-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Lifetime Update
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                    <div className="text-2xl font-black">${item.price}</div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all group/btn"
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
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-800/10 relative overflow-hidden group">
                {/* Decorative element */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-800/30 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                
                <h2 className="text-xl font-black mb-8 relative z-10">Order Summary</h2>
                
                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>Original Price</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-medium pb-4 border-b border-white/10">
                    <span>Discounts</span>
                    <span className="text-emerald-400">-$0</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-slate-300 font-black uppercase tracking-widest text-xs">Total Amount</span>
                    <span className="text-3xl font-black text-cyan-400">${totalPrice}</span>
                  </div>
                </div>

                <Link 
                  href="/checkout" 
                  className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-50 transition-all shadow-xl flex items-center justify-center gap-2 relative z-10 active:scale-95 group/checkout"
                >
                  Checkout Now
                  <ArrowRight className="w-5 h-5 group-hover/checkout:translate-x-1 transition-transform" />
                </Link>

                <div className="mt-8 flex items-center justify-center gap-4 opacity-30 grayscale relative z-10">
                  <CreditCard className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Secure Payment Processing</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-black mb-4">Promotions</h3>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-800/10 transition-all font-bold text-sm"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-800 transition-colors">
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
