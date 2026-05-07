"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSession } from "next-auth/react";
import { Search, Mail, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminWaitlistPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");

  const waitlist = useQuery(api.admin.listWaitlist, 
    session?.user?.id ? { providerId: session.user.id } : "skip"
  );

  const filteredWaitlist = waitlist?.filter(entry => 
    entry.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entry.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">
            Waitlist Entries
          </h1>
          <p className="text-muted-foreground font-medium">
            View users who have registered interest in upcoming features.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search email or type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-800 transition-all font-medium"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-sm font-black text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-5">Email Address</th>
                <th className="px-6 py-5">Interest Type</th>
                <th className="px-6 py-5">Date Added</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {!filteredWaitlist ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400">Loading waitlist...</td>
                </tr>
              ) : filteredWaitlist.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400">No entries found.</td>
                </tr>
              ) : (
                filteredWaitlist.map((entry) => (
                  <tr key={entry._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{entry.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md",
                        entry.type === "business" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                        entry.type === "mentorship" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      )}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {new Date(entry._creationTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={`mailto:${entry.email}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"
                      >
                        Contact <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
