"use client";

import React from "react";
import Image from "next/image";
import { Star, MessageSquare } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface MentorCardProps {
  name: string;
  image?: string;
  bio: string;
  expertise: string[];
  hourlyRate: number;
  rating?: number;
}

export default function MentorCard({ name, image, bio, expertise, hourlyRate, rating }: MentorCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all group">
      <div className="flex items-start gap-6 mb-6">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shrink-0 relative">
          {image ? (
            <Image src={image} alt={name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-800 text-white font-black text-2xl uppercase">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-grow pt-2">
            <h3 className="text-xl font-black mb-1 group-hover:text-blue-800 transition-colors">{name}</h3>
            <div className="flex items-center gap-2 text-sm font-bold text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                {rating || "New Mentor"}
            </div>
        </div>
        <div className="text-right">
            <p className="text-2xl font-black text-blue-800 dark:text-cyan-400">{formatPrice(hourlyRate)}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">/ hour</p>
        </div>
      </div>

      <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8 line-clamp-3">
        {bio}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {expertise.map((skill, i) => (
          <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex gap-4">
        <button className="flex-grow py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:bg-black dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-sm">
            Book Session
        </button>
        <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-800/10 text-blue-800 dark:text-cyan-400 hover:bg-blue-800/20 transition-all">
            <MessageSquare className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
