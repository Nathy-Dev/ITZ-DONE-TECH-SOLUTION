"use client";

import React from "react";
import { 
  Star, PlayCircle, Globe, Clock, 
  BarChart, Users, CheckCircle2, 
  ChevronDown, Share2, Heart, Flag 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Course Detail Page.
 * Dynamic route for individual courses.
 * Shows detailed curriculum, instructor, and price/enrollment options.
 */
export default function CourseDetailPage() {
  // Static mockup data for a single course (since we're building the frontend)
  const course = {
    title: "Mastering Next.js 15: The Complete Full-Stack Guide",
    description: "Learn Next.js 15 by building production-ready applications with React 19, Tailwind CSS, Prisma, and PostgreSql. This course covers everything from fundamentals to advanced patterns like Server Actions and AI Integration.",
    rating: 4.9,
    reviews: 1250,
    students: 15420,
    lastUpdated: "February 2025",
    language: "English",
    price: 49.99,
    originalPrice: 129.99,
    instructor: {
      name: "Nathy Dev",
      bio: "Senior Full-Stack Engineer with 10+ years of experience in building scalable web applications. Passionate about teaching modern tech stacks.",
      role: "Lead Instructor & Software Architect",
      coursesCount: 15,
      studentsCount: "50,000+",
    }
  };

  const whatYouWillLearn = [
    "Build performant full-stack applications with Next.js 15 and React 19",
    "Master Server Components and Client Components architecture",
    "Implement complex state management and Server Actions",
    "Integrate AI models and LLMs into your web applications",
    "Master advanced Tailwind CSS techniques and Shadcn UI",
    "Deploy production-ready apps to Vercel and AWS"
  ];

  const curriculum = [
    { title: "Introduction to Next.js 15", lessons: 5, duration: "45m" },
    { title: "React 19 Core Concepts", lessons: 8, duration: "1h 20m" },
    { title: "Data Fetching & Caching Strategies", lessons: 12, duration: "2h 15m" },
    { title: "Building the Frontend with Tailwind & Radix", lessons: 15, duration: "3h 45m" },
    { title: "Server Actions and Form Handling", lessons: 10, duration: "1h 50m" },
    { title: "AI Integration with Vercel AI SDK", lessons: 7, duration: "2h 00m" },
  ];

  return (
    <div className="pt-24 pb-20 bg-white dark:bg-slate-950">
      {/* Course Header Banner (Dark) */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <nav className="text-xs font-medium text-slate-400 flex gap-2">
              <Link href="/courses">Courses</Link>
              <span>/</span>
              <span className="text-cyan-400">Development</span>
              <span>/</span>
              <span>Next.js</span>
            </nav>
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {course.title}
            </h1>
            
            <p className="text-xl text-slate-300 leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="font-bold text-lg">{course.rating}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="text-cyan-400 underline ml-1">({course.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{course.students.toLocaleString()} students</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-1.5 font-medium">
                Created by <span className="text-cyan-400 underline">{course.instructor.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Last updated {course.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>{course.language}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 grid lg:grid-cols-3 gap-16">
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-16">
          {/* What you'll learn */}
          <section className="p-8 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <h2 className="text-2xl font-bold mb-8">What you'll learn</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {whatYouWillLearn.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <CheckCircle2 className="w-5 h-5 text-blue-800 shrink-0" />
                  <p className="text-sm dark:text-slate-300 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Curriculum */}
          <section>
            <h2 className="text-2xl font-bold mb-8">Course content</h2>
            <div className="flex justify-between items-center mb-6 text-sm">
              <div className="flex gap-4">
                <span>6 sections</span>
                <span>•</span>
                <span>57 lessons</span>
                <span>•</span>
                <span>24h 45m total length</span>
              </div>
              <button className="text-cyan-500 font-bold hover:underline">Expand all sections</button>
            </div>
            
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {curriculum.map((section, idx) => (
                <div key={idx} className={cn(
                  "border-b border-slate-100 dark:border-slate-900 p-6 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all",
                  idx === curriculum.length - 1 && "border-0"
                )}>
                  <div className="flex items-center gap-4">
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-bold">{section.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{section.lessons} lessons</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{section.duration}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Instructor */}
          <section>
            <h2 className="text-2xl font-bold mb-8">Instructor</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-800 font-bold text-2xl">
                  ND
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-800">{course.instructor.name}</h3>
                  <p className="text-sm text-muted-foreground">{course.instructor.role}</p>
                </div>
              </div>
              <div className="flex gap-12 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span>4.9 Instructor Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{course.instructor.studentsCount} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-blue-800" />
                  <span>{course.instructor.coursesCount} Courses</span>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {course.instructor.bio}
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar (Right) */}
        <div className="relative">
          <div className="sticky top-32 p-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
            {/* Preview Placeholder */}
            <div className="relative aspect-video bg-slate-900 rounded-[2.25rem] flex items-center justify-center group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 to-cyan-500/20" />
              <PlayCircle className="w-20 h-20 text-white fill-white/10 opacity-80 group-hover:scale-110 transition-transform cursor-pointer" />
              <p className="absolute bottom-6 text-white text-sm font-medium uppercase tracking-widest">Preview this course</p>
            </div>

            <div className="p-10 space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-extrabold">${course.price}</span>
                <span className="text-xl text-muted-foreground line-through">${course.originalPrice}</span>
                <span className="text-blue-800 font-bold px-2 py-1 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">62% OFF</span>
              </div>

              <div className="space-y-4">
                <button className="w-full py-5 bg-blue-800 text-white font-extrabold rounded-2xl hover:bg-blue-900 shadow-xl shadow-blue-800/20 transition-all active:scale-[0.98]">
                  Buy Now
                </button>
                <button className="w-full py-4 border-2 border-slate-200 dark:border-slate-800 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                  Add to Cart
                </button>
              </div>

              <p className="text-xs text-center text-muted-foreground">30-Day Money-Back Guarantee</p>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-900">
                <h5 className="font-bold text-sm">This course includes:</h5>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-3"><PlayCircle className="w-4 h-4" /> 24 hours on-demand video</li>
                  <li className="flex items-center gap-3"><Clock className="w-4 h-4" /> Lifetime access</li>
                  <li className="flex items-center gap-3"><BarChart className="w-4 h-4" /> Assignments and projects</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4" /> Certificate of completion</li>
                </ul>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button className="flex items-center gap-2 text-sm font-bold hover:text-cyan-500 transition-all"><Share2 className="w-4 h-4" /> Share</button>
                <button className="flex items-center gap-2 text-sm font-bold hover:text-cyan-500 transition-all"><Heart className="w-4 h-4" /> Favorite</button>
                <button className="flex items-center gap-2 text-sm font-bold hover:text-red-500 transition-all"><Flag className="w-4 h-4" /> Report</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing component from standard library used in code
function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
