"use client";

import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  ArrowLeft,
  Upload,
  Clock,
  BookOpen,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatPrice, ngnToUsd } from "@/lib/format";
import { useFxRate } from "@/hooks/useFxRate";

const CATEGORIES = [
  "Development",
  "Design",
  "Business",
  "Marketing",
  "Music",
  "Photography",
  "Personal Development"
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const STEPS = [
  { id: 1, title: "Basics", description: "Title & description" },
  { id: 2, title: "Details", description: "Price, category & level" },
  { id: 3, title: "Thumbnail", description: "Cover image" },
] as const;

export default function CreateCoursePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const createCourse = useMutation(api.courses.create);
  
  const convexUser = useQuery(api.users.getUserByProviderId, 
    session?.user?.id ? { 
      providerId: session.user.id,
      email: session.user.email ?? undefined 
    } : "skip"
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    category: CATEGORIES[0],
    level: LEVELS[0],
    thumbnailUrl: "",
    thumbnailMediaId: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const fxRate = useFxRate();

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Only instructors (or admins) can create courses
  if (convexUser && convexUser.role !== "instructor" && convexUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-10 px-4 sm:px-6">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-semibold">Instructors Only</h1>
          <p className="text-muted-foreground font-medium">
            Course creation is available for instructor accounts. Switch to an instructor account from the profile menu to get started.
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleThumbnailClick = () => {
    fileInputRef.current?.click();
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    // Local Preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);

    try {
      const init = await fetch("/api/media/file/upload-initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "image", courseId: "", name: file.name, mimeType: file.type, sizeBytes: file.size }),
      });
      const data = await init.json();
      if (!init.ok || !data.uploadUrl) throw new Error(data.error || "Failed to initialize image upload");
      const result = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!result.ok) throw new Error("Image upload failed");
      const complete = await fetch("/api/media/file/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mediaId: data.mediaId, objectKey: data.objectKey }) });
      if (!complete.ok) throw new Error((await complete.json()).error || "Image verification failed");
      setFormData(prev => ({ ...prev, thumbnailUrl: "", thumbnailMediaId: data.mediaId }));
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload image. Please try again.");
      setPreviewUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.title.trim()) {
        setError("Please give your course a title.");
        return false;
      }
      if (!formData.description.trim()) {
        setError("Please add a short description.");
        return false;
      }
    }
    if (step === 2) {
      if (formData.price === "" || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
        setError("Please enter a valid price (0 for free courses).");
        return false;
      }
      if (!formData.duration.trim()) {
        setError("Please enter the course duration.");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const goToStep = (step: number) => {
    if (step > currentStep && !validateStep(currentStep)) return;
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    if (!convexUser?._id || !session?.user?.id) return;
    if (!formData.thumbnailMediaId) {
      setError("Please upload a thumbnail first.");
      setCurrentStep(3);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await createCourse({
        providerId: session.user.id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        instructorId: convexUser._id,
        duration: formData.duration,
        thumbnailUrl: formData.thumbnailMediaId,
        thumbnailMediaId: formData.thumbnailMediaId as never,
        category: formData.category,
        level: formData.level,
      });
      
      router.push(`/dashboard`);
    } catch (err) {
      console.error("Failed to create course:", err);
      setError(err instanceof Error ? err.message : "Failed to create course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-xs";
  const labelClass = "text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block";

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        {/* Step indicator */}
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-1">Create New Course</h1>
          <p className="text-xs text-slate-500">Fill in the details below to start building your curriculum.</p>
          
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 -mx-1 px-1">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg shrink-0 transition-all text-left",
                    currentStep === step.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : currentStep > step.id
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-white text-slate-400 border border-slate-200"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <span className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0",
                      currentStep === step.id ? "bg-white/20" : "bg-slate-100 text-slate-600"
                    )}>
                      {step.id}
                    </span>
                  )}
                  <span className="hidden sm:block">
                    <span className="block text-xs font-semibold">{step.title}</span>
                    <span className={cn(
                      "block text-[10px] font-medium",
                      currentStep === step.id ? "text-blue-200" : "text-slate-400"
                    )}>
                      {step.description}
                    </span>
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={cn(
                    "w-4 h-0.5 shrink-0 rounded-full",
                    currentStep > step.id ? "bg-emerald-400" : "bg-slate-200"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-5">
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="grid gap-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label htmlFor="title" className={labelClass}>Course Title</label>
                  <input 
                    id="title"
                    required
                    type="text" 
                    placeholder="e.g. Mastering Next.js 15"
                    className={inputClass}
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="description" className={labelClass}>Description</label>
                  <textarea 
                    id="description"
                    required
                    rows={4}
                    placeholder="Tell your students what they will learn..."
                    className={cn(inputClass, "resize-none")}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="grid gap-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label htmlFor="price" className={labelClass}>Price in Naira — 0 for free</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-400 pointer-events-none text-xs">₦</span>
                    <input
                      id="price"
                      required
                      type="number"
                      step="1"
                      min="0"
                      inputMode="numeric"
                      placeholder="25000"
                      className={cn(inputClass, "pl-7")}
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  {formData.price !== "" && !isNaN(parseFloat(formData.price)) && parseFloat(formData.price) > 0 && (
                    <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg space-y-0.5">
                      <p className="text-xs font-bold text-blue-600">
                        ≈ {formatPrice(ngnToUsd(parseFloat(formData.price), fxRate), "USD")} for international students
                      </p>
                      <p className="text-[11px] text-slate-500">
                        You earn {formatPrice(Math.round(parseFloat(formData.price) * 0.6))} per sale (60% share).
                      </p>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 font-medium px-0.5">
                    All payments are processed in Naira. USD is shown as a live reference (~₦{fxRate}/$).
                  </p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="duration" className={labelClass}>Duration</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input 
                      id="duration"
                      required
                      type="text" 
                      placeholder="e.g. 12h 30m"
                      className={cn(inputClass, "pl-8")}
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="category" className={labelClass}>Category</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                      <select 
                        id="category"
                        className={cn(inputClass, "pl-8 appearance-none")}
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="level" className={labelClass}>Difficulty Level</label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                      <select 
                        id="level"
                        className={cn(inputClass, "pl-8 appearance-none")}
                        value={formData.level}
                        onChange={(e) => setFormData({...formData, level: e.target.value})}
                      >
                        {LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Thumbnail */}
            {currentStep === 3 && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <label className={labelClass}>Course Thumbnail</label>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleThumbnailChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <div 
                  onClick={handleThumbnailClick}
                  className="aspect-video bg-slate-50 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-center p-4 group hover:border-blue-600 transition-all cursor-pointer overflow-hidden relative"
                >
                  {previewUrl ? (
                    <>
                      <Image 
                        src={previewUrl} 
                        alt="Thumbnail Preview" 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-80" 
                      />
                      <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-all flex flex-col items-center justify-center text-white">
                        <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center mb-1">
                           <Upload className="w-4 h-4" />
                        </div>
                        <p className="font-semibold text-xs">Change Image</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                         {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      </div>
                      <h4 className="font-semibold mb-0.5 text-xs text-slate-800">Tap to upload thumbnail</h4>
                      <p className="text-[10px] text-slate-400">PNG, JPG or WEBP (Max 5MB)</p>
                    </>
                  )}
                  
                  {isUploading && (
                     <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-1.5">
                           <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                           <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">Uploading...</p>
                        </div>
                     </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Step navigation */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                  currentStep === 1
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={() => goToStep(currentStep + 1)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all active:scale-95"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  disabled={isSubmitting || isUploading}
                  type="submit"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      Create Your Course
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
