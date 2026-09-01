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
  colorClass = "text-blue-600",
  bgClass = "bg-blue-100"
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-xs hover:shadow-sm transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
          bgClass, colorClass
        )}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5",
            trendUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          )}>
            {trendUp ? "↑" : "↓"} {trend}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-slate-900">
          {value}
        </h3>
      </div>
    </div>
  );
}
