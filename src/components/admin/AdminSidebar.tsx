"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ListOrdered,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Waitlist", href: "/admin/waitlist", icon: ListOrdered },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col h-full shrink-0 transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 z-10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-500"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={cn("p-6 flex items-center", isCollapsed ? "justify-center px-0" : "")}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-black text-xl">I</span>
          </div>
          {!isCollapsed && (
            <div className="flex items-center">
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white truncate max-w-[120px]">
                ITZ-DONE
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ml-1 shrink-0">
                Admin
              </span>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl font-bold transition-all relative",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                  isActive 
                    ? "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-cyan-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-blue-800 dark:text-cyan-400")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 text-white text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="relative group">
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className={cn(
              "flex w-full items-center rounded-xl font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all",
              isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
          
          {isCollapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-red-900 text-white text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
              Sign Out
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
