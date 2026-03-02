"use client";

import React from "react";
import Link from "next/link";
import { Play, ArrowRight, Star, ShieldCheck, Users } from "lucide-react";

/**
 * Hero component for the landing page.
 * Uses a split layout with text on left and visual element on right.
 * Features background decorative elements for a premium feel.
 */
const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-cyan-200/20 blur-[100px] rounded-full" />
        <div className="absolute top-1/4 right-1/4 w-[1px] h-[400px] bg-gradient-to-b from-transparent via-blue-800/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div className="space-y-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-full text-blue-800 dark:text-cyan-400 text-sm font-medium">
            <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
            New: Master Next.js 15 & AI Engineering
          </div>

          <p className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-blue-800 dark:text-blue-300">
            ITZ-DONE TECH SOLUTIONS
          </p>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-cyan-500">Tech Potential</span> with ITZ-DONE.
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            Learn from industry experts through high-quality video courses. 
            From coding to cloud architecture, we've got you covered.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/courses" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-800 text-white font-semibold rounded-2xl hover:bg-blue-900 shadow-lg shadow-blue-800/25 transition-all flex items-center justify-center gap-2 group"
            >
              Explore Courses
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 hover:text-cyan-600"
            >
              Start Learning Free
            </Link>
          </div>

          {/* Social Proof */}
          <div className="pt-6 flex flex-wrap items-center gap-8 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-[10px] font-bold">
                      U{i}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <p className="font-bold">10k+ <span className="font-normal text-muted-foreground">Reviews</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual (Mockup or Image) */}
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-800/5 blur-[40px] rounded-[40px] group-hover:bg-blue-800/10 transition-colors" />
          <div className="relative aspect-video rounded-3xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-2xl bg-slate-900 group-hover:-translate-y-2 transition-transform duration-500">
             {/* Simple visual placeholder for a video/dashboard */}
             <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-950" />
             <div className="absolute inset-0 flex items-center justify-center">
               <button className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center group/btn hover:scale-110 transition-transform">
                 <Play className="w-8 h-8 text-white fill-white" />
               </button>
             </div>
             {/* Floating UI elements for decoration */}
             <div className="absolute top-10 right-10 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">Certified Instructor</p>
                    <p className="text-white/60 text-[10px]">Verified Expertise</p>
                  </div>
                </div>
             </div>
             <div className="absolute bottom-10 left-10 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">2,450 students</p>
                    <p className="text-white/60 text-[10px] items-center flex gap-1">Enrolled right now <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /></p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
