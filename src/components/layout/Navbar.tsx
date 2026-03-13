"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { GraduationCap, BookOpen, UserCircle, Sun, Moon, LogOut, ArrowRightLeft, User } from "lucide-react";
import { useRef } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * Navbar component for ITZ-DONE TECH SOLUTION.
 */
const Navbar = () => {
  const { data: session } = useSession();
  
  const isSignedIn = !!session;
  const { theme, toggleTheme } = useTheme();
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

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 py-4",
        isScrolled 
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">
            ITZ
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            ITZ-DONE <span className="text-blue-800">TECH</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <Link href="/courses" className="hover:text-cyan-600 transition-colors">Courses</Link>
          {isSignedIn && <Link href="/dashboard" className="hover:text-cyan-600 transition-colors font-bold text-blue-800">Dashboard</Link>}
          <Link href="/mentorship" className="hover:text-cyan-600 transition-colors">Mentorship</Link>
          <Link href="/business" className="hover:text-cyan-600 transition-colors">For Business</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center relative group">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm w-48 focus:w-64 transition-all outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div 
            className="relative"
            onMouseEnter={() => setCartPreviewOpen(true)}
            onMouseLeave={() => setCartPreviewOpen(false)}
          >
            <Link href="/cart" className="p-2 relative block hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-blue-800 text-[10px] text-white rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Floating Cart Preview */}
            {cartPreviewOpen && itemCount > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-[110]">
                <div className="flex items-center justify-between mb-4 px-2">
                   <h3 className="font-black text-sm uppercase tracking-widest">Cart Preview</h3>
                   <span className="text-[10px] font-bold text-muted-foreground">{itemCount} Items</span>
                </div>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-4">
                   {items.map((item) => (
                     <div key={item.id} className="flex gap-3 group/item">
                        <div className="w-16 aspect-video bg-slate-100 rounded-lg overflow-hidden shrink-0 relative">
                           {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                        </div>
                        <div className="flex-grow min-w-0">
                           <p className="font-bold text-[11px] leading-tight truncate">{item.title}</p>
                           <p className="text-[10px] text-muted-foreground mt-1">${item.price}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                     </div>
                   ))}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                   <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subtotal</span>
                      <span className="font-black">${totalPrice}</span>
                   </div>
                   <Link 
                     href="/cart"
                     className="w-full py-3 bg-blue-800 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-900 shadow-lg shadow-blue-800/10 transition-all active:scale-95"
                   >
                     View Cart & Checkout
                   </Link>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {!isSignedIn ? (
              <>
                <Link 
                  href="/login"
                  className="px-4 py-2 text-sm font-medium hover:text-cyan-600 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/register" 
                  className="px-5 py-2.5 bg-blue-800 text-white text-sm font-medium rounded-xl hover:bg-blue-900 shadow-md shadow-blue-800/20 transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button 
                  ref={profileButtonRef}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 group transition-all"
                >
                  {session?.user?.image ? (
                    <Image 
                      src={session.user.image} 
                      alt="User" 
                      width={40} 
                      height={40} 
                      className="rounded-full ring-2 ring-blue-800/10 group-hover:ring-blue-800/30 transition-all" 
                    />
                  ) : (
                    <UserCircle className="w-10 h-10 text-slate-400 group-hover:text-blue-800 transition-colors" />
                  )}
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 mt-4 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-[100]"
                  >
                    {/* User Header */}
                    <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 mb-2">
                       <p className="font-bold text-sm truncate">{session?.user?.name}</p>
                       <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                    </div>

                    {/* Role Toggle */}
                    <div className="p-1 mb-2">
                       <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">Switch Account</p>
                        <div className="grid grid-cols-2 gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl">
                          <button 
                            onClick={() => handleSetRole("instructor")}
                            disabled={isSwitching}
                            className={cn(
                              "flex items-center justify-center gap-2 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                              convexUser?.role === "instructor" 
                                ? "bg-white dark:bg-slate-900 text-blue-800 dark:text-cyan-400 shadow-sm" 
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
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
                              "flex items-center justify-center gap-2 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                              convexUser?.role !== "instructor" 
                                ? "bg-white dark:bg-slate-900 text-blue-800 dark:text-cyan-400 shadow-sm" 
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
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
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Profile Settings
                      </Link>
                      
                      <button 
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {theme === "light" ? <Moon className="w-4 h-4 text-slate-500" /> : <Sun className="w-4 h-4 text-slate-500" />}
                          <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                        </div>
                        <div className={cn(
                          "w-8 h-4 rounded-full relative transition-colors duration-200",
                          theme === "dark" ? "bg-blue-600" : "bg-slate-300"
                        )}>
                          <div className={cn(
                            "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200",
                            theme === "dark" ? "translate-x-4.5" : "translate-x-0.5"
                          )} />
                        </div>
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-1" />

                      <button 
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col gap-4 text-lg font-medium">
            <Link href="/courses" onClick={() => setMobileMenuOpen(false)}>Courses</Link>
            <Link href="/mentorship" onClick={() => setMobileMenuOpen(false)}>Mentorship</Link>
            <Link href="/business" onClick={() => setMobileMenuOpen(false)}>For Business</Link>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
            {!isSignedIn ? (
              <>
                <Link 
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  href="/register" 
                  className="text-cyan-600" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Theme</p>
                  <button 
                    onClick={toggleTheme}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <span className="text-sm font-medium">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                    </div>
                  </button>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Switch Role</p>
                  <button 
                    onClick={() => {
                      const targetRole = convexUser?.role === "instructor" ? "learner" : "instructor";
                      handleSetRole(targetRole).then(() => setMobileMenuOpen(false));
                    }}
                    disabled={isSwitching}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl disabled:opacity-50"
                  >
                    <ArrowRightLeft className={cn("w-5 h-5 text-blue-800", isSwitching && "animate-spin")} />
                    <span className="text-sm font-medium">
                      {isSwitching ? "Switching..." : `Switch to ${convexUser?.role === "instructor" ? "Learner" : "Instructor"}`}
                    </span>
                  </button>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
                
                <button 
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 text-red-600 font-bold"
                >
                  <LogOut className="w-5 h-5" />
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
