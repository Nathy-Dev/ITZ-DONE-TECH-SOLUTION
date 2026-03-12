"use client";

import React from "react";
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
  BarChart3,
  Video
} from "lucide-react";
import Link from "next/link";
import CourseCard from "@/components/courses/CourseCard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const SAMPLE_COURSES = [
  {
    id: "1",
    title: "Mastering Next.js 15: The Ultimate Guide",
    instructor: "Sarah Drasner",
    rating: 4.9,
    reviews: 1240,
    price: 89,
    originalPrice: 129,
    image: "/courses/nextjs.jpg",
    level: "Advanced",
    duration: "18h 45m",
    badge: "Bestseller"
  },
  {
    id: "2",
    title: "Full-Stack AI Engineering with Python",
    instructor: "Dr. Angela Yu",
    rating: 4.8,
    reviews: 856,
    price: 99,
    originalPrice: 149,
    image: "/courses/ai.jpg",
    level: "Intermediate",
    duration: "24h 30m",
    badge: "New"
  },
  {
    id: "3",
    title: "Cloud Architecture on AWS",
    instructor: "Maximilian Schwarzmüller",
    rating: 4.7,
    reviews: 2100,
    price: 79,
    originalPrice: 119,
    image: "/courses/aws.jpg",
    level: "All Levels",
    duration: "15h 20m"
  },
  {
    id: "4",
    title: "Cybersecurity Essentials: Zero to Hero",
    instructor: "John Smilga",
    rating: 4.9,
    reviews: 540,
    price: 69,
    originalPrice: 99,
    image: "/courses/cyber.jpg",
    level: "Beginner",
    duration: "12h 10m",
    badge: "Popular"
  }
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  
  const convexUser = useQuery(api.users.getUserByProviderId, 
    session?.user?.id ? { providerId: session.user.id } : "skip"
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

  const allCourses = useQuery(api.courses.list);
  const instructorCourses = useQuery(api.courses.listByInstructor, 
    session?.user?.id ? { instructorId: session.user.id } : "skip"
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, <span className="text-blue-800 dark:text-cyan-400">{session?.user?.name?.split(" ")[0]}!</span>
            </h1>
            <p className="text-muted-foreground mt-2">
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
                <Trophy className="w-5 h-5" />
                <div className="text-sm">
                  <p className="font-bold">1,250 XP</p>
                  <p className="text-[10px] text-blue-200">Level 12 Scholar</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {isInstructor ? (
          <InstructorDashboard courses={instructorCourses} />
        ) : (
          <LearnerDashboard courses={allCourses} />
        )}
      </div>
    </div>
  );
}

function LearnerDashboard({ courses }: { courses: any[] | undefined }) {
  const displayCourses = courses || SAMPLE_COURSES; // Fallback to samples if no live data yet
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-8">
        {/* Continue Learning Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-800/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-cyan-400 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <h2 className="text-xl font-bold">Continue Learning</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-48 aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-800/40 to-cyan-500/40" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-cyan-400 w-[65%]" />
                </div>
              </div>
              
              <div className="flex-grow">
                <h3 className="font-bold text-lg mb-2">Advanced Tailwind CSS & Motion</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Module 4 of 12</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-500 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>65% Complete</span>
                  </div>
                </div>
                <button className="px-8 py-3 bg-blue-800 text-white font-bold rounded-xl hover:bg-blue-900 transition-all flex items-center gap-2">
                    Continue Lesson
                    <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Explore Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold">Recommended for You</h2>
            </div>
            <Link href="/courses" className="text-blue-800 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayCourses.slice(0, 4).map((course) => (
              <CourseCard 
                key={course._id || course.id} 
                {...course} 
                image={course.thumbnailUrl || course.image}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Area */}
      <div className="space-y-8">
        {/* Stats / Quick Links */}
        <div className="bg-blue-800 rounded-[32px] p-8 text-white shadow-2xl shadow-blue-800/40">
          <h3 className="font-bold text-xl mb-6">Learning Goals</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Weekly Progress</span>
                <span>4.5 / 6 hours</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full">
                <div className="h-full bg-cyan-400 rounded-full w-[75%]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white/10 rounded-2xl">
                <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Courses</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl">
                <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Hours</p>
                <p className="text-2xl font-bold">32.5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
          <h3 className="font-bold text-xl mb-6">Announcements</h3>
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
                <p className="text-[10px] text-blue-800 dark:text-cyan-500 font-bold uppercase tracking-wider mb-1">{item.date}</p>
                <h4 className="font-bold group-hover:text-blue-800 transition-colors">{item.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
            View All Notification
          </button>
        </div>
      </div>
    </div>
  );
}

function InstructorDashboard({ courses }: { courses: any[] | undefined }) {
  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Stats Overview */}
      {[
        { label: "Total Students", value: "248", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Course Revenue", value: "$12,450", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100" },
        { label: "Course Rating", value: "4.8", icon: Trophy, color: "text-amber-600", bg: "bg-amber-100" },
        { label: "Total Courses", value: "6", icon: Video, color: "text-purple-600", bg: "bg-purple-100" },
      ].map((stat, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Main Instructor Area */}
      <div className="lg:col-span-3 space-y-8 mt-4">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Your Courses</h2>
            <button className="text-blue-800 font-bold hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {courses?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You haven't created any courses yet.</p>
                <Link href="/courses/create" className="text-blue-800 font-bold hover:underline mt-2 inline-block">Create your first course</Link>
              </div>
            )}
            {courses?.map((course, i) => (
              <div key={course._id} className="flex flex-col md:flex-row items-center gap-6 p-4 border border-slate-50 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-full md:w-32 aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative">
                   <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-lg">{course.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">Status: <span className="text-emerald-600 font-bold">Draft</span></p>
                </div>
                <div className="flex items-center gap-8">
                   <div className="text-center">
                     <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Students</p>
                     <p className="font-bold">{course.studentsEnrolled || 0}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Price</p>
                     <p className="font-bold text-emerald-600">${course.price}</p>
                   </div>
                   <Link href={`/courses/manage/${course._id}`} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors">
                      <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructor Sidebar */}
      <div className="space-y-6 mt-4">
        <div className="bg-blue-800 rounded-[32px] p-8 text-white">
          <h3 className="font-bold text-xl mb-4">Quick Tip</h3>
          <p className="text-blue-100 text-sm leading-relaxed">
            Course thumbnails with high contrast and clear text tend to have 30% higher click-through rates.
          </p>
          <button className="mt-6 text-sm font-bold bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
            Read More
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-xl mb-6">Recent Activity</h3>
          <div className="space-y-4">
             {[
               "New student enrolled",
               "Comment on Lesson 4",
               "Payout processed",
             ].map((activity, i) => (
               <div key={i} className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-800 rounded-full mt-1.5 shrink-0" />
                  <p className="text-muted-foreground"><span className="font-bold text-foreground">{activity}</span> 2 hours ago</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
