"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  Icon: LucideIcon;
}

export default function ComingSoon({ title, description, Icon }: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center">
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-cyan-400 rounded-3xl flex items-center justify-center relative z-10 animate-bounce-subtle">
            <Icon className="w-12 h-12" />
          </div>
          <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-amber-500 animate-pulse" />
          <div className="absolute inset-0 bg-blue-800/10 blur-2xl rounded-full scale-150 -z-10" />
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          <span className="text-blue-800 dark:text-cyan-400">{title}</span> Coming Soon
        </h1>
        
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 bg-blue-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-xl shadow-blue-800/20 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <button className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95">
            Notify Me
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
