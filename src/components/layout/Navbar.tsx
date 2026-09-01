"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { GraduationCap, BookOpen, UserCircle, LogOut, ArrowRightLeft, User, ShieldCheck } from "lucide-react";

import { useRef } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

/**
 * Navbar component for ITS-DONE TECH SOLUTION.
 * Minimalist white header with a subtle border on scroll.
 */
const Navbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isSignedIn = !!session;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll effect for border + soft shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const convexUser = useQuery(api.users.getUserByProviderId,
    session?.user?.id ? {
      providerId: session.user.id,
      email: session.user.email ?? undefined
    } : "skip"
  );

  const [isSwitching, setIsSwitching] = useState(false);

  const updateUserRole = useMutation(api.users.updateUserRole);

  const handleSetRole = async (role: "learner" | "instructor") => {
    if (!session?.user?.id || !convexUser || isSwitching) return;
    if (convexUser.role === role) return;

    setIsSwitching(true);
    try {
      await updateUserRole({
        providerId: session.user.id,
        role: role,
      });
      setUserMenuOpen(false);
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  const { itemCount, items, removeItem, totalPrice } = useCart();
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);

  // Hide Navbar on lesson player routes and admin dashboard
  if (pathname?.includes("/lessons/") || pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200 px-4 sm:px-6 lg:px-8 h-14",
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-white border-b border-slate-100"
      )}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0" aria-label="ITZ-DONE TECH home">
          <Logo width={125} height={34} priority />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium" aria-label="Main navigation">
          <Link href="/courses" className="text-slate-600 hover:text-blue-600 transition-colors">Courses</Link>
          {isSignedIn && <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 transition-colors">Dashboard</Link>}
          <Link href="/mentorship" className="text-slate-600 hover:text-blue-600 transition-colors">Mentorship</Link>
          <Link href="/business" className="text-slate-600 hover:text-blue-600 transition-colors">For Business</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search courses..."
              aria-label="Search courses"
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs w-40 focus:w-52 transition-all outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Cart is a learner feature — hidden for instructor accounts */}
          {convexUser?.role !== "instructor" && (
          <div
            className="relative"
            onMouseEnter={() => setCartPreviewOpen(true)}
            onMouseLeave={() => setCartPreviewOpen(false)}
          >
            <Link href="/cart" aria-label={`Cart, ${itemCount} items`} className="p-1.5 relative block hover:bg-slate-100 rounded-lg transition-colors">
              <ShoppingCart className="w-4 h-4 text-slate-600" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 min-w-3.5 h-3.5 px-0.5 bg-blue-600 text-[9px] text-white rounded-full flex items-center justify-center font-semibold animate-in zoom-in duration-300">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Floating Cart Preview */}
            {cartPreviewOpen && itemCount > 0 && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg p-3 animate-in fade-in zoom-in-95 duration-150 origin-top-right z-[110]">
                <div className="flex items-center justify-between mb-2.5 px-1">
                   <h3 className="font-semibold text-xs text-slate-900">Cart</h3>
                   <span className="text-[11px] text-slate-500">{itemCount} items</span>
                </div>

                <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar mb-2.5">
                   {items.map((item) => (
                      <div key={item.id} className="flex gap-2.5 group/item">
                         <div className="w-14 aspect-video bg-slate-100 rounded overflow-hidden shrink-0 relative">
                            {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                         </div>
                         <div className="flex-grow min-w-0">
                            <p className="font-medium text-xs leading-snug truncate text-slate-800">{item.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">${item.price}</p>
                         </div>
                         <button
                           onClick={() => removeItem(item.id)}
                           aria-label={`Remove ${item.title} from cart`}
                           className="opacity-0 group-hover/item:opacity-100 focus:opacity-100 transition-opacity p-1 text-red-500 hover:bg-red-50 rounded"
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                      </div>
                   ))}
                </div>

                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                   <div className="flex justify-between items-center px-1">
                      <span className="text-xs text-slate-500">Subtotal</span>
                      <span className="font-semibold text-sm text-slate-900">${totalPrice}</span>
                   </div>
                   <Link
                      href="/cart"
                      className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors"
                   >
                      View Cart & Checkout
                   </Link>
                </div>
              </div>
            )}
          </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5">
            {!isSignedIn ? (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Open account menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-1.5 group transition-all"
                >
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="User"
                      width={30}
                      height={30}
                      className="rounded-full ring-2 ring-transparent group-hover:ring-blue-600/30 transition-all"
                    />
                  ) : (
                    <UserCircle className="w-7 h-7 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  )}
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 animate-in fade-in zoom-in-95 duration-150 origin-top-right z-[100]"
                  >
                    {/* User Header */}
                    <div className="px-2.5 py-2 border-b border-slate-100 mb-1.5">
                       <p className="font-semibold text-xs truncate text-slate-900">{session?.user?.name}</p>
                       <p className="text-[11px] text-slate-500 truncate">{session?.user?.email}</p>
                    </div>

                    {/* Role Toggle */}
                    <div className="p-0.5 mb-1.5">
                       <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 px-2 mb-1">Switch Account</p>
                        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-md">
                          <button
                            onClick={() => handleSetRole("instructor")}
                            disabled={isSwitching}
                            className={cn(
                              "flex items-center justify-center gap-1 py-1 rounded text-xs font-medium transition-all",
                              convexUser?.role === "instructor"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700",
                              isSwitching && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <GraduationCap className={cn("w-3 h-3", isSwitching && convexUser?.role !== "instructor" && "animate-spin")} />
                            Instructor
                          </button>
                          <button
                            onClick={() => handleSetRole("learner")}
                            disabled={isSwitching}
                            className={cn(
                              "flex items-center justify-center gap-1 py-1 rounded text-xs font-medium transition-all",
                              convexUser?.role !== "instructor"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700",
                              isSwitching && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <BookOpen className={cn("w-3 h-3", isSwitching && convexUser?.role === "instructor" && "animate-spin")} />
                            Learner
                          </button>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-0.5">
                      {convexUser?.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Profile Settings
                      </Link>

                      <div className="h-px bg-slate-100 mx-2 my-1" />

                      <button
                        onClick={() => { signOut({ callbackUrl: "/login" }); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 px-4 py-2.5 shadow-md animate-in fade-in slide-in-from-top-2 max-h-[calc(100dvh-56px)] overflow-y-auto">
          <nav className="flex flex-col gap-0.5 text-sm font-medium" aria-label="Mobile navigation">
            {/* Mobile search */}
            <div className="flex items-center relative mb-2">
              <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses..."
                aria-label="Search courses"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <Link href="/courses" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-700 hover:text-blue-600">Courses</Link>
            {isSignedIn && (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-2 text-blue-600">
                Dashboard
              </Link>
            )}
            <Link href="/mentorship" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-700 hover:text-blue-600">Mentorship</Link>
            <Link href="/business" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-700 hover:text-blue-600">For Business</Link>
            {isSignedIn && (
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-700 hover:text-blue-600">Profile Settings</Link>
            )}
            {convexUser?.role === "admin" && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 text-red-600">
                Admin Dashboard
              </Link>
            )}
            <div className="h-px bg-slate-100 my-1.5" />

            {!isSignedIn ? (
              <div className="flex flex-col gap-1.5 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-slate-700 rounded-lg border border-slate-200 text-xs"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 bg-blue-600 text-white rounded-lg text-center text-xs hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5 mt-1">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 px-1">Switch Role</p>
                  <button
                    onClick={() => {
                      const targetRole = convexUser?.role === "instructor" ? "learner" : "instructor";
                      handleSetRole(targetRole).then(() => setMobileMenuOpen(false));
                    }}
                    disabled={isSwitching}
                    className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-100 rounded-lg disabled:opacity-50 text-xs"
                  >
                    <ArrowRightLeft className={cn("w-3.5 h-3.5 text-blue-600", isSwitching && "animate-spin")} />
                    <span className="font-medium text-slate-700">
                      {isSwitching ? "Switching..." : `Switch to ${convexUser?.role === "instructor" ? "Learner" : "Instructor"}`}
                    </span>
                  </button>
                </div>

                <div className="h-px bg-slate-100 my-1.5" />

                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/login" });
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-2 text-red-600 font-medium text-xs hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
