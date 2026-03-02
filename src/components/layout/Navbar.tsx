"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";

/**
 * Navbar component for ITZ-DONE TECH SOLUTION.
 */
const Navbar = () => {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoaded = status !== "loading" && mounted;
  const isSignedIn = !!session && mounted;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

          <Link href="/cart" className="p-2 relative hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-blue-800 text-[10px] text-white rounded-full flex items-center justify-center">0</span>
          </Link>

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
              <div className="flex items-center gap-4">
                {session?.user?.image && (
                  <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full" />
                )}
                <button 
                  onClick={() => signOut()}
                  className="text-sm font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
                >
                  Sign Out
                </button>
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
                <div className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  {session?.user?.image && (
                    <img src={session.user.image} alt="User" className="w-10 h-10 rounded-full" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{session?.user?.name}</span>
                    <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-red-600"
                >
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
