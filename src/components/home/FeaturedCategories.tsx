"use client";

import React from "react";
import Link from "next/link";
import { Code2, Cpu, Database, Layout, Smartphone, Shield, Cloud, Terminal } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Map category names to icons (single blue accent for brand consistency)
const categoryMeta: Record<string, { icon: React.ComponentType<{ className?: string }> }> = {
  "Web Development": { icon: Code2 },
  "Data Science": { icon: Database },
  "Mobile Dev": { icon: Smartphone },
  "Mobile App Dev": { icon: Smartphone },
  "Cloud Computing": { icon: Cloud },
  "Cloud": { icon: Cloud },
  "Cybersecurity": { icon: Shield },
  "UI/UX Design": { icon: Layout },
  "Design": { icon: Layout },
  "DevOps": { icon: Terminal },
  "AI & ML": { icon: Cpu },
};

const defaultMeta = { icon: Code2 };

/**
 * FeaturedCategories component to showcase different tech domains.
 * Uses live data from Convex to display actual course counts per category.
 */
const FeaturedCategories = () => {
  const categoriesData = useQuery(api.courses.getCategoriesWithCounts);

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-3 mb-5">
          <div className="max-w-xl space-y-1">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Top Categories</h2>
            <p className="text-xs sm:text-sm text-slate-500">Specialized paths designed to take you from beginner to job-ready professional.</p>
          </div>
          <Link href="/courses" className="text-xs sm:text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
            View all courses
          </Link>
        </div>

        {categoriesData && categoriesData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categoriesData.slice(0, 8).map((cat, idx) => {
              const meta = categoryMeta[cat.name] || defaultMeta;
              const IconComponent = meta.icon;
              return (
                <Link
                  key={idx}
                  href={`/courses?category=${encodeURIComponent(cat.name)}`}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-500/40 hover:bg-slate-50/50 transition-all group"
                >
                  <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold mb-0.5 text-slate-900">{cat.name}</h3>
                  <p className="text-xs text-slate-500">{cat.count} {cat.count === 1 ? "Course" : "Courses"}</p>
                </Link>
              );
            })}
          </div>
        ) : categoriesData && categoriesData.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
            <p className="text-xs text-slate-500">No categories available yet.</p>
          </div>
        ) : (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3.5 rounded-lg border border-slate-200 animate-pulse">
                <div className="w-8 h-8 bg-slate-100 rounded-md mb-3" />
                <div className="h-3.5 w-28 bg-slate-100 rounded mb-1.5" />
                <div className="h-2.5 w-20 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;
