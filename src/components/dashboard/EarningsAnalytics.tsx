"use client";

import React, { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { TrendingUp, Users, Video } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const revenueData = [
  { name: 'Jan', current: 4000, previous: 2400 },
  { name: 'Feb', current: 3000, previous: 1398 },
  { name: 'Mar', current: 2000, previous: 9800 },
  { name: 'Apr', current: 2780, previous: 3908 },
  { name: 'May', current: 1890, previous: 4800 },
  { name: 'Jun', current: 2390, previous: 3800 },
  { name: 'Jul', current: 3490, previous: 4300 },
];

const enrollmentData = [
  { name: 'Mon', students: 12 },
  { name: 'Tue', students: 19 },
  { name: 'Wed', students: 15 },
  { name: 'Thu', students: 22 },
  { name: 'Fri', students: 28 },
  { name: 'Sat', students: 35 },
  { name: 'Sun', students: 42 },
];

const completionData = [
  { name: 'Week 1', rate: 20 },
  { name: 'Week 2', rate: 45 },
  { name: 'Week 3', rate: 65 },
  { name: 'Week 4', rate: 85 },
];

interface EarningsAnalyticsProps {
  chartData?: { name: string; amount: number }[];
}

export default function EarningsAnalytics({ chartData }: EarningsAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"revenue" | "enrollment" | "completion">("revenue");

  // Format data for chart
  const revenueChartData = chartData ? chartData.map(d => ({
    name: d.name,
    current: d.amount,
    previous: Math.round(d.amount * 0.8) // Mocking previous for visual depth
  })) : revenueData;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5 mt-8 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black">Performance Analytics</h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">Track your course metrics and revenue growth.</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("revenue")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "revenue" ? "bg-white dark:bg-slate-900 shadow-sm text-blue-800 dark:text-cyan-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <TrendingUp className="w-4 h-4" /> Revenue
          </button>
          <button 
            onClick={() => setActiveTab("enrollment")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "enrollment" ? "bg-white dark:bg-slate-900 shadow-sm text-blue-800 dark:text-cyan-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Users className="w-4 h-4" /> Enrollments
          </button>
          <button 
            onClick={() => setActiveTab("completion")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "completion" ? "bg-white dark:bg-slate-900 shadow-sm text-blue-800 dark:text-cyan-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Video className="w-4 h-4" /> Completion
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full mt-4">
        {activeTab === "revenue" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}
                itemStyle={{ fontWeight: 600, fontSize: '14px' }}
              />
              <Area type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorPrevious)" name="Previous Period" />
              <Area type="monotone" dataKey="current" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" name="Current Period" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === "enrollment" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enrollmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
              <Tooltip 
                 cursor={{ fill: 'transparent' }}
                 contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                 labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}
                 itemStyle={{ fontWeight: 600, fontSize: '14px', color: '#06b6d4' }}
              />
              <Bar dataKey="students" fill="#06b6d4" radius={[6, 6, 0, 0]} name="New Enrollments" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === "completion" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={completionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} tickFormatter={(val) => `${val}%`} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}
                itemStyle={{ fontWeight: 600, fontSize: '14px', color: '#10b981' }}
              />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={4} dot={{ strokeWidth: 2, r: 6, fill: '#fff', stroke: '#10b981' }} activeDot={{ r: 8 }} name="Avg. Completion Rate" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
