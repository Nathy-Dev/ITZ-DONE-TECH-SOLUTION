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
  BookOpen
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
    <div className="aspect-video w-full bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-800 border-t-cyan-400"></div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Initializing Player...</p>
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
      <header className="h-20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-6">
          <Link 
            href={`/courses/${courseId}`} 
            className="group flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-blue-800 group-hover:text-white transition-all shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Back to Course</p>
              <h1 className="font-black text-sm tracking-tight truncate max-w-[200px] lg:max-w-md">{course.title}</h1>
            </div>
          </Link>
          
          <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden md:block" />
          
          <div className="hidden lg:block">
            <p className="text-[10px] font-bold text-blue-800 dark:text-cyan-400 uppercase tracking-widest mb-0.5">Currently Learning</p>
            <p className="text-xs font-black text-slate-600 dark:text-slate-300">{lesson?.title || "Starting Course..."}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {progress && (
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Your Progress
                </span>
                <span className="text-xs font-black text-blue-800 dark:text-cyan-400">
                  {progress.percentage}%
                </span>
              </div>
              <div className="h-1.5 w-48 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                 <div 
                  className="h-full bg-blue-800 dark:bg-cyan-500 transition-all duration-1000 shadow-[0_0_10px_rgba(30,64,175,0.3)]" 
                  style={{ width: `${progress.percentage}%` }} 
                />
              </div>
            </div>
          )}

          <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 hidden sm:block" />

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-3 bg-slate-100 dark:bg-slate-800 hover:bg-blue-800 hover:text-white rounded-2xl transition-all"
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
                className="rounded-2xl border-2 border-white dark:border-slate-800 shadow-sm"
              />
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className={cn(
          "w-85 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/40 dark:bg-slate-900/40 backdrop-blur-xl transition-all duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full absolute lg:relative z-30 h-full"
        )}>
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
             <h2 className="font-black text-[11px] uppercase tracking-[0.25em] text-blue-800 dark:text-cyan-400">Course Content</h2>
             {progress && (
               <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-800 dark:bg-cyan-400 animate-pulse" />
                 <span className="text-[9px] font-black text-blue-800 dark:text-cyan-400">{progress.percentage}%</span>
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
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 lg:p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="aspect-video w-full bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl relative group ring-1 ring-slate-200 dark:ring-slate-800">
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
                          <div className="w-24 h-24 bg-slate-800 rounded-[2rem] flex items-center justify-center">
                            <PlayCircle className="w-12 h-12 opacity-20" />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400">Lesson Material</p>
                            <p className="text-sm font-bold text-slate-500">This lesson does not contain a video.</p>
                          </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lesson Text Content */}
              <div className="max-w-4xl mx-auto px-8 py-12 lg:py-16 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                        Module Content
                      </span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                      {lesson?.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{lesson?.duration || "10m"} Duration</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Resources Available</span>
                        </div>
                    </div>
                  </div>

                  {isEnrolled && lesson && (
                    <button 
                      onClick={handleToggleComplete}
                      className={cn(
                        "flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all duration-500 shadow-2xl shrink-0 group",
                        completedLessonIds.includes(lesson._id)
                          ? "bg-emerald-500 text-white shadow-emerald-500/20"
                          : "bg-blue-800 text-white hover:bg-blue-900 shadow-blue-800/20 hover:-translate-y-1"
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

                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-100 dark:via-slate-800 to-transparent" />

                <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed">
                  {lesson?.content ? (
                    <div className="p-2">
                      <MarkdownRenderer content={lesson.content} />
                    </div>
                  ) : (
                    <div className="p-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center bg-slate-50/50 dark:bg-slate-900/20">
                        <p className="text-slate-400 font-bold">No additional reading resources for this lesson.</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-300 mt-2 font-black">Video content only</p>
                    </div>
                  )}
                </article>

                {lesson && isEnrolled && (
                  <div className="pt-16 border-t border-slate-100 dark:border-slate-800">
                    <div className="mb-8">
                       <h3 className="text-2xl font-black tracking-tight mb-2">Lesson Discussion</h3>
                       <p className="text-sm text-slate-500">Share your thoughts or ask questions about this lesson.</p>
                    </div>
                    <LessonDiscussion lessonId={lesson._id} userId={convexUser?._id || null} />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-16 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-6">
                  <button 
                    onClick={() => prevLesson && navigateTo(prevLesson._id)}
                    disabled={!prevLesson}
                    className="flex items-center gap-4 px-8 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
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
                      className="flex items-center gap-4 px-10 py-4 bg-blue-800 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-900 shadow-2xl shadow-blue-800/20 transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
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
        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all group"
      >
        <div className="flex items-center gap-3">
           <div className={cn(
             "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
             isOpen ? "bg-blue-800 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
           )}>
             <BookOpen className="w-3.5 h-3.5" />
           </div>
           <div className="text-left">
             <span className="text-[11px] font-black tracking-tight block">{section.title}</span>
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
               {completedCount}/{totalCount} Lessons
             </span>
           </div>
        </div>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-300", !isOpen && "-rotate-90")} />
      </button>

      {isOpen && (
        <div className="space-y-2 relative pl-3 border-l border-slate-100 dark:border-slate-800 ml-3.5">
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
                      ? "bg-blue-800 text-white shadow-xl shadow-blue-800/20" 
                      : isLocked 
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                  onClick={(e) => isLocked && e.preventDefault()}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-cyan-400" />
                  )}
                  
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all",
                    isActive ? "bg-white/10" : "bg-slate-50 dark:bg-slate-900 shadow-sm"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className={cn("w-4 h-4", isActive ? "text-cyan-400" : "text-emerald-500")} />
                    ) : isActive ? (
                      <div className="relative">
                        <PlayCircle className="w-4 h-4 fill-current animate-pulse" />
                        <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping" />
                      </div>
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-grow">
                    <span className={cn(
                      "text-[11px] font-black tracking-tight truncate",
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
                        <span className="text-[8px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest">Free</span>
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
