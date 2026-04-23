"use client";

import React from "react";
import Link from "next/link";
import { Code2, Cpu, Database, Layout, Smartphone, Shield, Cloud, Terminal } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Map category names to icons and colors
const categoryMeta: Record<string, { icon: any; color: string; bg: string }> = {
  "Web Development": { icon: Code2, color: "text-blue-500", bg: "bg-blue-500/10" },
  "Data Science": { icon: Database, color: "text-purple-500", bg: "bg-purple-500/10" },
  "Mobile Dev": { icon: Smartphone, color: "text-pink-500", bg: "bg-pink-500/10" },
  "Mobile App Dev": { icon: Smartphone, color: "text-pink-500", bg: "bg-pink-500/10" },
  "Cloud Computing": { icon: Cloud, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  "Cloud": { icon: Cloud, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  "Cybersecurity": { icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  "UI/UX Design": { icon: Layout, color: "text-orange-500", bg: "bg-orange-500/10" },
  "Design": { icon: Layout, color: "text-orange-500", bg: "bg-orange-500/10" },
  "DevOps": { icon: Terminal, color: "text-blue-800", bg: "bg-blue-800/10" },
  "AI & ML": { icon: Cpu, color: "text-rose-500", bg: "bg-rose-500/10" },
};

const defaultMeta = { icon: Code2, color: "text-slate-500", bg: "bg-slate-500/10" };

/**
 * FeaturedCategories component to showcase different tech domains.
 * Uses live data from Convex to display actual course counts per category.
 */
const FeaturedCategories = () => {
  const categoriesData = useQuery(api.courses.getCategoriesWithCounts);

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-xl space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Top <span className="text-cyan-500">Categories</span></h2>
            <p className="text-muted-foreground">Dive into specialized paths designed to take you from beginner to job-ready professional.</p>
          </div>
          <Link href="/courses" className="text-cyan-500 font-semibold hover:underline flex items-center gap-2">
            View all courses
          </Link>
        </div>

        {categoriesData && categoriesData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesData.slice(0, 8).map((cat, idx) => {
              const meta = categoryMeta[cat.name] || defaultMeta;
              const IconComponent = meta.icon;
              return (
                <Link 
                  key={idx} 
                  href={`/courses?category=${encodeURIComponent(cat.name)}`}
                  className="p-8 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-800/30 hover:shadow-xl hover:shadow-blue-800/5 transition-all group relative overflow-hidden shrink-0"
                >
                  <div className={`w-14 h-14 ${meta.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`w-7 h-7 ${meta.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">{cat.count} {cat.count === 1 ? "Course" : "Courses"} available</p>
                  
                  {/* Subtle background flair */}
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full scale-0 group-hover:scale-100 transition-transform -z-10 blur-xl opacity-20" />
                </Link>
              );
            })}
          </div>
        ) : categoriesData && categoriesData.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">
            <p className="text-muted-foreground font-bold">No categories available yet.</p>
          </div>
        ) : (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-8 rounded-3xl border border-slate-100 dark:border-slate-800 animate-pulse">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6" />
                <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;
