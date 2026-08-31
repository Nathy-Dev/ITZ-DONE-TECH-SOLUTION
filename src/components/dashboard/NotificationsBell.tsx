"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { Bell, CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: number;
}

export default function NotificationsBell() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  // Captured when the dropdown opens (avoids impure render)
  const [openedAt, setOpenedAt] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const convexUser = useQuery(
    api.users.getUserByProviderId,
    session?.user?.id
      ? {
          providerId: session.user.id,
          email: session.user.email ?? undefined,
        }
      : "skip"
  );

  const notifications = useQuery(
    api.users.getMyNotifications,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visible = (notifications ?? []).filter((n: Notification) => !dismissed.includes(n.id));
  const unreadCount = visible.length;

  const dismiss = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  const timeAgo = (ts: number) => {
    const diff = openedAt - ts;
    if (diff < 0) return "Just now";
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          if (!isOpen) setOpenedAt(Date.now());
          setIsOpen(!isOpen);
        }}
        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 transition-all relative"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} new)` : ""}`}
      >
        <Bell className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 bg-red-500 text-[9px] text-white rounded-full flex items-center justify-center font-black border-2 border-white dark:border-slate-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 max-h-[70vh] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right flex flex-col"
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <h3 className="font-black text-sm uppercase tracking-widest">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-muted-foreground">{unreadCount} new</span>
            )}
          </div>

          <div className="overflow-y-auto custom-scrollbar">
            {visible.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-bold text-muted-foreground">You&#39;re all caught up!</p>
                <p className="text-xs text-slate-400 mt-1">New activity will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {visible.map((n: Notification) => (
                  <div key={n.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        n.type === "success" && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
                        n.type === "warning" && "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
                        n.type === "info" && "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                      )}
                    >
                      {n.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : n.type === "warning" ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-grow">
                      <p className="text-sm font-bold leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      aria-label="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
