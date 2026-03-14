"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { 
  Trophy, 
  Clock, 
  ArrowRight, 
  LayoutGrid,
  Zap,
  Bell,
  CheckCircle2,
  Plus,
  Users,
  DollarSign,
  Video,
  PlayCircle,
  PlusIcon,
  Edit2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CourseCard from "@/components/courses/CourseCard";
import EarningsAnalytics from "@/components/dashboard/EarningsAnalytics";
import MentorRegister from "@/components/mentorship/MentorRegister";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { formatPrice } from "@/lib/format";

interface EnrollmentWithCourse extends Doc<"enrollments"> {
  course: Doc<"courses">;
  progress: {
    completedCount: number;
    totalCount: number;
    percentage: number;
  };
}

interface InstructorStats {
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  totalCourses: number;
  recentEarnings: any[]; // Keeping any for complex chart data for now but could refine later
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  
  const convexUser = useQuery(api.users.getUserByProviderId, 
    session?.user?.id ? { 
      providerId: session.user.id,
      email: session.user.email ?? undefined 
    } : "skip"
  );

  const instructorCourses = useQuery(api.courses.listByInstructor, 
    session?.user?.id ? { instructorId: session.user.id } : "skip"
  );

  const enrolledCourses = useQuery(api.enrollments.listMyEnrollments,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const allCourses = useQuery(api.courses.list);
  const instructorStats = useQuery(api.analytics.getInstructorStats, 
    session?.user?.id ? { instructorId: session.user.id } : "skip"
  );

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (status === "loading" || (session && convexUser === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isInstructor = convexUser?.role === "instructor";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Welcome back, <span className="text-blue-800 dark:text-cyan-400">{session?.user?.name?.split(" ")[0]}!</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">
              {isInstructor 
                ? "Manage your courses and track your students' progress." 
                : "Explore new courses and continue your learning journey."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 transition-all relative">
              <Bell className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            {isInstructor ? (
               <Link href="/courses/create" className="flex items-center gap-2 bg-blue-800 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-800/20 hover:bg-blue-900 transition-all">
                  <Plus className="w-5 h-5" />
                  <span className="font-bold">Create Course</span>
               </Link>
            ) : (
              <div className="flex items-center gap-4 bg-blue-800 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-800/20">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div className="text-sm">
                  <p className="font-black">1,250 XP</p>
                  <p className="text-[10px] text-blue-200 uppercase font-black tracking-widest">Level 12 Scholar</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {isInstructor ? (
          <InstructorDashboard courses={instructorCourses} stats={instructorStats} />
        ) : (
          <LearnerDashboard enrolledCourses={enrolledCourses as any} allCourses={allCourses} />
        )}
      </div>
    </div>
  );
}

function ThumbnailImage({ thumbnailUrl, title, className }: { thumbnailUrl: string | undefined; title: string; className?: string }) {
  const isStorageId = thumbnailUrl && !thumbnailUrl.startsWith("http") && !thumbnailUrl.startsWith("/");
  const resolvedUrl = useQuery(api.files.getImageUrl, isStorageId ? { storageId: thumbnailUrl } : "skip");
  const displayImage = isStorageId ? resolvedUrl : thumbnailUrl;

  if (!displayImage) return <div className="absolute inset-0 bg-gradient-to-br from-blue-800/40 to-cyan-500/40" />;

  return (
    <Image 
      src={displayImage} 
      alt={title} 
      fill
      className={cn("object-cover", className)} 
    />
  );
}

function LearnerDashboard({ enrolledCourses, allCourses }: { 
  enrolledCourses: EnrollmentWithCourse[] | undefined; 
  allCourses: Doc<"courses">[] | undefined 
}) {
  const featuredEnrollment = enrolledCourses?.sort((a, b) => (b.progress?.percentage || 0) - (a.progress?.percentage || 0))[0];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-8">
        {/* Continue Learning Card */}
        {featuredEnrollment ? (
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-800/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-cyan-400 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <h2 className="text-xl font-black">Continue Learning</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-56 aspect-video bg-slate-900 rounded-2xl overflow-hidden relative shadow-2xl">
                  <ThumbnailImage 
                    thumbnailUrl={featuredEnrollment.course.thumbnailUrl} 
                    title={featuredEnrollment.course.title}
                    className="opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <PlayCircle className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 text-xs">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-1000" 
                      style={{ width: `${featuredEnrollment.progress?.percentage || 0}%` }} 
                    />
                  </div>
                </div>
                
                <div className="flex-grow space-y-4">
                  <div>
                    <h3 className="font-black text-xl mb-1">{featuredEnrollment.course.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-bold">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-800 dark:text-cyan-400" />
                        <span>{featuredEnrollment.progress?.completedCount || 0} of {featuredEnrollment.progress?.totalCount || 0} lessons</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{featuredEnrollment.progress?.percentage || 0}% Complete</span>
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={`/courses/${featuredEnrollment.courseId}/lessons/${featuredEnrollment.lastLessonId || "start"}`}
                    className="px-8 py-4 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 transition-all flex items-center gap-2 w-fit shadow-xl shadow-blue-800/20 active:scale-95"
                  >
                      Continue Lesson
                      <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 text-white rounded-[32px] p-12 text-center space-y-6">
             <div className="w-16 h-16 bg-blue-800/30 rounded-2xl flex items-center justify-center mx-auto">
                <LayoutGrid className="w-8 h-8 text-cyan-400" />
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-black">Start your journey today</h2>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Enroll in your first course to begin tracking your learning progress.</p>
             </div>
             <Link href="/courses" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-slate-900 font-black rounded-xl hover:bg-slate-100 transition-all">
                Browse Courses
                <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        )}

        {/* Recommended Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black">Recommended for You</h2>
            </div>
            <Link href="/courses" className="text-blue-800 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1 text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allCourses?.slice(0, 4).map((course) => (
              <CourseCard 
                key={course._id} 
                {...course} 
                image={course.thumbnailUrl}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Area */}
      <div className="space-y-8">
        {/* Stats / Quick Links */}
        <div className="bg-blue-800 rounded-[32px] p-8 text-white shadow-2xl shadow-blue-800/40 relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
          <h3 className="font-black text-xl mb-6 relative z-10">Your Stats</h3>
          <div className="space-y-6 relative z-10">
            <div>
              <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2 opacity-80">
                <span>Weekly Goal</span>
                <span>4 / 6h</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full w-[65%]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-[9px] text-blue-200 uppercase font-black tracking-widest mb-1">Enrolled</p>
                <p className="text-2xl font-black">{enrolledCourses?.length || 0}</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-[9px] text-blue-200 uppercase font-black tracking-widest mb-1">Completed</p>
                <p className="text-2xl font-black">
                  {enrolledCourses?.filter((e: any) => e.progress?.percentage === 100).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
          <h3 className="font-black text-xl mb-6">Latest Updates</h3>
          <div className="space-y-6">
            {[
              {
                date: "Today",
                title: "New AI Engineering Path launched!",
                description: "Start your journey into GenAI and LLMs."
              },
              {
                date: "Yesterday",
                title: "Live Q&A with Sarah Drasner",
                description: "Don't miss the session on Next.js 15."
              }
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <p className="text-[10px] text-blue-800 dark:text-cyan-500 font-black uppercase tracking-[0.2em] mb-1">{item.date}</p>
                <h4 className="font-black text-sm group-hover:text-blue-800 transition-colors leading-tight">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 font-medium">{item.description}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            View All Updates
          </button>
        </div>
      </div>
    </div>
  );
}

function InstructorDashboard({ courses, stats }: { 
  courses: Doc<"courses">[] | undefined;
  stats: InstructorStats | undefined;
}) {
  const [activeInstructorTab, setActiveInstructorTab] = useState<"courses" | "mentorship">("courses");
  const { data: session } = useSession();
  const convexUser = useQuery(api.users.getUserByProviderId, 
    session?.user?.id ? { providerId: session.user.id } : "skip"
  );

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Stats Overview */}
      {[
        { label: "Total Students", value: stats?.totalStudents || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
        { label: "Course Revenue", value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
        { label: "Course Rating", value: stats?.averageRating?.toFixed(1) || "0.0", icon: Trophy, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
        { label: "My Courses", value: stats?.totalCourses || 0, icon: Video, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
      ].map((stat, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Main Instructor Area */}
      <div className="lg:col-span-3 space-y-8 mt-4">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveInstructorTab("courses")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeInstructorTab === "courses" ? "bg-white dark:bg-slate-900 shadow-sm text-blue-800 dark:text-cyan-400" : "text-slate-500 hover:text-slate-700"
            )}
          >
            My Courses
          </button>
          <button 
            onClick={() => setActiveInstructorTab("mentorship")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeInstructorTab === "mentorship" ? "bg-white dark:bg-slate-900 shadow-sm text-blue-800 dark:text-cyan-400" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Mentorship
          </button>
        </div>

        {activeInstructorTab === "courses" ? (
          <>
            <EarningsAnalytics chartData={stats?.recentEarnings} />
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Your Courses</h2>
                <Link href="/courses/create">
                  <button className="bg-blue-800 hover:bg-black text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" /> Create Course
                  </button>
                </Link>
              </div>

              <div className="space-y-4">
                {courses?.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">
                    <p className="text-muted-foreground font-bold italic">You haven&apos;t created any courses yet.</p>
                  </div>
                )}
                {courses?.map((course) => (
                  <div key={course._id} className="flex flex-col md:flex-row items-center gap-6 p-5 border border-slate-50 dark:border-slate-800 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                    <div className="w-full md:w-40 aspect-video bg-slate-900 rounded-2xl overflow-hidden relative shadow-lg">
                       <ThumbnailImage 
                          thumbnailUrl={course.thumbnailUrl} 
                          title={course.title}
                          className="group-hover:scale-105 transition-transform duration-500"
                       />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-black text-xl">{course.title}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={cn(
                          "text-[10px] font-black underline decoration-2 uppercase tracking-widest",
                          course.isPublished ? "text-emerald-500 decoration-emerald-200" : "text-amber-500 decoration-amber-200"
                        )}>
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 px-4">
                       <div className="text-center">
                         <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Students</p>
                         <p className="font-black text-lg">{course.studentsEnrolled || 0}</p>
                       </div>
                       <Link 
                        href={`/courses/manage/${course._id}`} 
                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-blue-800 hover:text-white transition-all shadow-sm"
                       >
                          <Edit2 className="w-5 h-5" />
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <MentorRegister userId={convexUser?._id as any} />
        )}
      </div>

      {/* Instructor Sidebar */}
      <div className="space-y-6 mt-4">
        <div className="bg-slate-900 text-white rounded-[32px] p-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-800/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <h3 className="font-black text-xl mb-4 relative z-10">Pro Instructor Tip</h3>
          <p className="text-slate-400 text-sm leading-relaxed font-medium relative z-10">
            Keep your lesson titles clear and descriptive. Courses with structured curriculum have 40% higher completion rates.
          </p>
        </div>
      </div>
    </div>
  );
}
