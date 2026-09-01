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
  Lock,
  BookOpen,
  X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import MarkdownRenderer from "@/components/courses/MarkdownRenderer";
import LessonDiscussion from "@/components/lessons/LessonDiscussion";
import CertificateButton from "@/components/courses/CertificateButton";

const VideoPlayer = dynamic(() => import("@/components/courses/VideoPlayer"), { 
  ssr: false,
  loading: () => (
    <div className="aspect-video w-full bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-cyan-400"></div>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest animate-pulse">Initializing Player...</p>
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

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const firstLesson = useQuery(api.content.getFirstLesson, { courseId });
  const allLessons = useQuery(api.content.listAllLessonsOrdered, { courseId });
  const updateLastViewed = useMutation(api.enrollments.markLessonAsViewed);

  // Track last viewed lesson
  useEffect(() => {
    if (convexUser?._id && lessonId !== "start") {
      updateLastViewed({
        courseId,
        userId: convexUser._id,
        lessonId: lessonId as Id<"lessons">,
      }).catch(console.error);
    }
  }, [lessonId, convexUser?._id, courseId, updateLastViewed]);

  // Handle "start" redirect
  useEffect(() => {
    if (lessonId === "start" && firstLesson) {
      router.replace(`/courses/${courseId}/lessons/${firstLesson._id}`);
    }
  }, [lessonId, firstLesson, courseId, router]);

  if (!course || (lessonId !== "start" && !lesson)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const isLocked = !isEnrolled && lesson && !lesson.isFree;

  if (isLocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">This lesson is locked</h1>
          <p className="text-slate-500 max-w-md">Please enroll in the course to access all lessons and resources.</p>
        </div>
        <Link 
          href={`/courses/${courseId}`}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
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
    setSidebarOpen(false); // Close the mobile sidebar on navigation
    router.push(`/courses/${courseId}/lessons/${lId}`);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 md:h-20 border-b border-slate-100 flex items-center justify-between px-3 sm:px-8 shrink-0 bg-white/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link 
            href={`/courses/${courseId}`} 
            className="group flex items-center gap-3 p-2 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Back to Course</p>
              <h1 className="font-semibold text-sm tracking-tight truncate max-w-[200px] lg:max-w-md">{course.title}</h1>
            </div>
          </Link>
          
          <div className="h-8 w-px bg-slate-100 hidden md:block" />
          
          <div className="hidden lg:block">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Currently Learning</p>
            <p className="text-xs font-semibold text-slate-600">{lesson?.title || "Starting Course..."}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-8 shrink-0">
          {progress && (
            <div className="flex flex-col items-end gap-1.5">
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Your Progress
                </span>
                <span className="text-xs font-semibold text-blue-600">
                  {progress.percentage}%
                </span>
              </div>
              {/* Compact progress ring for mobile */}
              <div className="sm:hidden flex items-center gap-1.5">
                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-blue-600 transition-all duration-1000"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-blue-600">
                  {progress.percentage}%
                </span>
              </div>
              <div className="hidden sm:block h-1.5 w-48 bg-slate-100 rounded-full overflow-hidden relative">
                 <div
                   className="h-full bg-blue-600 transition-all duration-1000 shadow-[0_0_10px_rgba(30,64,175,0.3)]"
                   style={{ width: `${progress.percentage}%` }}
                 />
              </div>
            </div>
          )}

          <div className="h-8 w-px bg-slate-100 hidden sm:block" />

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-3 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-2xl transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          {session?.user?.image && (
            <div className="hidden sm:block">
              <Image 
                src={session.user.image} 
                alt="Profile" 
                width={40}
                height={40}
                className="rounded-2xl border-2 border-white shadow-sm"
              />
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden relative">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar Navigation */}
        <aside className={cn(
          "w-80 max-w-[85vw] border-r border-slate-100  flex flex-col shrink-0 bg-slate-50/95  lg:bg-slate-50/40  backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0 fixed lg:relative inset-y-0 left-0 z-30 shadow-sm lg:shadow-none" : "-translate-x-full fixed lg:relative z-30 h-full"
        )}>
          {/* Close button (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 bg-white rounded-xl shadow-md z-10"
            aria-label="Close course content"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
             <h2 className="font-semibold text-[11px] uppercase tracking-[0.25em] text-blue-600">Course Content</h2>
             {progress && (
               <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                 <span className="text-[9px] font-semibold text-blue-600">{progress.percentage}%</span>
               </div>
             )}
          </div>
          <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
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
        <main className="flex-grow overflow-y-auto bg-white">
          {lessonId === "start" ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-6 p-12 text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Play className="w-12 h-12 fill-current translate-x-1" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold">Ready to start?</h2>
                <p className="text-slate-500 max-w-sm">Select a lesson from the sidebar to begin your learning journey.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Video Player Section */}
              <div className="bg-slate-50 p-2 sm:p-4 lg:p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="aspect-video w-full bg-slate-950 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm relative group ring-1 ring-slate-200">
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-6 bg-slate-900/90 backdrop-blur-sm">
                          <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center">
                            <PlayCircle className="w-12 h-12 opacity-20" />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="font-semibold uppercase tracking-[0.3em] text-[10px] text-slate-400">Lesson Material</p>
                            <p className="text-sm font-bold text-slate-500">This lesson does not contain a video.</p>
                          </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lesson Text Content */}
              <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 lg:py-8 space-y-8 sm:space-y-6 pb-12 lg:pb-16">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-semibold uppercase tracking-widest rounded-full">
                        Module Content
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
                      {lesson?.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-6 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{lesson?.duration || "10m"} Duration</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Resources Available</span>
                        </div>
                    </div>
                  </div>

                  {isEnrolled && lesson && (
                    <button 
                      onClick={handleToggleComplete}
                      className={cn(
                        "flex items-center gap-3 px-5 py-2.5 rounded-2xl font-semibold text-[11px] uppercase tracking-widest transition-all duration-500 shadow-sm shrink-0 group",
                        completedLessonIds.includes(lesson._id)
                          ? "bg-emerald-500 text-white shadow-emerald-500/20"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 hover:-translate-y-1"
                      )}
                    >
                      {completedLessonIds.includes(lesson._id) ? (
                        <><CheckCircle2 className="w-4 h-4 animate-in zoom-in duration-500" /> Completed</>
                      ) : (
                        <><Circle className="w-4 h-4 group-hover:scale-125 transition-transform" /> Mark as Completed</>
                      )}
                    </button>
                  )}
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

                <article className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-slate-600 prose-p:leading-relaxed">
                  {lesson?.content ? (
                    <div className="p-2">
                      <MarkdownRenderer content={lesson.content} />
                    </div>
                  ) : (
                    <div className="p-16 border-2 border-dashed border-slate-100 rounded-2xl text-center bg-slate-50/50">
                        <p className="text-slate-400 font-bold">No additional reading resources for this lesson.</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-300 mt-2 font-semibold">Video content only</p>
                    </div>
                  )}
                </article>

                {lesson && isEnrolled && (
                  <div className="pt-16 border-t border-slate-100">
                    <div className="mb-8">
                       <h3 className="text-2xl font-semibold tracking-tight mb-2">Lesson Discussion</h3>
                       <p className="text-sm text-slate-500">Share your thoughts or ask questions about this lesson.</p>
                    </div>
                    <LessonDiscussion lessonId={lesson._id} userId={convexUser?._id || null} />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-8 sm:pt-16 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                  <button 
                    onClick={() => prevLesson && navigateTo(prevLesson._id)}
                    disabled={!prevLesson}
                    className="flex items-center gap-4 px-5 py-2.5 border-2 border-slate-100 rounded-2xl font-semibold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      Previous Lesson
                  </button>
                  
                  {progress?.percentage === 100 ? (
                    <CertificateButton 
                      courseId={courseId} 
                      userId={convexUser?._id || null}
                      studentName={session?.user?.name || "Student"} 
                      courseTitle={course.title} 
                      progress={progress.percentage}
                    />
                  ) : (
                    <button 
                      onClick={() => nextLesson && navigateTo(nextLesson._id)}
                      disabled={!nextLesson}
                      className="flex items-center gap-4 px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold text-[11px] uppercase tracking-widest hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {nextLesson ? (
                          <>
                            Next Lesson
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        ) : (
                          "End of Course"
                        )}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Sticky mobile bottom nav */}
      {lessonId !== "start" && lesson && isEnrolled && (
        <div className="lg:hidden sticky bottom-0 z-20 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-3 py-2.5 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => prevLesson && navigateTo(prevLesson._id)}
            disabled={!prevLesson}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-[11px] uppercase tracking-widest bg-slate-100 text-slate-600 transition-all disabled:opacity-30 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          
          <button
            onClick={handleToggleComplete}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[11px] uppercase tracking-widest transition-all active:scale-95",
              completedLessonIds.includes(lesson._id)
                ? "bg-emerald-500 text-white"
                : "bg-blue-600 text-white"
            )}
          >
            {completedLessonIds.includes(lesson._id) ? (
              <><CheckCircle2 className="w-4 h-4" /> Done</>
            ) : (
              <><Circle className="w-4 h-4" /> Complete</>
            )}
          </button>
          
          <button
            onClick={() => nextLesson && navigateTo(nextLesson._id)}
            disabled={!nextLesson}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-[11px] uppercase tracking-widest bg-blue-600 text-white transition-all disabled:opacity-30 active:scale-95"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
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

  const completedCount = lessons?.filter(l => completedLessonIds.includes(l._id)).length || 0;
  const totalCount = lessons?.length || 0;

  return (
    <div className="space-y-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white transition-all group"
      >
        <div className="flex items-center gap-3">
           <div className={cn(
             "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
             isOpen ? "bg-blue-600 text-white" : "bg-slate-100  text-slate-400"
           )}>
             <BookOpen className="w-3.5 h-3.5" />
           </div>
           <div className="text-left">
             <span className="text-[11px] font-semibold tracking-tight block">{section.title}</span>
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
               {completedCount}/{totalCount} Lessons
             </span>
           </div>
        </div>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-300", !isOpen && "-rotate-90")} />
      </button>

      {isOpen && (
        <div className="space-y-2 relative pl-3 border-l border-slate-100 ml-3.5">
          {lessons?.map((l) => {
            const isActive = l._id === activeLessonId;
            const isCompleted = completedLessonIds.includes(l._id);
            const isLocked = !isEnrolled && !l.isFree;

            return (
              <div key={l._id} className="relative group/item">
                <Link 
                  href={isLocked ? "#" : `/courses/${courseId}/lessons/${l._id}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl transition-all relative overflow-hidden",
                    isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                      : isLocked 
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-white  text-slate-600 "
                  )}
                  onClick={(e) => isLocked && e.preventDefault()}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-blue-500" />
                  )}
                  
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all",
                    isActive ? "bg-white/10" : "bg-slate-50  shadow-sm"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-emerald-500")} />
                    ) : isActive ? (
                      <div className="relative">
                        <PlayCircle className="w-4 h-4 fill-current animate-pulse" />
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                      </div>
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-grow">
                    <span className={cn(
                      "text-[11px] font-semibold tracking-tight truncate",
                      isCompleted && !isActive && "text-slate-400 line-through decoration-emerald-500/20"
                    )}>
                      {l.title}
                    </span>
                    <div className="flex items-center gap-2.5 mt-1">
                      <div className="flex items-center gap-1 text-[9px] font-bold opacity-60">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{l.duration || "10m"}</span>
                      </div>
                      {l.isFree && !isActive && (
                        <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-widest">Free</span>
                      )}
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
