import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
  bgClass?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp = true,
  colorClass = "text-blue-600 ",
  bgClass = "bg-blue-100 "
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-md shadow-blue-600/5 hover:shadow-sm hover:shadow-blue-600/10 transition-all duration-500 group relative overflow-hidden">
      {/* Decorative background element */}
      <div className={cn(
        "absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-transform duration-700",
        bgClass
      )} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center",
            bgClass, colorClass
          )}>
            <Icon className="w-7 h-7" />
          </div>
          {trend && (
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1",
              trendUp ? "bg-emerald-100 text-emerald-700  " : "bg-red-100 text-red-700  "
            )}>
              {trendUp ? "↑" : "↓"} {trend}
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            {title}
          </p>
          <h3 className="text-4xl font-semibold text-slate-900">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}
