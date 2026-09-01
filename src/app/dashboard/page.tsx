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

  const isInstructor = convexUser?.role === "instructor";

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-blue-600">{session?.user?.name?.split(" ")[0]}!</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">
              {isInstructor 
                ? "Manage your courses and track your students' progress." 
                : "Explore new courses and continue your learning journey."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationsBell />
            {isInstructor ? (
               <Link href="/courses/create" className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Create Course</span>
               </Link>
            ) : (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl">
                <Trophy className="w-5 h-5 text-blue-600" />
                <div className="text-sm">
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
  const isStorageId = thumbnailUrl && !thumbnailUrl.startsWith("http") && !thumbnailUrl.startsWith("/");
  const resolvedUrl = useQuery(api.files.getImageUrl, isStorageId ? { storageId: thumbnailUrl } : "skip");
  const displayImage = isStorageId ? resolvedUrl : thumbnailUrl;

  if (!displayImage) return <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-blue-500/40" />;

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
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <h2 className="text-xl font-semibold">Continue Learning</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-56 aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
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
                      className="h-full bg-blue-500 transition-all duration-1000" 
                      style={{ width: `${featuredEnrollment.progress?.percentage || 0}%` }} 
                    />
                  </div>
                </div>
                
                <div className="flex-grow space-y-4">
                  <div>
                    <h3 className="font-semibold text-xl mb-1">{featuredEnrollment.course.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600" />
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
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit"
                  >
                      Continue Lesson
                      <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-5">
             <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto">
                <LayoutGrid className="w-7 h-7 text-blue-600" />
             </div>
             <div className="space-y-2">
                <h2 className="text-xl font-semibold">Start your journey today</h2>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Enroll in your first course to begin tracking your learning progress.</p>
             </div>
             <Link href="/courses" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                Browse Courses
                <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        )}

        {/* Recommended Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-semibold">Recommended for You</h2>
            </div>
            <Link href="/courses" className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-sm">
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
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
           <h3 className="font-semibold text-lg mb-4 text-slate-900">Your Stats</h3>
           <div className="grid grid-cols-2 gap-3">
             <div className="p-4 bg-white rounded-lg border border-blue-100">
               <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Enrolled</p>
               <p className="text-2xl font-bold text-blue-600">{enrolledCourses?.length || 0}</p>
             </div>
             <div className="p-4 bg-white rounded-lg border border-blue-100">
               <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Completed</p>
               <p className="text-2xl font-bold text-blue-600">
                 {enrolledCourses?.filter((e) => e.progress?.percentage === 100).length || 0}
               </p>
             </div>
           </div>
         </div>

        {/* Tips Section */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
           <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
           <div className="space-y-3">
             <Link
               href="/courses"
               className="block p-4 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors group"
             >
               <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors">Browse Courses</h4>
               <p className="text-xs text-slate-500 mt-1">Discover new courses to expand your skills.</p>
             </Link>
             <Link
               href="/mentorship"
               className="block p-4 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors group"
             >
               <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors">Find a Mentor</h4>
               <p className="text-xs text-slate-500 mt-1">Get 1-on-1 guidance from industry experts.</p>
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
    session?.user?.id ? { providerId: session.user.id } : "skip"
  );

  return (
    <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Stats Overview */}
      {[
        { label: "Total Students", value: stats?.totalStudents || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Your Earnings", value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Course Rating", value: stats?.averageRating?.toFixed(1) || "0.0", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "My Courses", value: stats?.totalCourses || 0, icon: Video, color: "text-blue-600", bg: "bg-blue-50" },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 sm:gap-4">
             <div className={`w-10 h-10 sm:w-11 sm:h-11 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center shrink-0`}>
               <stat.icon className="w-5 h-5" />
             </div>
             <div className="min-w-0">
               <p className="text-xs text-slate-500 truncate">{stat.label}</p>
               <p className="text-lg sm:text-xl font-bold truncate">{stat.value}</p>
             </div>
           </div>
         </div>
      ))}

      {/* Main Instructor Area */}
      <div className="lg:col-span-3 space-y-8 mt-4">
        <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveInstructorTab("courses")}
            className={cn(
              "px-4 sm:px-5 py-1.5 rounded-md text-sm font-medium transition-all",
              activeInstructorTab === "courses" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveInstructorTab("earnings")}
            className={cn(
              "px-4 sm:px-5 py-1.5 rounded-md text-sm font-medium transition-all",
              activeInstructorTab === "earnings" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Earnings & Payouts
          </button>
          <button
            onClick={() => setActiveInstructorTab("mentorship")}
            className={cn(
              "px-4 sm:px-5 py-1.5 rounded-md text-sm font-medium transition-all",
              activeInstructorTab === "mentorship" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
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
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Courses</h2>
                <Link href="/courses/create">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" /> Create Course
                  </button>
                </Link>
              </div>

              <div className="space-y-4">
                {courses?.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-muted-foreground font-bold italic">You haven&apos;t created any courses yet.</p>
                  </div>
                )}
                {courses?.map((course) => (
                  <div key={course._id} className="flex flex-col md:flex-row items-center gap-5 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="w-full md:w-40 aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                       <ThumbnailImage 
                          thumbnailUrl={course.thumbnailUrl} 
                          title={course.title}
                          className="group-hover:scale-105 transition-transform duration-500"
                       />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-lg">{course.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={cn(
                          "text-[10px] font-semibold uppercase tracking-wide",
                          course.isPublished ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                        <span className="text-xs text-slate-400">{course.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 px-4">
                       <div className="text-center">
                         <p className="text-xs text-slate-500 mb-1">Students</p>
                         <p className="font-semibold text-lg">{course.studentsEnrolled || 0}</p>
                       </div>
                       <Link 
                        href={`/courses/manage/${course._id}`} 
                        className="p-2.5 bg-slate-100 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
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
          convexUser ? (
            <MentorRegister userId={convexUser._id} />
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )
        )}
      </div>

      {/* Instructor Sidebar */}
      <div className="space-y-6 mt-4">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-lg mb-3 text-slate-900">Pro Instructor Tip</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Keep your lesson titles clear and descriptive. Courses with structured curriculum have 40% higher completion rates.
          </p>
        </div>
      </div>
    </div>
  );
}
