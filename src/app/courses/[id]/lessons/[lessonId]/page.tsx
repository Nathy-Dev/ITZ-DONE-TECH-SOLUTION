"use client";

import React, { use, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id, Doc } from "../../../../../../convex/_generated/dataModel";
import { 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  ChevronDown,
  PlayCircle,
  Clock,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Circle,
  Lock
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import MarkdownRenderer from "@/components/courses/MarkdownRenderer";
import LessonDiscussion from "@/components/lessons/LessonDiscussion";
import CertificateButton from "@/components/courses/CertificateButton";

const VideoPlayer = dynamic(() => import("@/components/courses/VideoPlayer"), { 
  ssr: false,
  loading: () => (
    <div className="aspect-video w-full bg-slate-900 rounded-[2rem] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-800 border-t-transparent"></div>
    </div>
  )
});

interface PageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

export default function LessonViewerPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id as Id<"courses">;
  const lessonId = resolvedParams.lessonId as Id<"lessons"> | "start";
  const { data: session } = useSession();
  const router = useRouter();
  
  const course = useQuery(api.courses.getById, { id: courseId });
  const lesson = useQuery(api.content.getLessonById, 
    lessonId === "start" ? "skip" : { id: lessonId }
  );
  const sections = useQuery(api.content.listSections, { courseId });
  
  const convexUser = useQuery(api.users.getUserByProviderId, 
    session?.user?.id ? { 
      providerId: session.user.id,
      email: session.user.email ?? undefined 
    } : "skip"
  );

  const enrollment = useQuery(api.enrollments.getEnrollment, 
    convexUser?._id ? { courseId, userId: convexUser._id } : "skip"
  );

  const progress = useQuery(api.progress.getCourseProgress, 
    convexUser?._id ? { courseId, userId: convexUser._id } : "skip"
  );

  const completedLessonIds = useQuery(api.progress.getCompletedLessonIds, 
    convexUser?._id ? { courseId, userId: convexUser._id } : "skip"
  ) || [];

  const toggleCompletion = useMutation(api.progress.toggleLessonCompletion);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const firstLesson = useQuery(api.content.getFirstLesson, { courseId });
  const allLessons = useQuery(api.content.listAllLessonsOrdered, { courseId });

  // Handle "start" redirect
  useEffect(() => {
    if (lessonId === "start" && firstLesson) {
      router.replace(`/courses/${courseId}/lessons/${firstLesson._id}`);
    }
  }, [lessonId, firstLesson, courseId, router]);

  if (!course || (lessonId !== "start" && !lesson)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-800 border-t-transparent"></div>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const isLocked = !isEnrolled && lesson && !lesson.isFree;

  if (isLocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black">This lesson is locked</h1>
          <p className="text-slate-500 max-w-md">Please enroll in the course to access all lessons and resources.</p>
        </div>
        <Link 
          href={`/courses/${courseId}`}
          className="px-8 py-4 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-800/20"
        >
          View Course Details
        </Link>
      </div>
    );
  }

  const handleToggleComplete = async () => {
    if (!convexUser || !lesson) return;
    await toggleCompletion({
      lessonId: lesson._id,
      courseId,
      userId: convexUser._id,
    });
  };

  // Find next and previous lessons for navigation
  
  const currentIndex = allLessons?.findIndex(l => l._id === lessonId) ?? -1;
  const prevLesson = currentIndex > 0 ? allLessons?.[currentIndex - 1] : null;
  const nextLesson = currentIndex < (allLessons?.length ?? 0) - 1 ? allLessons?.[currentIndex + 1] : null;

  const navigateTo = (lId: string) => {
    router.push(`/courses/${courseId}/lessons/${lId}`);
  };

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
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lesson?.title || "Starting Course..."}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {progress && (
            <div className="flex items-center gap-4">
              <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                 <div 
                  className="h-full bg-blue-800 transition-all duration-1000" 
                  style={{ width: `${progress.percentage}%` }} 
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:block">
                {progress.percentage}% Complete
              </span>
            </div>
          )}
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
                  completedLessonIds={completedLessonIds}
                  isEnrolled={isEnrolled}
                />
             ))}
          </div>
        </aside>

        {/* Main Lesson Content */}
        <main className="flex-grow overflow-y-auto bg-white dark:bg-slate-950">
          {lessonId === "start" ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-6 p-12 text-center">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center text-blue-800 dark:text-cyan-400">
                <Play className="w-12 h-12 fill-current translate-x-1" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black">Ready to start?</h2>
                <p className="text-slate-500 max-w-sm">Select a lesson from the sidebar to begin your learning journey.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Video Player Section */}
              <div className="aspect-video w-full bg-slate-950 flex items-center justify-center relative group">
                {lesson?.videoUrl ? (
                  <VideoPlayer 
                    url={lesson.videoUrl} 
                    title={lesson.title}
                    onEnded={() => {
                        if (!completedLessonIds.includes(lesson._id)) {
                            handleToggleComplete();
                        }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-500 gap-4">
                      <PlayCircle className="w-16 h-16 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-xs">No video for this lesson</p>
                  </div>
                )}
              </div>

              {/* Lesson Text Content */}
              <div className="max-w-4xl mx-auto p-12 space-y-8">
                <div className="flex justify-between items-start gap-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black tracking-tighter">{lesson?.title}</h2>
                    <div className="flex items-center gap-6 text-xs font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{lesson?.duration || "10m"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Lesson Documentation</span>
                        </div>
                    </div>
                  </div>

                  {isEnrolled && lesson && (
                    <button 
                      onClick={handleToggleComplete}
                      className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg",
                        completedLessonIds.includes(lesson._id)
                          ? "bg-emerald-100 text-emerald-700 shadow-emerald-200"
                          : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                      )}
                    >
                      {completedLessonIds.includes(lesson._id) ? (
                        <><CheckCircle2 className="w-4 h-4 transition-all" /> Completed</>
                      ) : (
                        <><Circle className="w-4 h-4" /> Mark as Done</>
                      )}
                    </button>
                  )}
                </div>

                <article className="prose prose-slate dark:prose-invert max-w-none">
                  {lesson?.content ? (
                    <MarkdownRenderer content={lesson.content} />
                  ) : (
                    <div className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px] text-center">
                        <p className="text-slate-400 font-bold">No additional resources for this lesson.</p>
                    </div>
                  )}
                </article>

                {lesson && isEnrolled && (
                  <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
                    <LessonDiscussion lessonId={lesson._id} />
                  </div>
                )}

                {/* Navigation Buttons */}
                {progress?.percentage === 100 && (
                  <div className="pt-8">
                    <CertificateButton 
                      courseId={courseId} 
                      studentName={session?.user?.name || "Student"} 
                      courseTitle={course.title} 
                      progress={progress.percentage}
                    />
                  </div>
                )}
                <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <button 
                    onClick={() => prevLesson && navigateTo(prevLesson._id)}
                    disabled={!prevLesson}
                    className="flex items-center gap-3 px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm group disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      Previous
                  </button>
                  <button 
                    onClick={() => nextLesson && navigateTo(nextLesson._id)}
                    disabled={!nextLesson}
                    className="flex items-center gap-3 px-8 py-3 bg-blue-800 text-white rounded-2xl font-bold hover:bg-blue-900 shadow-xl shadow-blue-800/20 transition-all text-sm group disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                      {nextLesson ? "Next Lesson" : "End of Course"}
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarSection({ section, activeLessonId, courseId, completedLessonIds, isEnrolled }: {
  section: Doc<"sections">;
  activeLessonId: string;
  courseId: Id<"courses">;
  completedLessonIds: Id<"lessons">[];
  isEnrolled: boolean;
}) {
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
          {lessons?.map((l) => {
            const isActive = l._id === activeLessonId;
            const isCompleted = completedLessonIds.includes(l._id);
            const isLocked = !isEnrolled && !l.isFree;

            return (
              <div key={l._id} className="relative group/item">
                <Link 
                  href={isLocked ? "#" : `/courses/${courseId}/lessons/${l._id}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-[14px] transition-all relative",
                    isActive 
                      ? "bg-blue-800 text-white shadow-lg shadow-blue-800/20" 
                      : isLocked 
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                  onClick={(e) => isLocked && e.preventDefault()}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                    isActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-emerald-500")} />
                    ) : isActive ? (
                      <PlayCircle className="w-4 h-4 fill-current" />
                    ) : isLocked ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-[11px] font-bold tracking-tight truncate w-40",
                      isCompleted && !isActive && "text-slate-400 line-through decoration-emerald-500/30"
                    )}>
                      {l.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] opacity-60 font-medium">{l.duration || "10m"}</span>
                      {l.isFree && !isActive && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded font-black uppercase tracking-widest">Free</span>}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
