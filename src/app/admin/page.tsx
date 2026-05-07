"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSession } from "next-auth/react";
import { StatCard } from "@/components/admin/StatCard";
import { Users, BookOpen, GraduationCap, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/format";

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  const stats = useQuery(api.admin.getPlatformStats, 
    session?.user?.id ? { providerId: session.user.id } : "skip"
  );

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">
          Platform Overview
        </h1>
        <p className="text-muted-foreground font-medium">
          Monitor your platform's performance and key metrics.
        </p>
      </div>

      {!stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[32px]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            trend="+12% this month"
            colorClass="text-blue-600 dark:text-cyan-400"
            bgClass="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            trend="+3 this month"
            colorClass="text-purple-600 dark:text-purple-400"
            bgClass="bg-purple-100 dark:bg-purple-900/30"
          />
          <StatCard
            title="Total Enrollments"
            value={stats.totalEnrollments}
            icon={GraduationCap}
            trend="+18% this month"
            colorClass="text-emerald-600 dark:text-emerald-400"
            bgClass="bg-emerald-100 dark:bg-emerald-900/30"
          />
          <StatCard
            title="Est. Revenue"
            value={formatPrice(stats.totalRevenue)}
            icon={DollarSign}
            trend="+24% this month"
            colorClass="text-amber-600 dark:text-amber-400"
            bgClass="bg-amber-100 dark:bg-amber-900/30"
          />
        </div>
      )}

      {/* Placeholder for future charts or recent activity */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-4">
             <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-black mb-2">Detailed Analytics Coming Soon</h3>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto">
             Visual charts for revenue growth and user acquisition will appear here in future updates.
          </p>
        </div>
      </div>
    </div>
  );
}
