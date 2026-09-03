"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const convexUser = useQuery(api.users.getUserByProviderId, 
    session?.user?.id ? { 
      providerId: session.user.id,
      email: session.user.email ?? undefined 
    } : "skip"
  );

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (status === "loading" || (session && convexUser === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Strict role check
  if (convexUser?.role !== "admin" && !convexUser?.isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-[100dvh] bg-slate-50 overflow-hidden relative">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: fixed overlay on mobile, static column on desktop */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        transition-transform duration-300
      `}>
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 overflow-y-auto p-3 sm:p-6">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden mb-4 p-2 bg-white border border-slate-200 rounded-lg shadow-xs"
          aria-label="Open admin menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
