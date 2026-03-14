"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  Shield, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  
  const convexUser = useQuery(api.users.getUserByProviderId, 
    session?.user?.id ? { 
      providerId: session.user.id,
      email: session.user.email ?? undefined 
    } : "skip"
  );

  const updateProfile = useMutation(api.users.updateProfile);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (convexUser) {
      setName(convexUser.name || "");
      setBio(convexUser.bio || "");
    }
  }, [convexUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    
    setIsSaving(true);
    setSaved(false);
    
    try {
      await updateProfile({
        providerId: session.user.id,
        name,
        bio
      });
      
      // Update NextAuth session if name changed
      if (name !== session.user.name) {
        await update({ name });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!session || convexUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-blue-800 animate-spin" />
      </div>
    );
  }

  if (convexUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-bold text-slate-500">
        User profile not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-2">Profile Settings</h1>
          <p className="text-muted-foreground font-medium">Manage your personal information and preferences.</p>
        </div>

        <div className="grid md:grid-cols-[250px_1fr] gap-12">
          {/* Sidebar Navigation */}
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-cyan-400 font-bold rounded-2xl transition-all">
              <User className="w-5 h-5" />
              General
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 font-bold rounded-2xl transition-all">
              <Shield className="w-5 h-5" />
              Security
            </button>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
              <div className="flex items-center gap-8 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                <div className="relative group">
                  <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center overflow-hidden">
                    {convexUser.profileImage ? (
                      <Image 
                        src={convexUser.profileImage} 
                        alt={convexUser.name} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-blue-800 dark:text-cyan-400">
                        {convexUser.name?.substring(0, 2).toUpperCase() || "US"}
                      </span>
                    )}
                  </div>
                  <button className="absolute -bottom-3 -right-3 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-800 dark:hover:text-cyan-400 transition-colors group-hover:scale-110">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-black text-xl">{convexUser.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium capitalize">{convexUser.role || "Learner"}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-500">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      id="name"
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold focus:border-blue-800 dark:focus:border-cyan-400 focus:outline-none transition-colors"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      id="email"
                      type="email" 
                      value={convexUser.email}
                      disabled
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">Email cannot be changed directly.</p>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-slate-500">Bio</label>
                  <textarea 
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold focus:border-blue-800 dark:focus:border-cyan-400 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>

                <div className="pt-6 flex items-center justify-end gap-4">
                  {saved && (
                    <span className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest animate-in slide-in-from-right-4">
                      <CheckCircle2 className="w-4 h-4" />
                      Saved
                    </span>
                  )}
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-800/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
