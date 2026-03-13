"use client";

import React, { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  ChevronDown,
  PlayCircle,
  Clock,
  ArrowLeft,
  Video,
  FileText
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
// import ReactMarkdown from 'react-markdown';

interface PageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

export default function LessonViewerPage({ params }: PageProps) {
  const { id: courseId, lessonId } = use(params) as { id: any; lessonId: any };
  const course = useQuery(api.courses.getById, { id: courseId });
  const lesson = useQuery(api.content.getLessonById, { id: lessonId });
  const sections = useQuery(api.content.listSections, { courseId });
  
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!course || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-800 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${courseId}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="hidden md:block">
            <h1 className="font-black text-sm tracking-tight truncate max-w-md">{course.title}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lesson.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
             <div className="h-full bg-blue-800 w-1/3" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:block">35% Complete</span>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className={cn(
          "w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/50 dark:bg-slate-900/50 transition-all duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full absolute lg:relative z-30 h-full"
        )}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
             <h2 className="font-black text-xs uppercase tracking-[0.2em] text-blue-800 dark:text-cyan-400">Course Content</h2>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
             {sections?.map((section) => (
                <SidebarSection 
                  key={section._id} 
                  section={section} 
                  activeLessonId={lessonId}
                  courseId={courseId}
                />
             ))}
          </div>
        </aside>

        {/* Main Lesson Content */}
        <main className="flex-grow overflow-y-auto bg-white dark:bg-slate-950">
          {/* Video Player Section */}
          <div className="aspect-video w-full bg-slate-950 flex items-center justify-center relative group">
             {lesson.videoUrl ? (
               <div className="w-full h-full">
                  {/* Real video player would go here, using a placeholder for now */}
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-4">
                    <Video className="w-24 h-24" />
                    <p className="font-black uppercase tracking-[0.3em] text-xs">Video Content Ready</p>
                    <p className="text-[10px] opacity-50">{lesson.videoUrl}</p>
                    <button className="mt-8 w-20 h-20 bg-blue-800 text-white rounded-full flex items-center justify-center hover:scale-110 shadow-2xl transition-all">
                      <Play className="w-8 h-8 fill-current translate-x-1" />
                    </button>
                  </div>
               </div>
             ) : (
               <div className="flex flex-col items-center text-slate-500 gap-4">
                  <PlayCircle className="w-16 h-16 opacity-20" />
                  <p className="font-black uppercase tracking-widest text-xs">No video for this lesson</p>
               </div>
             )}
          </div>

          {/* Lesson Text Content */}
          <div className="max-w-4xl mx-auto p-12 space-y-8">
            <div className="space-y-4">
               <h2 className="text-4xl font-black tracking-tighter">{lesson.title}</h2>
               <div className="flex items-center gap-6 text-xs font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.duration || "10m"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Lesson Documentation</span>
                  </div>
               </div>
            </div>

            <article className="prose prose-slate dark:prose-invert max-w-none">
               {lesson.content ? (
                 <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                    {lesson.content}
                 </div>
               ) : (
                 <div className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px] text-center">
                    <p className="text-slate-400 font-bold">No additional resources for this lesson.</p>
                 </div>
               )}
            </article>

            {/* Navigation Buttons */}
            <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex justify-between">
               <button className="flex items-center gap-3 px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm group">
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Previous Lesson
               </button>
               <button className="flex items-center gap-3 px-8 py-3 bg-blue-800 text-white rounded-2xl font-bold hover:bg-blue-900 shadow-xl shadow-blue-800/20 transition-all text-sm group">
                  Next Lesson
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarSection({ section, activeLessonId, courseId }: any) {
  const lessons = useQuery(api.content.listLessons, { sectionId: section._id });
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
           <div className={cn(
             "w-2 h-2 rounded-full",
             isOpen ? "bg-blue-800" : "bg-slate-300"
           )} />
           <span className="text-sm font-black tracking-tight">{section.title}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", !isOpen && "-rotate-90")} />
      </button>

      {isOpen && (
        <div className="pl-4 space-y-1 mt-1">
          {lessons?.map((l: any) => {
            const isActive = l._id === activeLessonId;
            return (
              <Link 
                key={l._id} 
                href={`/courses/${courseId}/lessons/${l._id}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-[14px] transition-all group/item relative",
                  isActive 
                    ? "bg-blue-800 text-white shadow-lg shadow-blue-800/20" 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                  isActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
                )}>
                  {isActive ? <PlayCircle className="w-4 h-4 fill-current" /> : <Play className="w-3 h-3 h-3" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold tracking-tight truncate w-44">{l.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] opacity-60 font-medium">{l.duration || "10m"}</span>
                    {l.isFree && !isActive && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded font-black uppercase tracking-widest">Free</span>}
                  </div>
                </div>
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
