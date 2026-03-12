"use client";

import React, { useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { 
  ArrowLeft, 
  Plus, 
  GripVertical, 
  Pencil, 
  Trash2, 
  Video, 
  FileText,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  PlusCircle,
  PlayCircle
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ManageCoursePage({ params }: PageProps) {
  const { id: courseId } = use(params) as { id: any };
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const course = useQuery(api.courses.getById, { id: courseId });
  const sections = useQuery(api.content.listSections, { courseId });
  
  const createSection = useMutation(api.content.createSection);
  const deleteSection = useMutation(api.content.deleteSection);
  const createLesson = useMutation(api.content.createLesson);
  const deleteLesson = useMutation(api.content.deleteLesson);

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingLessonToSection, setAddingLessonToSection] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (!course) {
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
      order: (sections?.length || 0) + 1,
    });
    setNewSectionTitle("");
    setIsAddingSection(false);
  };

  const handleCreateLesson = async (sectionId: any) => {
    if (!newLessonTitle.trim()) return;
    await createLesson({
      sectionId,
      title: newLessonTitle,
      order: 1, // Simplified for now
      isFree: false,
    });
    setNewLessonTitle("");
    setAddingLessonToSection(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-blue-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-muted-foreground mt-1">Curriculum Builder & Course Management</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 transition-all">
               Settings
             </button>
             <button className="px-6 py-3 bg-blue-800 text-white rounded-2xl font-bold shadow-lg shadow-blue-800/20 hover:bg-blue-900 transition-all">
               Publish Course
             </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content: Curriculum Builder */}
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
                {sections?.map((section) => (
                  <SectionItem 
                    key={section._id} 
                    section={section} 
                    onDelete={() => deleteSection({ id: section._id })}
                    onAddLesson={() => setAddingLessonToSection(section._id)}
                    isAddingLesson={addingLessonToSection === section._id}
                    onCancelLesson={() => setAddingLessonToSection(null)}
                    newLessonTitle={newLessonTitle}
                    onChangeNewLessonTitle={setNewLessonTitle}
                    onSubmitLesson={() => handleCreateLesson(section._id)}
                    deleteLesson={(lessonId: any) => deleteLesson({ id: lessonId })}
                  />
                ))}

                {isAddingSection && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-blue-800/30 animate-in fade-in slide-in-from-top-4">
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
                      <button 
                        onClick={() => setIsAddingSection(false)}
                        className="px-4 py-2 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleCreateSection}
                        className="px-6 py-2 bg-blue-800 text-white rounded-xl font-bold hover:bg-blue-900 transition-all"
                      >
                        Save Section
                      </button>
                    </div>
                  </div>
                )}

                {sections?.length === 0 && !isAddingSection && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">
                    <p className="text-muted-foreground">No sections yet. Start by adding your first section.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Quick Stats & Tips */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-[32px] p-8">
              <h3 className="font-bold text-lg mb-4">Course Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Sections</span>
                  <span className="font-bold">{sections?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Lessons</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Duration</span>
                  <span className="font-bold">0m</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[32px] p-8 border border-blue-100 dark:border-blue-900/30">
              <h3 className="font-bold text-lg text-blue-800 dark:text-cyan-400 mb-2">Pro Tip</h3>
              <p className="text-sm text-blue-900/70 dark:text-blue-200/70 leading-relaxed">
                Break your course into small, manageable lessons (5-10 minutes) to keep students engaged and help them track progress easily.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionItem({ 
  section, 
  onDelete, 
  onAddLesson, 
  isAddingLesson, 
  onCancelLesson, 
  newLessonTitle, 
  onChangeNewLessonTitle, 
  onSubmitLesson,
  deleteLesson
}: any) {
  const lessons = useQuery(api.content.listLessons, { sectionId: section._id });

  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-800/30 p-5 flex items-center justify-between group">
        <div className="flex items-center gap-3 font-bold">
          <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />
          {section.title}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onAddLesson} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-blue-800 dark:text-cyan-400 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-2 space-y-1">
        {lessons?.map((lesson: any) => (
          <div key={lesson._id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-cyan-400 rounded-lg flex items-center justify-center">
                 <PlayCircle className="w-4 h-4" />
               </div>
               <span className="text-sm font-medium">{lesson.title}</span>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500">
                  <Pencil className="w-3.5 h-3.5" />
               </button>
               <button onClick={() => deleteLesson(lesson._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
               </button>
            </div>
          </div>
        ))}

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
              <button 
                onClick={onSubmitLesson}
                className="bg-blue-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-900"
              >
                Add Lesson
              </button>
            </div>
          </div>
        )}

        {lessons?.length === 0 && !isAddingLesson && (
          <div className="text-center py-6">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Empty Section</p>
          </div>
        )}
      </div>
    </div>
  );
}
