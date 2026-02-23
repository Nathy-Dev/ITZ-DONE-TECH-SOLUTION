"use client";

import React from "react";
import Link from "next/link";
import { Mail, Lock, Github, Chrome, ArrowRight, Shield } from "lucide-react";

/**
 * Login Page for ITZ-DONE TECH SOLUTION.
 * Features:
 * - Clean centered card layout 
 * - Social login options
 * - Fully responsive and modern aesthetic
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 pt-20 pb-12 px-6">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-100 dark:bg-indigo-900/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] left-[5%] w-[25%] h-[25%] bg-cyan-100 dark:bg-cyan-900/10 blur-[80px] rounded-full" />
      </div>

      <div className="w-full max-w-[480px]">
        {/* Brand/Header */}
        <div className="text-center mb-10 space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              ITZ
            </div>
            <span className="font-bold text-2xl tracking-tight">
              ITZ-DONE <span className="text-indigo-600">TECH</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">Continue your tech journey with us today.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button className="flex items-center justify-center gap-3 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-sm">
              <Chrome className="w-4 h-4" />
              Google
            </button>
            <button className="flex items-center justify-center gap-3 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-sm">
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-4 text-muted-foreground font-semibold">Or continue with</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold">Password</label>
                <Link href="#" className="text-xs font-bold text-indigo-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              Log In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-indigo-600 hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Trust Footer */}
        <div className="mt-10 flex items-center justify-center gap-6 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-indigo-600" />
            Secure Authentication
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            256-bit Encryption
          </div>
        </div>
      </div>
    </div>
  );
}
