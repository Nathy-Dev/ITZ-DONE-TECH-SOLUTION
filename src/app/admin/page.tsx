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
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-0.5">
          Platform Overview
        </h1>
        <p className="text-slate-500 text-xs">
          Monitor your platform&apos;s performance and key metrics.
        </p>
      </div>

      {!stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            colorClass="text-blue-600"
            bgClass="bg-blue-100"
          />
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            colorClass="text-purple-600"
            bgClass="bg-purple-100"
          />
          <StatCard
            title="Total Enrollments"
            value={stats.totalEnrollments}
            icon={GraduationCap}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-100"
          />
          <StatCard
            title="Est. Revenue"
            value={formatPrice(stats.totalRevenue)}
            icon={DollarSign}
            colorClass="text-amber-600"
            bgClass="bg-amber-100"
          />
        </div>
      )}
    </div>
  );
}
