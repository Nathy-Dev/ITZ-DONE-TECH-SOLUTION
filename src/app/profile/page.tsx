"use client";

import React, { useState, useEffect, useRef } from "react";
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
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import PayoutSettings from "@/components/profile/PayoutSettings";

type Tab = "general" | "security";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("general");
  
  const convexUser = useQuery(api.users.getUserByProviderId, 
    session?.user?.id ? { 
      providerId: session.user.id,
      email: session.user.email ?? undefined 
    } : "skip"
  );

  const updateProfile = useMutation(api.users.updateProfile);
  const changePassword = useMutation(api.users.changePassword);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Avatar upload state
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isSocialAccount = !!session?.user?.image && !convexUser?.password;

  useEffect(() => {
    if (convexUser) {
      setName(convexUser.name || "");
      setBio(convexUser.bio || "");
    }
  }, [convexUser]);

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;

    // Local preview
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setIsUploadingAvatar(true);
    setProfileError(null);

    try {
      // 1. Get Convex upload URL
      const postUrl = await generateUploadUrl();
      // 2. Upload the file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      // 3. Resolve the public URL and save to profile
      const url = await fetch(`/api/files/url?storageId=${storageId}`).then(r => r.json());
      if (!url?.url) throw new Error("Could not resolve image URL");

      await updateProfile({
        providerId: session.user.id,
        profileImage: url.url,
      });
      await update({ image: url.url });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setProfileError("Failed to upload image. Please try again.");
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    
    setIsSaving(true);
    setSaved(false);
    setProfileError(null);
    
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
      setProfileError("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordChanged(false);

    try {
      await changePassword({
        providerId: session.user.id,
        currentPassword,
        newPassword,
      });
      setPasswordChanged(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordChanged(false), 5000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setIsChangingPassword(false);
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

  const displayImage = avatarPreview ?? convexUser.profileImage;

  const inputClass = "w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold focus:border-blue-800 dark:focus:border-cyan-400 focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 md:pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Profile Settings</h1>
          <p className="text-muted-foreground font-medium">Manage your personal information and preferences.</p>
        </div>

        <div className="grid md:grid-cols-[250px_1fr] gap-8 md:gap-12">
          {/* Sidebar Navigation */}
          <div className="flex md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0">
            <button 
              onClick={() => setActiveTab("general")}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-bold rounded-2xl transition-all whitespace-nowrap shrink-0",
                activeTab === "general"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-cyan-400"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
              )}
            >
              <User className="w-5 h-5" />
              General
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-bold rounded-2xl transition-all whitespace-nowrap shrink-0",
                activeTab === "security"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-cyan-400"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
              )}
            >
              <Shield className="w-5 h-5" />
              Security
            </button>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {activeTab === "general" ? (
              <>
            <div className="bg-white dark:bg-slate-900 rounded-[24px] md:rounded-[32px] p-5 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                <div className="relative group">
                  <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center overflow-hidden">
                    {displayImage ? (
                      <Image 
                        src={displayImage} 
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
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="absolute -bottom-3 -right-3 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-800 dark:hover:text-cyan-400 transition-colors group-hover:scale-110 disabled:opacity-60"
                    aria-label="Change profile photo"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-xl">{convexUser.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium capitalize">{convexUser.role || "Learner"}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Tap the camera to change your photo</p>
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
                      className={inputClass}
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

                {profileError && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {profileError}
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
                  {saved && (
                    <span className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest animate-in slide-in-from-right-4">
                      <CheckCircle2 className="w-4 h-4" />
                      Saved
                    </span>
                  )}
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-800/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Payout settings for instructors */}
            {(convexUser.role === "instructor" || convexUser.role === "admin") && (
              <PayoutSettings />
            )}
              </>
            ) : (
              /* ─── Security Tab ─────────────────────────────────────── */
              <div className="bg-white dark:bg-slate-900 rounded-[24px] md:rounded-[32px] p-5 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Change Password</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                      Keep your account secure
                    </p>
                  </div>
                </div>

                {isSocialAccount ? (
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl text-sm font-medium text-blue-900/70 dark:text-blue-200/70">
                    You signed up with a social account (Google/GitHub), so there&#39;s no password to change. Your account is secured by your provider.
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="grid gap-2">
                      <label htmlFor="currentPassword" className="text-xs font-black uppercase tracking-widest text-slate-500">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          id="currentPassword"
                          type={showPasswords ? "text" : "password"}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={inputClass}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="newPassword" className="text-xs font-black uppercase tracking-widest text-slate-500">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          id="newPassword"
                          type={showPasswords ? "text" : "password"}
                          required
                          minLength={8}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={inputClass}
                          placeholder="At least 8 characters"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-widest text-slate-500">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          id="confirmPassword"
                          type={showPasswords ? "text" : "password"}
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={inputClass}
                          placeholder="Repeat new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                        >
                          {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {passwordError && (
                      <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {passwordError}
                      </div>
                    )}

                    {passwordChanged && (
                      <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        Password changed successfully!
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button 
                        type="submit"
                        disabled={isChangingPassword}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-800/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                        Update Password
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
