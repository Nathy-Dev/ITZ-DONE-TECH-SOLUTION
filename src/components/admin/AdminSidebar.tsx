"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ListOrdered,
  LogOut
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

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xl">I</span>
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
            ITZ-DONE
          </span>
          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider ml-1">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                isActive 
                  ? "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-cyan-400" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-blue-800 dark:text-cyan-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
