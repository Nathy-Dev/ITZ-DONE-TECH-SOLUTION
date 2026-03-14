"use client";

import React, { useState, use, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
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
  Rocket
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import UploadCenter from "@/components/courses/UploadCenter";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ManageCoursePage({ params }: PageProps) {
  const { id: courseId } = use(params) as { id: any };
  const { status } = useSession();
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const course = useQuery(api.courses.getById, { id: courseId });
  const rawSections = useQuery(api.content.listSections, { courseId });
  
  const createSection = useMutation(api.content.createSection);
  const deleteSection = useMutation(api.content.deleteSection);
  const createLesson = useMutation(api.content.createLesson);
  const updateLesson = useMutation(api.content.updateLesson);
  const deleteLesson = useMutation(api.content.deleteLesson);
  const togglePublish = useMutation(api.courses.togglePublish);
  
  const reorderSections = useMutation(api.content.reorderSections);
  const reorderLessons = useMutation(api.content.reorderLessons);

  const [sections, setSections] = useState<any[]>([]);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingLessonToSection, setAddingLessonToSection] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

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

  if (!course || !isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-800 border-t-transparent"></div>
      </div>
    );
  }

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    await createSection({
      courseId,
      title: newSectionTitle,
      order: sections.length + 1,
    });
    setNewSectionTitle("");
    setIsAddingSection(false);
  };

  const handleCreateLesson = async (sectionId: any) => {
    if (!newLessonTitle.trim()) return;
    await createLesson({
      sectionId,
      title: newLessonTitle,
      order: 999, // Will be ordered correctly by backend/frontend soon Ideally 1 + length.
      isFree: false,
    });
    setNewLessonTitle("");
    setAddingLessonToSection(null);
  };

  const handleTogglePublish = async () => {
    setIsPublishing(true);
    try {
      await togglePublish({ id: courseId });
    } catch (error) {
       console.error(error);
    } finally {
      setIsPublishing(false);
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

      await reorderSections({
        updates: items.map(item => ({ id: item._id, order: item.order }))
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-blue-800 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                course.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}>
                {course.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">Curriculum Builder & Course Management</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm">
               Settings
             </button>
             <button 
               disabled={isPublishing}
               onClick={handleTogglePublish}
               className={cn(
                 "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all text-sm",
                 course.isPublished 
                  ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-300" 
                  : "bg-blue-800 text-white hover:bg-blue-900 shadow-lg shadow-blue-800/20"
               )}
             >
               {isPublishing ? "Processing..." : (
                 <>
                   <Rocket className="w-4 h-4" />
                   {course.isPublished ? "Unpublish Course" : "Publish Course"}
                 </>
               )}
             </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Course Curriculum</h2>
                <button 
                  onClick={() => setIsAddingSection(true)}
                  className="flex items-center gap-2 text-blue-800 dark:text-cyan-400 font-bold hover:underline"
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
                        {sections.map((section, index) => (
                          <Draggable key={section._id} draggableId={section._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <SectionItem 
                                  section={section} 
                                  dragHandleProps={provided.dragHandleProps}
                                  onDelete={() => deleteSection({ id: section._id })}
                                  onAddLesson={() => setAddingLessonToSection(section._id)}
                                  isAddingLesson={addingLessonToSection === section._id}
                                  onCancelLesson={() => setAddingLessonToSection(null)}
                                  newLessonTitle={newLessonTitle}
                                  onChangeNewLessonTitle={setNewLessonTitle}
                                  onSubmitLesson={() => handleCreateLesson(section._id)}
                                  deleteLesson={(lessonId: any) => deleteLesson({ id: lessonId })}
                                  onEditLesson={(lessonId: string) => setEditingLessonId(lessonId)}
                                  reorderLessons={reorderLessons}
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
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-blue-800/30 animate-in fade-in slide-in-from-top-4 mt-4">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Enter section title..."
                      className="w-full bg-transparent text-lg font-bold focus:outline-none mb-4"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateSection()}
                    />
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setIsAddingSection(false)} className="px-4 py-2 text-slate-500 font-bold hover:text-slate-700 transition-colors">Cancel</button>
                      <button onClick={handleCreateSection} className="px-6 py-2 bg-blue-800 text-white rounded-xl font-bold hover:bg-blue-900 transition-all">Save Section</button>
                    </div>
                  </div>
                )}

                {sections.length === 0 && !isAddingSection && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px] mt-4">
                    <p className="text-muted-foreground">No sections yet. Start by adding your first section.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-[32px] p-8">
              <h3 className="font-bold text-lg mb-4">Course Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Sections</span>
                  <span className="font-bold">{sections.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[32px] p-8 border border-blue-100 dark:border-blue-900/30">
              <h3 className="font-bold text-lg text-blue-800 dark:text-cyan-400 mb-2">Pro Tip</h3>
              <p className="text-sm text-blue-900/70 dark:text-blue-200/70 leading-relaxed">
                Break your course into small, manageable lessons (5-10 minutes) to keep students engaged and help them track progress easily. Drag and drop items using the grip handle to reorder your curriculum.
              </p>
            </div>

            <UploadCenter courseId={courseId} />
          </div>
        </div>
      </div>

      
      {editingLessonId && (
        <LessonEditor 
          lessonId={editingLessonId} 
          onClose={() => setEditingLessonId(null)}
          updateLesson={updateLesson}
        />
      )}
    </div>
  );
}

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
  reorderLessons
}: any) {
  const rawLessons = useQuery(api.content.listLessons, { sectionId: section._id });
  const [lessons, setLessons] = useState<any[]>([]);

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

    await reorderLessons({
      updates: items.map(item => ({ id: item._id, order: item.order }))
    });
  };

  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
      <div className="bg-slate-50 dark:bg-slate-800/30 p-5 flex items-center justify-between group">
        <div className="flex items-center gap-3 font-bold">
          <div {...dragHandleProps}>
            <GripVertical className="w-5 h-5 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500 transition-colors" />
          </div>
          {section.title}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onAddLesson} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-blue-800 dark:text-cyan-400 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-2 space-y-1">
        <DragDropContext onDragEnd={onLessonDragEnd}>
          <Droppable droppableId={`section-${section._id}`} type="lesson">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {lessons.map((lesson: any, index: number) => (
                  <Draggable key={lesson._id} draggableId={lesson._id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors bg-white dark:bg-slate-900"
                      >
                        <div className="flex items-center gap-3">
                           <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                             <GripVertical className="w-4 h-4" />
                           </div>
                           <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-cyan-400 rounded-lg flex items-center justify-center">
                             <PlayCircle className="w-4 h-4" />
                           </div>
                           <span className="text-sm font-medium">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                            onClick={() => onEditLesson(lesson._id)}
                            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                           >
                              <Pencil className="w-3.5 h-3.5" />
                           </button>
                           <button onClick={() => deleteLesson(lesson._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors">
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
          <div className="p-4 bg-blue-50/50 dark:bg-blue-900/5 rounded-xl border border-blue-200 dark:border-blue-900/30 mt-2">
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
              <button onClick={onSubmitLesson} className="bg-blue-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-900 transition-all">
                Add Lesson
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LessonEditor({ lessonId, onClose, updateLesson }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-6">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <LessonEditorForm lessonId={lessonId} onClose={onClose} updateLesson={updateLesson} />
      </div>
    </div>
  );
}

function LessonEditorForm({ lessonId, onClose, updateLesson }: any) {
  const lesson = useQuery(api.content.getLessonById, { id: lessonId });
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-800 border-t-transparent"></div>
    </div>
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateLesson({
        id: lessonId,
        ...formData
      });
      onClose();
    } catch (error) {
       console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-2xl font-bold">Edit Lesson</h2>
          <p className="text-sm text-muted-foreground">{formData.title}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-8 space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Lesson Title</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800/20"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Video URL</label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="YouTube or Vimeo link"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800/20"
                value={formData.videoUrl}
                onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="e.g. 10m 30s"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800/20"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Lesson Content (Markdown)</label>
          <textarea 
            rows={8}
            placeholder="Add structured text content, links, or code blocks..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-800/20 resize-none font-mono text-sm"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
           <input 
             type="checkbox" 
             id="isFree"
             className="w-5 h-5 rounded-lg accent-blue-800"
             checked={formData.isFree}
             onChange={(e) => setFormData({...formData, isFree: e.target.checked})}
           />
           <label htmlFor="isFree" className="text-sm font-bold cursor-pointer">Preview Lesson (Free for all students)</label>
        </div>
      </div>

      <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
        <button 
          onClick={onClose}
          className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button 
          disabled={isSaving}
          onClick={handleSave}
          className="px-8 py-3 bg-blue-800 text-white rounded-2xl font-bold shadow-lg shadow-blue-800/20 hover:bg-blue-900 transition-all flex items-center gap-2"
        >
          {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
