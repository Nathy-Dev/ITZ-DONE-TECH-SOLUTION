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
        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all relative text-slate-700"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} new)` : ""}`}
      >
        <Bell className="w-4 h-4 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 px-1 bg-red-500 text-[8px] text-white rounded-full flex items-center justify-center font-bold border border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] overflow-hidden bg-white border border-slate-200 rounded-lg shadow-md z-50 animate-in fade-in duration-150 origin-top-right flex flex-col"
        >
          <div className="p-3 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{unreadCount} new</span>
            )}
          </div>

          <div className="overflow-y-auto custom-scrollbar">
            {visible.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">You&#39;re all caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">New activity will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {visible.map((n: Notification) => (
                  <div key={n.id} className="p-3 flex items-start gap-2.5 hover:bg-slate-50 transition-colors group">
                    <div
                      className={cn(
                        "w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5",
                        n.type === "success" && "bg-emerald-50 text-emerald-600",
                        n.type === "warning" && "bg-amber-50 text-amber-600",
                        n.type === "info" && "bg-blue-50 text-blue-600"
                      )}
                    >
                      {n.type === "success" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : n.type === "warning" ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-grow">
                      <p className="text-xs font-semibold text-slate-900 leading-tight">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-slate-400 font-medium mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="p-1 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      aria-label="Dismiss notification"
                    >
                      <X className="w-3 h-3" />
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
