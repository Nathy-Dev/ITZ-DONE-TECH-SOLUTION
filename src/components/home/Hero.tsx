"use client";

import React from "react";
import Link from "next/link";
import { Play, ArrowRight, Star, ShieldCheck, Users } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * Hero component for the landing page.
 * Clean split layout: concise copy on the left, course preview card on the right.
 */
const Hero = () => {
  const stats = useQuery(api.analytics.getPlatformStats);

  return (
    <section className="relative pt-16 pb-10 lg:pt-20 lg:pb-12 overflow-hidden">
      {/* Subtle background tint */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-50/60 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        {/* Left Content */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-medium">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600" />
            New: Master Next.js 15 & AI Engineering
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] text-slate-900">
            Master the tech skills that <span className="text-blue-600">shape the digital future</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Technology-driven learning. Practical innovation. Real results — built by engineers, for engineers.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <Link
              href="/courses"
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group shadow-sm shadow-blue-600/20"
            >
              Explore Courses
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2 text-slate-700"
            >
              Start Learning Free
            </Link>
          </div>

          {/* Social Proof */}
          <div className="pt-4 flex flex-wrap items-center gap-5 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-blue-100 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-blue-700 text-[9px] font-semibold">
                      U{i}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mt-0.5">
                  {stats ? `${stats.totalReviews.toLocaleString()}+` : "..."}{" "}
                  <span className="text-slate-400">reviews</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual (Course preview card) */}
        <div className="relative group">
          <div className="relative aspect-video rounded-xl border border-slate-200 overflow-hidden shadow-md bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                aria-label="Play preview"
                className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </button>
            </div>
            {/* Floating info chips */}
            <div className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-sm border border-slate-100 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-900 text-[11px] font-semibold">Certified Instructor</p>
                  <p className="text-slate-400 text-[9px]">Verified Expertise</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 p-2.5 bg-white/95 backdrop-blur-sm border border-slate-100 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-900 text-[11px] font-semibold">
                    {stats ? `${stats.totalStudents.toLocaleString()} students` : "Loading..."}
                  </p>
                  <p className="text-slate-400 text-[9px] flex items-center gap-1">
                    Enrolled right now <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  </p>
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
