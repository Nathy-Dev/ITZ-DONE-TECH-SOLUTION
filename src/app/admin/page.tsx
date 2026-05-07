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
            colorClass="text-blue-600 dark:text-cyan-400"
            bgClass="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            colorClass="text-purple-600 dark:text-purple-400"
            bgClass="bg-purple-100 dark:bg-purple-900/30"
          />
          <StatCard
            title="Total Enrollments"
            value={stats.totalEnrollments}
            icon={GraduationCap}
            colorClass="text-emerald-600 dark:text-emerald-400"
            bgClass="bg-emerald-100 dark:bg-emerald-900/30"
          />
          <StatCard
            title="Est. Revenue"
            value={formatPrice(stats.totalRevenue)}
            icon={DollarSign}
            colorClass="text-amber-600 dark:text-amber-400"
            bgClass="bg-amber-100 dark:bg-amber-900/30"
          />
        </div>
      )}
    </div>
  );
}
