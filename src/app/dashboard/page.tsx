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
  CheckCircle2,
  Plus,
  Users,
  DollarSign,
  Video,
  PlayCircle,
  PlusIcon,
  Edit2,
  Loader2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CourseCard from "@/components/courses/CourseCard";
import EarningsAnalytics from "@/components/dashboard/EarningsAnalytics";
import EarningsPanel from "@/components/dashboard/EarningsPanel";
import NotificationsBell from "@/components/dashboard/NotificationsBell";
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

interface ChartPoint {
  name: string;
  amount: number;
}

interface InstructorStats {
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  totalCourses: number;
  recentEarnings: ChartPoint[];
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
    convexUser?._id ? { instructorId: convexUser._id } : "skip"
  );

  const enrolledCourses = useQuery(api.enrollments.listMyEnrollments,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const allCourses = useQuery(api.courses.list);
  const instructorStats = useQuery(api.analytics.getInstructorStats, 
    convexUser?._id ? { instructorId: convexUser._id } : "skip"
  );

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (status === "loading" || (session && convexUser === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isInstructor = convexUser?.role === "instructor" || convexUser?.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, <span className="text-blue-600">{session?.user?.name?.split(" ")[0]}!</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isInstructor 
                ? "Manage your courses and track your students' progress." 
                : "Explore new courses and continue your learning journey."}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <NotificationsBell />
            {isInstructor ? (
               <Link href="/courses/create" className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 text-xs font-medium">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Course</span>
               </Link>
            ) : (
              <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                <Trophy className="w-4 h-4 text-blue-600" />
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">{enrolledCourses?.length || 0} Enrolled</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                    {enrolledCourses?.filter((e) => e.progress?.percentage === 100).length || 0} Completed
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {isInstructor ? (
          <InstructorDashboard courses={instructorCourses} stats={instructorStats} />
        ) : (
          <LearnerDashboard enrolledCourses={enrolledCourses} allCourses={allCourses} />
        )}
      </div>
    </div>
  );
}

function ThumbnailImage({ thumbnailUrl, title, className }: { thumbnailUrl: string | undefined; title: string; className?: string }) {
  const isMediaId = thumbnailUrl && !thumbnailUrl.startsWith("http") && !thumbnailUrl.startsWith("/");
  const displayImage = isMediaId ? `/api/media/${thumbnailUrl}/thumbnail` : thumbnailUrl;

  if (!displayImage) return <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-blue-500/40" />;

  return (
    <Image
      src={displayImage}
      alt={title}
      fill
      className={cn("object-cover", className)}
      unoptimized
    />
  );
}

function LearnerDashboard({ enrolledCourses, allCourses }: { 
  enrolledCourses: EnrollmentWithCourse[] | undefined; 
  allCourses: Doc<"courses">[] | undefined 
}) {
  const featuredEnrollment = enrolledCourses?.sort((a, b) => (b.progress?.percentage || 0) - (a.progress?.percentage || 0))[0];

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-5">
        {/* Continue Learning Card */}
        {featuredEnrollment ? (
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Continue Learning</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-full md:w-44 aspect-video bg-slate-900 rounded-md overflow-hidden relative shrink-0">
                  <ThumbnailImage 
                    thumbnailUrl={featuredEnrollment.course.thumbnailUrl} 
                    title={featuredEnrollment.course.title}
                    className="opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <PlayCircle className="w-10 h-10 text-white/80 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 text-xs">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000" 
                      style={{ width: `${featuredEnrollment.progress?.percentage || 0}%` }} 
                    />
                  </div>
                </div>
                
                <div className="flex-grow space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-0.5">{featuredEnrollment.course.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{featuredEnrollment.progress?.completedCount || 0} of {featuredEnrollment.progress?.totalCount || 0} lessons</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{featuredEnrollment.progress?.percentage || 0}% Complete</span>
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={`/courses/${featuredEnrollment.courseId}/lessons/${featuredEnrollment.lastLessonId || "start"}`}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 w-fit shadow-xs"
                  >
                      Continue Lesson
                      <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-3">
             <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
             </div>
             <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900">Start your journey today</h2>
                <p className="text-slate-500 text-xs max-w-xs mx-auto">Enroll in your first course to begin tracking your learning progress.</p>
             </div>
             <Link href="/courses" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Browse Courses
                <ArrowRight className="w-3.5 h-3.5" />
             </Link>
          </div>
        )}

        {/* Recommended Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Recommended for You</h2>
            </div>
            <Link href="/courses" className="text-blue-600 font-medium hover:underline flex items-center gap-1 text-xs">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allCourses
              ?.filter((course) => course.status === "published" || (!course.status && course.isPublished))
              .slice(0, 4)
              .map((course) => (
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
      <div className="space-y-5">
        {/* Stats / Quick Links */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
           <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">Your Stats</h3>
           <div className="grid grid-cols-2 gap-2.5">
             <div className="p-3 bg-white rounded-md border border-blue-100">
               <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Enrolled</p>
               <p className="text-xl font-bold text-blue-600">{enrolledCourses?.length || 0}</p>
             </div>
             <div className="p-3 bg-white rounded-md border border-blue-100">
               <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Completed</p>
               <p className="text-xl font-bold text-blue-600">
                 {enrolledCourses?.filter((e) => e.progress?.percentage === 100).length || 0}
               </p>
             </div>
           </div>
         </div>

        {/* Quick Links Section */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
           <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">Quick Links</h3>
           <div className="space-y-2">
             <Link
               href="/courses"
               className="block p-3 rounded-md bg-slate-50 hover:bg-blue-50/60 transition-colors group"
             >
               <h4 className="font-semibold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">Browse Courses</h4>
               <p className="text-[11px] text-slate-500 mt-0.5">Discover new courses to expand your skills.</p>
             </Link>
             <Link
               href="/mentorship"
               className="block p-3 rounded-md bg-slate-50 hover:bg-blue-50/60 transition-colors group"
             >
               <h4 className="font-semibold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">Find a Mentor</h4>
               <p className="text-[11px] text-slate-500 mt-0.5">Get 1-on-1 guidance from industry experts.</p>
             </Link>
           </div>
         </div>
      </div>
    </div>
  );
}

function InstructorDashboard({ courses, stats }: { 
  courses: Doc<"courses">[] | undefined;
  stats: InstructorStats | undefined;
}) {
  const [activeInstructorTab, setActiveInstructorTab] = useState<"courses" | "earnings" | "mentorship">("courses");
  const { data: session } = useSession();
  const convexUser = useQuery(api.users.getUserByProviderId, 
    session?.user?.id ? { 
      providerId: session.user.id,
      email: session.user.email ?? undefined 
    } : "skip"
  );

  return (
    <div className="grid lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* Stats Overview */}
      {[
        { label: "Total Students", value: stats?.totalStudents || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Your Earnings", value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Course Rating", value: stats?.averageRating?.toFixed(1) || "0.0", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "My Courses", value: stats?.totalCourses || 0, icon: Video, color: "text-blue-600", bg: "bg-blue-50" },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3">
             <div className={`w-9 h-9 ${stat.bg} ${stat.color} rounded-md flex items-center justify-center shrink-0`}>
               <stat.icon className="w-4 h-4" />
             </div>
             <div className="min-w-0">
               <p className="text-[11px] text-slate-500 truncate">{stat.label}</p>
               <p className="text-base sm:text-lg font-bold truncate text-slate-900">{stat.value}</p>
             </div>
           </div>
         </div>
      ))}

      {/* Main Instructor Area */}
      <div className="lg:col-span-3 space-y-5 mt-2">
        <div className="flex bg-slate-100 p-0.5 rounded-lg w-fit">
          <button
            onClick={() => setActiveInstructorTab("courses")}
            className={cn(
              "px-3.5 py-1 rounded-md text-xs font-medium transition-all",
              activeInstructorTab === "courses" ? "bg-white shadow-xs text-blue-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveInstructorTab("earnings")}
            className={cn(
              "px-3.5 py-1 rounded-md text-xs font-medium transition-all",
              activeInstructorTab === "earnings" ? "bg-white shadow-xs text-blue-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Earnings & Payouts
          </button>
          <button
            onClick={() => setActiveInstructorTab("mentorship")}
            className={cn(
              "px-3.5 py-1 rounded-md text-xs font-medium transition-all",
              activeInstructorTab === "mentorship" ? "bg-white shadow-xs text-blue-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Mentorship
          </button>
        </div>

        {activeInstructorTab === "earnings" ? (
          <EarningsPanel />
        ) : activeInstructorTab === "courses" ? (
          <>
            <EarningsAnalytics chartData={stats?.recentEarnings} />
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-900">Your Courses</h2>
                <Link href="/courses/create">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5">
                    <PlusIcon className="w-3.5 h-3.5" /> Create Course
                  </button>
                </Link>
              </div>

              <div className="space-y-3">
                {courses?.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-400 text-xs italic">You haven&apos;t created any courses yet.</p>
                  </div>
                )}
                {courses?.map((course) => (
                  <div key={course._id} className="flex flex-col md:flex-row items-center gap-3.5 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors group">
                    <div className="w-full md:w-32 aspect-video bg-slate-900 rounded overflow-hidden relative shrink-0">
                       <ThumbnailImage 
                          thumbnailUrl={course.thumbnailUrl} 
                          title={course.title}
                          className="group-hover:scale-105 transition-transform duration-300"
                       />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-semibold text-sm text-slate-900 truncate">{course.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded",
                          course.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        )}>
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                        <span className="text-[11px] text-slate-400">{course.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 px-2">
                       <div className="text-center">
                         <p className="text-[10px] text-slate-500">Students</p>
                         <p className="font-semibold text-sm text-slate-900">{course.studentsEnrolled || 0}</p>
                       </div>
                       <Link 
                        href={`/courses/manage/${course._id}`} 
                        className="p-2 bg-slate-100 rounded-md hover:bg-blue-600 hover:text-white transition-colors text-slate-600"
                       >
                          <Edit2 className="w-4 h-4" />
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          convexUser ? (
            <MentorRegister userId={convexUser._id} />
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          )
        )}
      </div>

      {/* Instructor Sidebar */}
      <div className="space-y-4 mt-2">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-2">Pro Instructor Tip</h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Keep your lesson titles clear and descriptive. Courses with structured curriculum have 40% higher completion rates.
          </p>
        </div>
      </div>
    </div>
  );
}
