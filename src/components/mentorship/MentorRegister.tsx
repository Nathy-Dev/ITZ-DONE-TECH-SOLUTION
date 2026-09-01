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
    <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-xs max-w-2xl">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Become a Mentor</h2>
        <p className="text-xs text-slate-500 mt-0.5">Share your expertise and guide others in their tech journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Biography</label>
          <textarea
            required
            placeholder="Tell us about your experience and how you can help..."
            className="w-full h-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none resize-none"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Expertise (comma separated)</label>
            <input
              type="text"
              required
              placeholder="React, Node.js, Architecture..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none"
              value={formData.expertise}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Hourly Rate (₦)</label>
            <input
              type="number"
              required
              min="0"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <input 
                type="checkbox"
                id="isAvailable"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
            />
            <label htmlFor="isAvailable" className="text-xs font-medium text-slate-700 cursor-pointer">Available for new mentorship requests</label>
        </div>

        {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
            </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            "w-full py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm",
            success ? "bg-emerald-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
          )}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <>
                <CheckCircle2 className="w-4 h-4" />
                Settings Saved
            </>
          ) : (
            <>
                <Save className="w-4 h-4" />
                {existingProfile ? "Update Profile" : "Register as Mentor"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
