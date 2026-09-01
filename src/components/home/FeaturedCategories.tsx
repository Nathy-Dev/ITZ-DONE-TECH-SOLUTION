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
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Top Categories</h2>
            <p className="text-slate-500">Specialized paths designed to take you from beginner to job-ready professional.</p>
          </div>
          <Link href="/courses" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
            View all courses
          </Link>
        </div>

        {categoriesData && categoriesData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoriesData.slice(0, 8).map((cat, idx) => {
              const meta = categoryMeta[cat.name] || defaultMeta;
              const IconComponent = meta.icon;
              return (
                <Link
                  key={idx}
                  href={`/courses?category=${encodeURIComponent(cat.name)}`}
                  className="p-5 rounded-xl border border-slate-200 hover:border-blue-600/40 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">{cat.name}</h3>
                  <p className="text-sm text-slate-500">{cat.count} {cat.count === 1 ? "Course" : "Courses"} available</p>
                </Link>
              );
            })}
          </div>
        ) : categoriesData && categoriesData.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-500">No categories available yet.</p>
          </div>
        ) : (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-xl border border-slate-200 animate-pulse">
                <div className="w-10 h-10 bg-slate-100 rounded-lg mb-4" />
                <div className="h-4 w-32 bg-slate-100 rounded mb-2" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;
