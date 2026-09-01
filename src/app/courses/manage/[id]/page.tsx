"use client";

import React, { useState, use, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { 
  ArrowLeft,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Video,
  Clock,
  X,
  PlusCircle,
  PlayCircle,
  Save,
  Rocket,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Settings,
  Loader2,
  BookOpen,
  Layers
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatPrice, ngnToUsd } from "@/lib/format";
import { useFxRate } from "@/hooks/useFxRate";
import UploadCenter from "@/components/courses/UploadCenter";

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default function ManageCoursePage({ params }: PageProps) {
  const { id: courseId } = use(params) as { id: string };
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const course = useQuery(api.courses.getById, { id: courseId as Id<"courses"> });
  const rawSections = useQuery(api.content.listSections, { courseId: courseId as Id<"courses"> });
  
  const createSection = useMutation(api.content.createSection);
  const deleteSection = useMutation(api.content.deleteSection);
  const createLesson = useMutation(api.content.createLesson);
  const updateLesson = useMutation(api.content.updateLesson);
  const deleteLesson = useMutation(api.content.deleteLesson);
  const submitForReview = useMutation(api.courses.submitForReview);
  
  const reorderSections = useMutation(api.content.reorderSections);
  const reorderLessons = useMutation(api.content.reorderLessons);

  const convexUser = useQuery(api.users.getUserByProviderId, 
    session?.user?.id ? { 
      providerId: session.user.id,
      email: session.user.email ?? undefined 
    } : "skip"
  );

  const [sections, setSections] = useState<Doc<"sections">[]>([]);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingLessonToSection, setAddingLessonToSection] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (rawSections) {
      const timer = setTimeout(() => {
        setSections([...rawSections].sort((a, b) => a.order - b.order));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [rawSections]);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (!course || !isMounted || !convexUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Ownership check: only the course owner (or an admin) can manage it
  const isOwner = course.instructorId === convexUser._id;
  const isAdmin = convexUser.role === "admin";
  if (!isOwner && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-10 px-4 sm:px-6">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-semibold">Not Your Course</h1>
          <p className="text-muted-foreground font-medium">
            You don&#39;t have permission to manage this course.
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

  const providerId = session?.user?.id ?? "";

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      await createSection({
        providerId,
        courseId: courseId as Id<"courses">,
        title: newSectionTitle,
        order: sections.length + 1,
      });
      setNewSectionTitle("");
      setIsAddingSection(false);
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create section");
    }
  };

  const handleCreateLesson = async (sectionId: Id<"sections">) => {
    if (!newLessonTitle.trim()) return;
    try {
      await createLesson({
        providerId,
        sectionId,
        title: newLessonTitle,
        order: 999, // Will be ordered correctly by backend/frontend soon Ideally 1 + length.
        isFree: false,
      });
      setNewLessonTitle("");
      setAddingLessonToSection(null);
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create lesson");
    }
  };

  const handleSubmitForReview = async () => {
    setIsPublishing(true);
    setActionError(null);
    try {
      await submitForReview({ providerId, id: courseId as Id<"courses"> });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to submit for review");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteSection = async (sectionId: Id<"sections">) => {
    try {
      await deleteSection({ providerId, id: sectionId });
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete section");
    }
  };

  const handleDeleteLesson = async (lessonId: Id<"lessons">) => {
    try {
      await deleteLesson({ providerId, id: lessonId });
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete lesson");
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === "section") {
      const newSections = Array.from(sections);
      const [reorderedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, reorderedSection);

      const items = newSections.map((sec, index) => ({
        ...sec,
        order: index + 1
      }));

      setSections(items);

      try {
        await reorderSections({
          providerId,
          updates: items.map(item => ({ id: item._id, order: item.order }))
        });
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to reorder sections");
      }
    }
  };

  // Touch-friendly reorder: move a section up/down by one position
  const moveSection = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = Array.from(sections);
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    const items = newSections.map((sec, i) => ({ ...sec, order: i + 1 }));
    setSections(items);

    try {
      await reorderSections({
        providerId,
        updates: items.map(item => ({ id: item._id, order: item.order }))
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reorder sections");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-blue-600 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{course.title}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest",
                course.status === "published" ? "bg-emerald-100 text-emerald-700" : 
                course.status === "in_review" ? "bg-blue-100 text-blue-700" :
                course.status === "rejected" ? "bg-red-100 text-red-700" :
                "bg-amber-100 text-amber-700"
              )}>
                {course.status === "published" ? "Published" : 
                 course.status === "in_review" ? "In Review" :
                 course.status === "rejected" ? "Changes Requested" :
                 "Draft"}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Curriculum Builder & Course Management</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm active:scale-95"
             >
               <Settings className="w-4 h-4" />
               Settings
             </button>
              {course.status !== "published" && course.status !== "in_review" && (
                <button 
                  disabled={isPublishing}
                  onClick={handleSubmitForReview}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all text-sm active:scale-95",
                    "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20"
                  )}
                >
                  {isPublishing ? "Submitting..." : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Submit for Review
                    </>
                  )}
                </button>
              )}
              {course.status === "in_review" && (
                <div className="px-5 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl text-sm border border-blue-100">
                  Under Review
                </div>
              )}
           </div>
        </div>

        {actionError && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-bold">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            {actionError}
          </div>
        )}

        {course.status === "rejected" && course.rejectionReason && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl md:rounded-2xl">
            <h3 className="text-red-800 font-bold text-lg mb-2">Changes Requested</h3>
            <p className="text-red-900/70">{course.rejectionReason}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl md:rounded-2xl p-5 sm:p-8 border border-slate-100 shadow-md shadow-blue-600/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg sm:text-xl font-bold">Course Curriculum</h2>
                <button 
                  onClick={() => setIsAddingSection(true)}
                  className="flex items-center gap-2 text-blue-600 font-bold hover:underline text-sm"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add Section
                </button>
              </div>

              <div className="space-y-4">
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="sections" type="section">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {sections.map((section, index: number) => (
                          <Draggable key={section._id} draggableId={section._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <SectionItem 
                                  section={section} 
                                  dragHandleProps={provided.dragHandleProps}
                                  onDelete={() => handleDeleteSection(section._id)}
                                  onAddLesson={() => setAddingLessonToSection(section._id)}
                                  isAddingLesson={addingLessonToSection === section._id}
                                  onCancelLesson={() => setAddingLessonToSection(null)}
                                  newLessonTitle={newLessonTitle}
                                  onChangeNewLessonTitle={setNewLessonTitle}
                                  onSubmitLesson={() => handleCreateLesson(section._id)}
                                  deleteLesson={(lessonId: Id<"lessons">) => handleDeleteLesson(lessonId)}
                                  onEditLesson={(lessonId: string) => setEditingLessonId(lessonId)}
                                  reorderLessons={reorderLessons}
                                  providerId={providerId}
                                  onMoveUp={index > 0 ? () => moveSection(index, -1) : undefined}
                                  onMoveDown={index < sections.length - 1 ? () => moveSection(index, 1) : undefined}
                                  onError={setActionError}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {isAddingSection && (
                  <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-blue-600/30 animate-in fade-in slide-in-from-top-4 mt-4">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Enter section title..."
                      className="w-full bg-transparent text-base sm:text-lg font-bold focus:outline-none mb-4"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateSection()}
                    />
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setIsAddingSection(false)} className="px-4 py-2.5 text-slate-500 font-bold hover:text-slate-700 transition-colors">Cancel</button>
                      <button onClick={handleCreateSection} className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95">Save Section</button>
                    </div>
                  </div>
                )}

                {sections.length === 0 && !isAddingSection && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl md:rounded-2xl mt-4 px-4">
                    <p className="text-muted-foreground">No sections yet. Start by adding your first section.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-600 text-white rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Course Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Sections</span>
                  <span className="font-bold">{sections.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Price</span>
                  <span className="font-bold">{formatPrice(course.price)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl md:rounded-2xl p-6 sm:p-8 border border-blue-100">
              <h3 className="font-bold text-lg text-blue-600 mb-2">Pro Tip</h3>
              <p className="text-sm text-blue-700/70 leading-relaxed">
                Break your course into small, manageable lessons (5-10 minutes) to keep students engaged. On desktop, drag the grip handle to reorder — on mobile, use the ▲▼ buttons.
              </p>
            </div>

            <UploadCenter courseId={courseId as Id<"courses">} />
          </div>
        </div>
      </div>

      
      {editingLessonId && (
        <LessonEditor 
          lessonId={editingLessonId} 
          onClose={() => setEditingLessonId(null)}
          updateLesson={updateLesson}
          providerId={providerId}
        />
      )}

      {isSettingsOpen && (
        <CourseSettingsModal
          course={course}
          onClose={() => setIsSettingsOpen(false)}
          providerId={providerId}
        />
      )}
    </div>
  );
}

// ─── Course Settings Modal (wired to updateCourse) ───────────────────────

function CourseSettingsModal({ course, onClose, providerId }: {
  course: Doc<"courses">;
  onClose: () => void;
  providerId: string;
}) {
  const updateCourse = useMutation(api.courses.updateCourse);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description,
    price: String(course.price),
    duration: course.duration,
    category: course.category,
    level: course.level,
    thumbnailUrl: course.thumbnailUrl,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fxRate = useFxRate();

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setFormData(prev => ({ ...prev, thumbnailUrl: storageId }));
    } catch {
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateCourse({
        providerId,
        id: course._id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        duration: formData.duration,
        category: formData.category,
        level: formData.level,
        thumbnailUrl: formData.thumbnailUrl,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save course settings");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50  border border-slate-200  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-sm";
  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/40 backdrop-blur-sm p-0 sm:p-6">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-[32px] sm:rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        <div className="p-5 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Course Settings</h2>
            <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-md">{course.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 sm:p-8 space-y-5 overflow-y-auto flex-grow">
          <div className="space-y-2">
            <label className={labelClass}>Course Title</label>
            <input 
              type="text" 
              className={inputClass}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Description</label>
            <textarea 
              rows={3}
              className={cn(inputClass, "resize-none")}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className={labelClass}>Price (₦ — 0 for free)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-400 text-sm">₦</span>
                <input 
                  type="number"
                  min="0"
                  inputMode="numeric"
                  className={cn(inputClass, "pl-8")}
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              {parseFloat(formData.price) > 0 && (
                <p className="text-[10px] text-muted-foreground font-medium">
                  ≈ {formatPrice(ngnToUsd(parseFloat(formData.price), fxRate), "USD")} • you earn {formatPrice(Math.round(parseFloat(formData.price) * 0.6))}/sale
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Duration</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="e.g. 12h 30m"
                  className={cn(inputClass, "pl-9")}
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className={labelClass}>Category</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <select 
                  className={cn(inputClass, "pl-9 appearance-none")}
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Difficulty Level</label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <select 
                  className={cn(inputClass, "pl-9 appearance-none")}
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                >
                  {LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Thumbnail</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleThumbnailChange} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full p-4 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
              ) : (
                <>Change Thumbnail Image</>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        <div className="p-5 sm:p-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-slate-50/50 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 sm:px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={isSaving || isUploading}
            onClick={handleSave}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section Item ────────────────────────────────────────────────────────

function SectionItem({ 
  section,
  dragHandleProps,
  onDelete, 
  onAddLesson, 
  isAddingLesson, 
  onCancelLesson, 
  newLessonTitle, 
  onChangeNewLessonTitle, 
  onSubmitLesson,
  deleteLesson,
  onEditLesson,
  reorderLessons,
  providerId,
  onMoveUp,
  onMoveDown,
  onError
}: {
  section: Doc<"sections">;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  onDelete: () => void;
  onAddLesson: () => void;
  isAddingLesson: boolean;
  onCancelLesson: () => void;
  newLessonTitle: string;
  onChangeNewLessonTitle: (v: string) => void;
  onSubmitLesson: () => void;
  deleteLesson: (lessonId: Id<"lessons">) => void;
  onEditLesson: (lessonId: string) => void;
  reorderLessons: ReturnType<typeof useMutation<typeof api.content.reorderLessons>>;
  providerId: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onError: (msg: string | null) => void;
}) {
  const rawLessons = useQuery(api.content.listLessons, { sectionId: section._id });
  const [lessons, setLessons] = useState<Doc<"lessons">[]>([]);

  useEffect(() => {
    if (rawLessons) {
      const timer = setTimeout(() => {
        setLessons([...rawLessons].sort((a, b) => a.order - b.order));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [rawLessons]);

  const onLessonDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const newLessons = Array.from(lessons);
    const [reorderedLesson] = newLessons.splice(result.source.index, 1);
    newLessons.splice(result.destination.index, 0, reorderedLesson);

    const items = newLessons.map((les, index) => ({
      ...les,
      order: index + 1
    }));

    setLessons(items);

    try {
      await reorderLessons({
        providerId,
        updates: items.map(item => ({ id: item._id, order: item.order }))
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to reorder lessons");
    }
  };

  // Touch-friendly lesson reorder
  const moveLesson = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const newLessons = Array.from(lessons);
    const [moved] = newLessons.splice(index, 1);
    newLessons.splice(targetIndex, 0, moved);

    const items = newLessons.map((les, i) => ({ ...les, order: i + 1 }));
    setLessons(items);

    try {
      await reorderLessons({
        providerId,
        updates: items.map(item => ({ id: item._id, order: item.order }))
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to reorder lessons");
    }
  };

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
      <div className="bg-slate-50 p-4 sm:p-5 flex items-center justify-between gap-3 group">
        <div className="flex items-center gap-2 sm:gap-3 font-bold min-w-0">
          <div {...dragHandleProps} className="hidden md:block shrink-0">
            <GripVertical className="w-5 h-5 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500 transition-colors" />
          </div>
          <span className="truncate text-sm sm:text-base">{section.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Touch-friendly move buttons (mobile) */}
          <div className="flex md:hidden flex-col">
            <button 
              onClick={onMoveUp} 
              disabled={!onMoveUp}
              className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
              aria-label="Move section up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button 
              onClick={onMoveDown} 
              disabled={!onMoveDown}
              className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
              aria-label="Move section down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <button onClick={onAddLesson} className="p-2 hover:bg-white rounded-lg text-blue-600 transition-colors" aria-label="Add lesson">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors" aria-label="Delete section">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-2 space-y-1">
        <DragDropContext onDragEnd={onLessonDragEnd}>
          <Droppable droppableId={`section-${section._id}`} type="lesson">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {lessons.map((lesson, index: number) => (
                  <Draggable key={lesson._id} draggableId={lesson._id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-slate-50 group transition-colors bg-white gap-2"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                           <div {...provided.dragHandleProps} className="hidden sm:block text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0">
                             <GripVertical className="w-4 h-4" />
                           </div>
                           <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                             <PlayCircle className="w-4 h-4" />
                           </div>
                           <span className="text-sm font-medium truncate">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                           {/* Touch-friendly move buttons (mobile) */}
                           <div className="flex sm:hidden flex-col">
                             <button 
                               onClick={() => moveLesson(index, -1)} 
                               disabled={index === 0}
                               className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                               aria-label="Move lesson up"
                             >
                               <ChevronUp className="w-3.5 h-3.5" />
                             </button>
                             <button 
                               onClick={() => moveLesson(index, 1)} 
                               disabled={index === lessons.length - 1}
                               className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                               aria-label="Move lesson down"
                             >
                               <ChevronDown className="w-3.5 h-3.5" />
                             </button>
                           </div>
                           <button 
                            onClick={() => onEditLesson(lesson._id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                            aria-label="Edit lesson"
                           >
                             <Pencil className="w-3.5 h-3.5" />
                           </button>
                           <button onClick={() => deleteLesson(lesson._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" aria-label="Delete lesson">
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {isAddingLesson && (
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 mt-2">
            <input 
               autoFocus
               type="text" 
               placeholder="Lesson title..."
               className="w-full bg-transparent text-sm font-bold focus:outline-none mb-3"
               value={newLessonTitle}
               onChange={(e) => onChangeNewLessonTitle(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && onSubmitLesson()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={onCancelLesson} className="text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
              <button onClick={onSubmitLesson} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all active:scale-95">
                Add Lesson
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lesson Editor ───────────────────────────────────────────────────────

function LessonEditor({ lessonId, onClose, updateLesson, providerId }: {
  lessonId: string;
  onClose: () => void;
  updateLesson: ReturnType<typeof useMutation<typeof api.content.updateLesson>>;
  providerId: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/40 backdrop-blur-sm p-0 sm:p-6">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-[32px] sm:rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        <LessonEditorForm lessonId={lessonId} onClose={onClose} updateLesson={updateLesson} providerId={providerId} />
      </div>
    </div>
  );
}

function LessonEditorForm({ lessonId, onClose, updateLesson, providerId }: {
  lessonId: string;
  onClose: () => void;
  updateLesson: ReturnType<typeof useMutation<typeof api.content.updateLesson>>;
  providerId: string;
}) {
  const lesson = useQuery(api.content.getLessonById, { id: lessonId as Id<"lessons"> });
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    videoUrl: string;
    duration: string;
    isFree: boolean;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (lesson && !formData) {
      setFormData({
        title: lesson.title,
        content: lesson.content || "",
        videoUrl: lesson.videoUrl || "",
        duration: lesson.duration || "",
        isFree: lesson.isFree || false,
      });
    }
  }, [lesson, formData]);

  if (!lesson || !formData) return (
    <div className="p-12 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateLesson({
        providerId,
        id: lessonId as Id<"lessons">,
        ...formData
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lesson");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50  border border-slate-200  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-sm";
  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block";

  return (
    <div className="flex flex-col h-full max-h-[92vh] sm:max-h-[90vh]">
      <div className="p-5 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold">Edit Lesson</h2>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{formData.title}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors shrink-0">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-grow">
        <div className="space-y-2">
          <label className={labelClass}>Lesson Title</label>
          <input 
            type="text" 
            className={inputClass}
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className={labelClass}>Video URL</label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="YouTube or Vimeo link"
                className={cn(inputClass, "pl-9")}
                value={formData.videoUrl}
                onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Duration</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="e.g. 10m 30s"
                className={cn(inputClass, "pl-9")}
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Lesson Content (Markdown)</label>
          <textarea 
            rows={8}
            placeholder="Add structured text content, links, or code blocks..."
            className={cn(inputClass, "resize-none font-mono")}
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
           <input 
             type="checkbox" 
             id="isFree"
             className="w-5 h-5 rounded-lg accent-blue-800"
             checked={formData.isFree}
             onChange={(e) => setFormData({...formData, isFree: e.target.checked})}
           />
           <label htmlFor="isFree" className="text-sm font-bold cursor-pointer">Preview Lesson (Free for all students)</label>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}
      </div>

      <div className="p-5 sm:p-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-slate-50/50 shrink-0">
        <button 
          onClick={onClose}
          className="px-4 sm:px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button 
          disabled={isSaving}
          onClick={handleSave}
          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95"
        >
          {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
