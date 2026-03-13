"use client";

import React, { use, useState } from "react";
import { 
  Star, PlayCircle, Globe, Clock, 
  BarChart, Users, CheckCircle2, 
  ChevronDown, Share2, Heart,
  ShieldCheck,
  Calendar,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const { id: courseId } = use(params) as { id: any };
  const { data: session } = useSession();
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const course = useQuery(api.courses.getById, { id: courseId });
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

  const createEnrollment = useMutation(api.enrollments.createEnrollment);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-800 border-t-transparent"></div>
      </div>
    );
  }

  const handleEnroll = async () => {
    if (!session) {
      router.push("/login?callbackUrl=/courses/" + courseId);
      return;
    }

    if (!convexUser) return;

    setIsEnrolling(true);
    try {
      await createEnrollment({
        courseId,
        userId: convexUser._id,
      });
      // Refresh or redirect is handled by reactive useQuery 'enrollment'
    } catch (error) {
      console.error("Enrollment failed:", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const whatYouWillLearn = [
    "Comprehensive understanding of " + course.title,
    "Practical hands-on experience with real-world projects",
    "Master advanced concepts and industry best practices",
    "Gain skills that are highly in-demand in the current market",
  ];

  const isEnrolled = !!enrollment;

  return (
    <div className="pt-24 pb-20 bg-white dark:bg-slate-950">
      {/* Course Header Banner (Dark) */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-3 gap-12 relative z-10">
          <div className="lg:col-span-2 space-y-6">
            <nav className="text-xs font-black uppercase tracking-widest text-slate-400 flex gap-2">
              <Link href="/courses" className="hover:text-cyan-400 transition-colors">Courses</Link>
              <span>/</span>
              <span className="text-cyan-400">{course.category}</span>
              <span>/</span>
              <span>{course.level}</span>
            </nav>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {course.title}
            </h1>
            
            <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-8 text-sm">
              <div className="flex items-center gap-2 text-amber-400">
                <span className="font-black text-2xl">{course.rating.toFixed(1)}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={cn("w-4 h-4 fill-current", i > Math.floor(course.rating) && "opacity-30")} />
                  ))}
                </div>
                <span className="text-slate-400 ml-1">(2.5k reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="font-bold">{course.studentsEnrolled.toLocaleString()} students</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 text-sm text-slate-300 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center font-bold text-[10px]">
                  {course.instructorId.substring(0, 2).toUpperCase()}
                </div>
                <span>Created by <span className="text-cyan-400 font-bold">Instructor</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Last updated {course.publishedAt ? new Date(course.publishedAt).toLocaleDateString() : "Recently"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>English</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 grid lg:grid-cols-3 gap-16">
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-16">
          {/* What you'll learn */}
          <section className="p-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[32px]">
            <h2 className="text-2xl font-black mb-8">What you&apos;ll learn</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {whatYouWillLearn.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-800 dark:text-cyan-400" />
                  </div>
                  <p className="text-sm dark:text-slate-300 leading-relaxed font-medium">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Curriculum */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-black">Course Curriculum</h2>
              <div className="flex gap-4 text-sm font-bold text-slate-500">
                <span>{sections?.length || 0} sections</span>
                <span>•</span>
                <span>{course.duration} total length</span>
              </div>
            </div>
            
            <div className="space-y-4">
               {sections?.map((section) => (
                 <SectionAccordion 
                  key={section._id} 
                  section={section} 
                  isEnrolled={isEnrolled}
                />
               ))}
               
               {sections?.length === 0 && (
                 <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">
                   <p className="text-muted-foreground uppercase font-black text-xs tracking-widest">No content available yet</p>
                 </div>
               )}
            </div>
          </section>

          {/* Instructor Placeholder */}
          <section className="p-10 border border-slate-100 dark:border-slate-800 rounded-[32px]">
            <h2 className="text-2xl font-black mb-8 text-blue-800 dark:text-cyan-400">Your Instructor</h2>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-2xl">
                {course.instructorId.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-grow space-y-4">
                <div>
                  <h3 className="text-2xl font-black">Lead Instructor</h3>
                  <p className="text-blue-800 dark:text-cyan-400 font-bold">Expert Educator</p>
                </div>
                <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span>4.9 Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>1,000+ Students</span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Leading expert in the field with years of practical experience and a passion for teaching modern technologies.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar (Right) */}
        <div className="relative">
          <div className="sticky top-32 p-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden">
            {/* Preview Section */}
            <div className="relative aspect-video bg-slate-900 rounded-[2.75rem] flex items-center justify-center group overflow-hidden m-2">
              {course.thumbnailUrl ? (
                <Image 
                  src={course.thumbnailUrl} 
                  alt={course.title} 
                  fill 
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-800/40 to-cyan-500/40" />
              )}
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors" />
              <PlayCircle className="w-20 h-20 text-white fill-white/10 relative z-10 group-hover:scale-110 transition-transform cursor-pointer drop-shadow-2xl" />
              <p className="absolute bottom-6 text-white text-[10px] font-black uppercase tracking-[0.2em] z-10 opacity-80">Preview Course</p>
            </div>

            <div className="p-10 space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black tracking-tighter">${course.price}</span>
                <div className="flex flex-col">
                  <span className="text-lg text-slate-400 line-through font-bold">${(course.price * 2.5).toFixed(2)}</span>
                  <span className="text-blue-800 dark:text-cyan-400 font-black text-xs uppercase tracking-widest">60% OFF</span>
                </div>
              </div>

              <div className="space-y-4">
                {isEnrolled ? (
                  <Link 
                    href={`/courses/${courseId}/lessons/start`} // We'll handle 'start' redirect in the viewer or helper
                    className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-2xl shadow-emerald-800/30 transition-all active:scale-[0.98] text-lg flex items-center justify-center gap-2"
                  >
                    Go to Course
                  </Link>
                ) : (
                  <button 
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full py-5 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 shadow-2xl shadow-blue-800/30 transition-all active:scale-[0.98] text-lg flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isEnrolling ? <Loader2 className="w-6 h-6 animate-spin" /> : "Enroll Now"}
                  </button>
                )}
                
                {!isEnrolled && (
                  <button className="w-full py-5 border-2 border-slate-100 dark:border-slate-800 font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-lg">
                    Add to Cart
                  </button>
                )}
              </div>

              <p className="text-[10px] text-center text-slate-400 font-black uppercase tracking-[0.1em]">30-Day Money-Back Guarantee</p>

              <div className="space-y-5 pt-8 border-t border-slate-100 dark:border-slate-900">
                <h5 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">This course includes:</h5>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <li className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <PlayCircle className="w-4 h-4 text-blue-800 dark:text-cyan-400" />
                    </div>
                    <span>{course.duration} on-demand video</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-800 dark:text-cyan-400" />
                    </div>
                    <span>Full lifetime access</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <BarChart className="w-4 h-4 text-blue-800 dark:text-cyan-400" />
                    </div>
                    <span>Assignments & Projects</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-blue-800 dark:text-cyan-400" />
                    </div>
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-between items-center pt-6">
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-800 transition-all"><Share2 className="w-4 h-4" /> Share</button>
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all"><Heart className="w-4 h-4" /> Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionAccordion({ section, isEnrolled }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const lessons = useQuery(api.content.listLessons, { sectionId: section._id });

  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 group transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full p-6 flex justify-between items-center transition-all",
          isOpen ? "bg-slate-50 dark:bg-slate-800/50" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
        )}
      >
        <div className="flex items-center gap-5">
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
            isOpen ? "bg-blue-800 text-white rotate-180" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
          )}>
            <ChevronDown className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-black text-lg">{section.title}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{lessons?.length || 0} lessons</p>
          </div>
        </div>
      </button>
      
      {isOpen && (
        <div className="p-2 space-y-1 animate-in slide-in-from-top-4 duration-300">
          {lessons?.map((lesson: any) => {
            const isLocked = !isEnrolled && !lesson.isFree;
            
            return (
              <div 
                key={lesson._id} 
                className={cn(
                  "flex items-center justify-between p-4 px-6 rounded-2xl transition-colors group/lesson",
                  isLocked ? "bg-slate-50/50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-8 h-8 rounded-lg flex items-center justify-center",
                     isLocked ? "bg-slate-200 dark:bg-slate-800 text-slate-400" : "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-cyan-400"
                   )}>
                     {isLocked ? <Clock className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                   </div>
                   {isLocked ? (
                     <span className="font-bold text-sm tracking-tight">{lesson.title}</span>
                   ) : (
                    <Link 
                      href={`/courses/${section.courseId}/lessons/${lesson._id}`}
                      className="font-bold text-sm tracking-tight hover:text-blue-800 dark:hover:text-cyan-400 transition-colors"
                    >
                      {lesson.title}
                    </Link>
                   )}
                </div>
                <div className="flex items-center gap-4 text-xs font-black text-slate-400">
                  {lesson.isFree && <span className="text-emerald-500 uppercase tracking-widest text-[10px]">Preview</span>}
                  {isLocked && <span className="uppercase tracking-widest text-[10px]">Locked</span>}
                  <span>{lesson.duration || "5m"}</span>
                </div>
              </div>
            );
          })}
          
          {lessons?.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No lessons in this section</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
