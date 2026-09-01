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
      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 shrink-0 bg-white z-20">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <Link 
            href={`/courses/${courseId}`} 
            className="group flex items-center gap-2 p-1 hover:bg-slate-50 rounded-lg transition-all"
          >
            <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <div className="hidden md:block">
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Back to Course</p>
              <h1 className="font-semibold text-xs tracking-tight truncate max-w-[180px] lg:max-w-xs text-slate-800">{course.title}</h1>
            </div>
          </Link>
          
          <div className="h-6 w-px bg-slate-200 hidden md:block" />
          
          <div className="hidden lg:block">
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wide">Current Lesson</p>
            <p className="text-xs font-semibold text-slate-700 truncate max-w-sm">{lesson?.title || "Starting Course..."}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {progress && (
            <div className="flex flex-col items-end gap-1">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Progress
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {progress.percentage}%
                </span>
              </div>
              {/* Compact progress ring for mobile */}
              <div className="sm:hidden flex items-center gap-1.5">
                <div className="h-1.5 w-14 bg-slate-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-blue-600">
                  {progress.percentage}%
                </span>
              </div>
              <div className="hidden sm:block h-1.5 w-36 bg-slate-100 rounded-full overflow-hidden relative">
                 <div
                   className="h-full bg-blue-600 transition-all duration-500"
                   style={{ width: `${progress.percentage}%` }}
                 />
              </div>
            </div>
          )}

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-slate-600"
            aria-label="Toggle curriculum sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          {session?.user?.image && (
            <div className="hidden sm:block">
              <Image 
                src={session.user.image} 
                alt="Profile" 
                width={30}
                height={30}
                className="rounded-full border border-slate-200"
              />
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden relative">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar Navigation */}
        <aside className={cn(
          "w-72 max-w-[85vw] border-r border-slate-200 flex flex-col shrink-0 bg-white transition-transform duration-300 lg:translate-x-0 z-30",
          sidebarOpen ? "translate-x-0 fixed lg:relative inset-y-0 left-0 shadow-lg lg:shadow-none" : "-translate-x-full fixed lg:relative h-full"
        )}>
          {/* Close button (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-3 right-3 p-1.5 bg-white border border-slate-200 rounded-md shadow-xs z-10 text-slate-500"
            aria-label="Close course content"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
             <h2 className="font-semibold text-xs uppercase tracking-wider text-slate-900">Course Content</h2>
             {progress && (
               <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-md">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                 <span className="text-[10px] font-bold text-blue-600">{progress.percentage}%</span>
               </div>
             )}
          </div>
          <div className="flex-grow overflow-y-auto p-3 space-y-3 custom-scrollbar">
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
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4 p-8 text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Play className="w-7 h-7 fill-current translate-x-0.5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-900">Ready to start?</h2>
                <p className="text-slate-500 text-xs max-w-xs">Select a lesson from the sidebar to begin your learning journey.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Video Player Section */}
              <div className="bg-slate-900 p-2 sm:p-4 lg:p-6">
                <div className="max-w-5xl mx-auto">
                  <div className="aspect-video w-full bg-slate-950 rounded-lg overflow-hidden shadow-md relative group">
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3 bg-slate-900/90 backdrop-blur-sm">
                          <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-7 h-7 opacity-30 text-white" />
                          </div>
                          <div className="text-center space-y-0.5">
                            <p className="font-semibold uppercase tracking-wider text-[9px] text-slate-400">Lesson Material</p>
                            <p className="text-xs font-semibold text-slate-400">This lesson does not contain a video.</p>
                          </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lesson Text Content */}
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-12 lg:pb-16">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold uppercase tracking-wide rounded">
                        Lesson
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                      {lesson?.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lesson?.duration || "10m"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Reading Material</span>
                        </div>
                    </div>
                  </div>

                  {isEnrolled && lesson && (
                    <button 
                      onClick={handleToggleComplete}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow-xs shrink-0",
                        completedLessonIds.includes(lesson._id)
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20"
                      )}
                    >
                      {completedLessonIds.includes(lesson._id) ? (
                        <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed</>
                      ) : (
                        <><Circle className="w-4 h-4" /> Mark as Completed</>
                      )}
                    </button>
                  )}
                </div>

                <div className="h-px w-full bg-slate-100" />

                <article className="prose prose-slate prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                  {lesson?.content ? (
                    <div className="p-1">
                      <MarkdownRenderer content={lesson.content} />
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-slate-200 rounded-lg text-center bg-slate-50/50">
                        <p className="text-slate-500 text-xs font-medium">No additional reading resources for this lesson.</p>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 mt-1">Video content only</p>
                    </div>
                  )}
                </article>

                {lesson && isEnrolled && (
                  <div className="pt-8 border-t border-slate-100">
                    <div className="mb-4">
                       <h3 className="text-base font-bold tracking-tight text-slate-900 mb-0.5">Lesson Discussion</h3>
                       <p className="text-xs text-slate-500">Share your thoughts or ask questions about this lesson.</p>
                    </div>
                    <LessonDiscussion lessonId={lesson._id} userId={convexUser?._id || null} />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3">
                  <button 
                    onClick={() => prevLesson && navigateTo(prevLesson._id)}
                    disabled={!prevLesson}
                    className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-lg font-medium text-xs text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                      <ChevronLeft className="w-3.5 h-3.5" />
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
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-xs hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {nextLesson ? (
                          <>
                            Next Lesson
                            <ChevronRight className="w-3.5 h-3.5" />
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
        <div className="lg:hidden sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => prevLesson && navigateTo(prevLesson._id)}
            disabled={!prevLesson}
            className="flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-xs bg-slate-100 text-slate-700 transition-all disabled:opacity-30 active:scale-95"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          
          <button
            onClick={handleToggleComplete}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all active:scale-95",
              completedLessonIds.includes(lesson._id)
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-600 text-white"
            )}
          >
            {completedLessonIds.includes(lesson._id) ? (
              <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Done</>
            ) : (
              <><Circle className="w-3.5 h-3.5" /> Complete</>
            )}
          </button>
          
          <button
            onClick={() => nextLesson && navigateTo(nextLesson._id)}
            disabled={!nextLesson}
            className="flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-xs bg-blue-600 text-white transition-all disabled:opacity-30 active:scale-95"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
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
    <div className="space-y-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-1.5 px-2 rounded-md hover:bg-slate-50 transition-all group"
      >
        <div className="flex items-center gap-2 min-w-0">
           <div className={cn(
             "w-5 h-5 rounded flex items-center justify-center transition-all shrink-0",
             isOpen ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
           )}>
             <BookOpen className="w-3 h-3" />
           </div>
           <div className="text-left min-w-0">
             <span className="text-xs font-semibold tracking-tight block truncate text-slate-800">{section.title}</span>
             <span className="text-[10px] text-slate-400">
               {completedCount}/{totalCount} Lessons
             </span>
           </div>
        </div>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0", !isOpen && "-rotate-90")} />
      </button>

      {isOpen && (
        <div className="space-y-0.5 relative pl-2 border-l border-slate-100 ml-2.5">
          {lessons?.map((l) => {
            const isActive = l._id === activeLessonId;
            const isCompleted = completedLessonIds.includes(l._id);
            const isLocked = !isEnrolled && !l.isFree;

            return (
              <div key={l._id} className="relative group/item">
                <Link 
                  href={isLocked ? "#" : `/courses/${courseId}/lessons/${l._id}`}
                  className={cn(
                    "flex items-center gap-2.5 p-2 rounded-md transition-all relative overflow-hidden",
                    isActive 
                      ? "bg-blue-600 text-white shadow-xs" 
                      : isLocked 
                        ? "opacity-50 cursor-not-allowed text-slate-400" 
                        : "hover:bg-slate-50 text-slate-700"
                  )}
                  onClick={(e) => isLocked && e.preventDefault()}
                >
                  <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center shrink-0 transition-all",
                    isActive ? "bg-white/20" : "bg-slate-100"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-emerald-600")} />
                    ) : isActive ? (
                      <PlayCircle className="w-3.5 h-3.5 fill-current animate-pulse text-white" />
                    ) : isLocked ? (
                      <Lock className="w-3 h-3 text-slate-400" />
                    ) : (
                      <Play className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-grow">
                    <span className={cn(
                      "text-xs font-medium tracking-tight truncate",
                      isCompleted && !isActive && "text-slate-400 line-through"
                    )}>
                      {l.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1 text-[9px] opacity-70">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{l.duration || "10m"}</span>
                      </div>
                      {l.isFree && !isActive && (
                        <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1 rounded font-semibold uppercase">Free</span>
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
