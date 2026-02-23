import React from "react";
import Link from "next/link";
import { Code2, Cpu, Database, Layout, Smartphone, Shield, Cloud, Terminal } from "lucide-react";

const categories = [
  { name: "Web Development", icon: Code2, count: 124, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Data Science", icon: Database, count: 86, color: "text-purple-500", bg: "bg-purple-500/10" },
  { name: "Mobile App Dev", icon: Smartphone, count: 53, color: "text-pink-500", bg: "bg-pink-500/10" },
  { name: "Cloud Computing", icon: Cloud, count: 42, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { name: "Cybersecurity", icon: Shield, count: 31, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "UI/UX Design", icon: Layout, count: 65, color: "text-orange-500", bg: "bg-orange-500/10" },
  { name: "DevOps", icon: Terminal, count: 29, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { name: "AI & ML", icon: Cpu, count: 48, color: "text-rose-500", bg: "bg-rose-500/10" },
];

/**
 * FeaturedCategories component to showcase different tech domains.
 * Uses a grid system with modern hover states.
 */
const FeaturedCategories = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-xl space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Top <span className="text-indigo-600">Categories</span></h2>
            <p className="text-muted-foreground">Dive into specialized paths designed to take you from beginner to job-ready professional.</p>
          </div>
          <Link href="/courses" className="text-indigo-600 font-semibold hover:underline flex items-center gap-2">
            View all courses
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              href={`/courses?category=${cat.name.toLowerCase()}`}
              className="p-8 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden shrink-0"
            >
              <div className={`w-14 h-14 ${cat.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <cat.icon className={`w-7 h-7 ${cat.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2">{cat.name}</h3>
              <p className="text-sm text-muted-foreground">{cat.count} Courses available</p>
              
              {/* Subtle background flair */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full scale-0 group-hover:scale-100 transition-transform -z-10 blur-xl opacity-20" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
