"use client";

import React from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface EarningsAnalyticsProps {
  chartData?: { name: string; amount: number }[];
}

/**
 * Revenue analytics for instructors — powered by REAL earnings data
 * (the 60% instructor share from actual course sales), grouped by month.
 */
export default function EarningsAnalytics({ chartData }: EarningsAnalyticsProps) {
  const data = chartData ?? [];
  const hasData = data.some(d => d.amount > 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] md:rounded-[32px] p-5 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5 mt-8 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black">Revenue Analytics</h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Your 60% earnings share from course sales, by month.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-800 dark:text-cyan-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl w-fit">
          <TrendingUp className="w-4 h-4" />
          Last 6 Months
        </div>
      </div>

      <div className="h-[240px] sm:h-[300px] w-full mt-4">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} tickFormatter={(value) => formatPrice(value)} width={70} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}
                itemStyle={{ fontWeight: 600, fontSize: '14px' }}
                formatter={(value) => [formatPrice(Number(value)), 'Earnings']}
              />
              <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" name="Earnings" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-8">
            <TrendingUp className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-4" />
            <p className="font-bold text-muted-foreground">No earnings data yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Publish a course and your monthly revenue will appear here once students start enrolling.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
