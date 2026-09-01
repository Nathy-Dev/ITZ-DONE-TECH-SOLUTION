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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (convexUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-500">
        User profile not found.
      </div>
    );
  }

  const displayImage = avatarPreview ?? convexUser.profileImage;

  const inputClass = "w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-1">Profile Settings</h1>
          <p className="text-slate-500 text-xs">Manage your personal information and preferences.</p>
        </div>

        <div className="grid md:grid-cols-[180px_1fr] gap-5">
          {/* Sidebar Navigation */}
          <div className="flex md:flex-col gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button 
              onClick={() => setActiveTab("general")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 font-semibold text-xs rounded-lg transition-all whitespace-nowrap shrink-0",
                activeTab === "general"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <User className="w-4 h-4" />
              General
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 font-semibold text-xs rounded-lg transition-all whitespace-nowrap shrink-0",
                activeTab === "security"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <Shield className="w-4 h-4" />
              Security
            </button>
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            {activeTab === "general" ? (
              <>
            <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                <div className="relative group">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center overflow-hidden relative">
                    {displayImage ? (
                      <Image 
                        src={displayImage} 
                        alt={convexUser.name} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <span className="text-xl font-bold text-blue-600">
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
                    className="absolute -bottom-2 -right-2 w-7 h-7 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-60"
                    aria-label="Change profile photo"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-sm text-slate-900">{convexUser.name}</h3>
                  <p className="text-xs text-slate-500 capitalize">{convexUser.role || "Learner"}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tap the camera to change your photo</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-1.5">
                  <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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

                <div className="grid gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      id="email"
                      type="email" 
                      value={convexUser.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Email cannot be changed directly.</p>
                </div>

                <div className="grid gap-1.5">
                  <label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bio</label>
                  <textarea 
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>

                {profileError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {profileError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3">
                  {saved && (
                    <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold animate-in slide-in-from-right-4">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Saved
                    </span>
                  )}
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 active:scale-95 disabled:opacity-70"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
              <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">Change Password</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Keep your account secure
                    </p>
                  </div>
                </div>

                {isSocialAccount ? (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                    You signed up with a social account (Google/GitHub), so there&#39;s no password to change. Your account is secured by your provider.
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="grid gap-1.5">
                      <label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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

                    <div className="grid gap-1.5">
                      <label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-500">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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

                    <div className="grid gap-1.5">
                      <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                        >
                          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {passwordError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {passwordError}
                      </div>
                    )}

                    {passwordChanged && (
                      <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        Password changed successfully!
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        disabled={isChangingPassword}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 active:scale-95 disabled:opacity-70"
                      >
                        {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
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
