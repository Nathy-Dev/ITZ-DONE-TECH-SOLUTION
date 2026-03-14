"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MentorRegisterProps {
  userId: Id<"users">;
}

export default function MentorRegister({ userId }: MentorRegisterProps) {
  const existingProfile = useQuery(api.mentors.getProfile, { userId });
  const updateProfile = useMutation(api.mentors.updateProfile);

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bio: "",
    expertise: "",
    hourlyRate: 50,
    isAvailable: true,
  });

  useEffect(() => {
    if (existingProfile) {
      setFormData({
        bio: existingProfile.bio,
        expertise: existingProfile.expertise.join(", "),
        hourlyRate: existingProfile.hourlyRate,
        isAvailable: existingProfile.isAvailable,
      });
    }
  }, [existingProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    setError(null);

    const expertiseArray = formData.expertise
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await updateProfile({
        userId,
        bio: formData.bio,
        expertise: expertiseArray,
        hourlyRate: formData.hourlyRate,
        isAvailable: formData.isAvailable,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-black">Become a Mentor</h2>
        <p className="text-sm text-muted-foreground font-medium mt-1">Share your expertise and guide others in their tech journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mx-4">Biography</label>
          <textarea
            required
            placeholder="Tell us about your experience and how you can help..."
            className="w-full h-32 px-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-medium focus:border-blue-800 transition-colors outline-none text-sm resize-none"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mx-4">Expertise (comma separated)</label>
            <input
              type="text"
              required
              placeholder="React, Node.js, Architecture..."
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold focus:border-blue-800 transition-colors outline-none text-sm"
              value={formData.expertise}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mx-4">Hourly Rate ($)</label>
            <input
              type="number"
              required
              min="0"
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold focus:border-blue-800 transition-colors outline-none text-sm"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <input 
                type="checkbox"
                id="isAvailable"
                className="w-5 h-5 rounded border-slate-300 text-blue-800 focus:ring-blue-800"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
            />
            <label htmlFor="isAvailable" className="text-sm font-bold cursor-pointer">Available for new mentorship requests</label>
        </div>

        {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2 text-red-600 text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            "w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg",
            success ? "bg-emerald-500 text-white" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100"
          )}
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : success ? (
            <>
                <CheckCircle2 className="w-5 h-5" />
                Settings Saved
            </>
          ) : (
            <>
                <Save className="w-5 h-5" />
                {existingProfile ? "Update Profile" : "Register as Mentor"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
