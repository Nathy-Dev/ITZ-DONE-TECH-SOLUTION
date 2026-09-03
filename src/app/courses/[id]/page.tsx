"use client";

import React, { use, useState, useEffect } from "react";
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
import { formatPrice, ngnToUsd } from "@/lib/format";
import { useFxRate } from "@/hooks/useFxRate";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id, Doc } from "../../../../convex/_generated/dataModel";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { ShoppingCart, CheckCircle } from "lucide-react";
import CourseReviews from "@/components/courses/CourseReviews";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id as Id<"courses">;
  const { data: session } = useSession();
  const router = useRouter();
  const fxRate = useFxRate();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const course = useQuery(api.courses.getByIdDetailed, { id: courseId });
  const sections = useQuery(api.content.listSections, { courseId });
  
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(courseId);
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

  // Thumbnail resolution: media asset IDs resolve through the sessionless proxy endpoint.
  const rawImage = course?.thumbnailUrl;
  const thumbnailMediaId = course?.thumbnailMediaId || (rawImage && !rawImage.startsWith("http") && !rawImage.startsWith("/") ? rawImage : undefined);
  const displayImage = thumbnailMediaId ? `/api/media/${thumbnailMediaId}/thumbnail` : rawImage;

  // Load saved state from localStorage on mount (before early returns
  // to keep hook order stable)
  useEffect(() => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("itz_done_saved_courses") ?? "[]");
      setIsSaved(saved.includes(courseId));
    } catch {
      // Corrupt localStorage — ignore
    }
  }, [courseId]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const isPublished = course.status === "published" || (!course.status && course.isPublished);
  const isOwner = !!(convexUser?._id && course.instructorId === convexUser._id);
  const isAdmin = convexUser?.role === "admin" || !!convexUser?.isAdmin;

  if (!isPublished && !isOwner && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-10 px-4 sm:px-6">
        <div className="max-w-md mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Course Not Available</h1>
          <p className="text-slate-500 text-sm">
            This course is currently undergoing review and has not yet been published.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Published Courses
          </Link>
        </div>
      </div>
    );
  }

  const handleEnroll = async () => {
    if (!session) {
      router.push("/login?callbackUrl=/courses/" + courseId);
      return;
    }

    if (!convexUser) return;

    // Free course: enroll directly (no payment needed)
    if (course.price === 0) {
      setIsEnrolling(true);
      try {
        await createEnrollment({
          courseId,
          userId: convexUser._id,
        });
        // Refresh is handled by the reactive useQuery 'enrollment'
      } catch (error) {
        console.error("Enrollment failed:", error);
      } finally {
        setIsEnrolling(false);
      }
      return;
    }

    // Paid course: add to cart and go through Flutterwave checkout
    addItem({
      id: course._id,
      title: course.title,
      price: course.price,
      image: displayImage || undefined,
      instructor: course.instructor?.name || "Instructor",
    });
    router.push("/checkout");
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: course.title,
      text: `Check out "${course.title}" on ITZ-DONE TECH SOLUTION`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the share dialog — no action needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch {
        // Clipboard unavailable — no action needed
      }
    }
  };

  const handleSave = () => {
    // Toggle saved state (persisted to localStorage)
    const key = "itz_done_saved_courses";
    const saved: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (saved.includes(courseId)) {
      localStorage.setItem(key, JSON.stringify(saved.filter((id) => id !== courseId)));
      setIsSaved(false);
    } else {
      localStorage.setItem(key, JSON.stringify([...saved, courseId]));
      setIsSaved(true);
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
    <div className="pt-14 pb-8 bg-white">
      {/* Course Header Banner */}
      <section className="bg-slate-50 border-b border-slate-200 py-6 md:py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <nav aria-label="Breadcrumb" className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Link href="/courses" className="hover:text-blue-600 transition-colors">Courses</Link>
              <span>/</span>
              <span className="text-blue-600">{course.category}</span>
              <span>/</span>
              <span>{course.level}</span>
            </nav>
            
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight text-slate-900">
              {course.title}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-amber-500">
                <span className="font-bold text-base text-slate-900">{course.rating.toFixed(1)}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i: number) => (
                    <Star key={i} className={cn("w-3.5 h-3.5 fill-current", i > Math.floor(course.rating) && "opacity-30")} />
                  ))}
                </div>
                <span className="text-slate-500 ml-0.5">({course.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium">{course.studentsEnrolled.toLocaleString()} students</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-[9px] text-white overflow-hidden">
                  {course.instructor?.profileImage ? (
                    <Image src={course.instructor.profileImage} alt={course.instructor.name} width={20} height={20} className="object-cover" />
                  ) : (
                    course.instructor?.name.substring(0, 2).toUpperCase() || "IN"
                  )}
                </div>
                <span>Created by <span className="text-blue-600 font-medium">{course.instructor?.name || "Instructor"}</span></span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Updated {course.publishedAt ? new Date(course.publishedAt).toLocaleDateString() : "Recently"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>English</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid lg:grid-cols-3 gap-6">
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-6">
          {/* What you'll learn */}
          <section className="p-4 md:p-5 bg-slate-50/60 border border-slate-200 rounded-lg">
            <h2 className="text-base md:text-lg font-bold mb-4 text-slate-900">What you&apos;ll learn</h2>
            <div className="grid sm:grid-cols-2 gap-3.5">
              {whatYouWillLearn.map((item: string, idx: number) => (
                <div key={idx} className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Curriculum */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
              <h2 className="text-base md:text-lg font-bold text-slate-900">Course Curriculum</h2>
              <div className="flex gap-3 text-xs text-slate-500">
                <span>{sections?.length || 0} sections</span>
                <span>•</span>
                <span>{course.duration} total length</span>
              </div>
            </div>
            
            <div className="space-y-2.5">
               {sections?.map((section) => (
                 <SectionAccordion 
                  key={section._id} 
                  section={section} 
                  isEnrolled={isEnrolled}
                />
               ))}
               
               {sections?.length === 0 && (
                 <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                   <p className="text-slate-500 text-xs">No content available yet</p>
                 </div>
               )}
            </div>
          </section>

          {/* Reviews Section */}
          <section id="reviews">
            <CourseReviews courseId={courseId} userId={convexUser?._id || null} isEnrolled={isEnrolled} />
          </section>

          {/* Instructor Placeholder */}
          <section className="p-4 md:p-5 border border-slate-200 rounded-lg bg-white">
            <h2 className="text-base md:text-lg font-bold mb-4 text-slate-900">Your Instructor</h2>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg overflow-hidden shrink-0">
                {course.instructor?.profileImage ? (
                  <Image src={course.instructor.profileImage} alt={course.instructor.name} width={56} height={56} className="object-cover" />
                ) : (
                  course.instructor?.name.substring(0, 2).toUpperCase() || "IN"
                )}
              </div>
              <div className="flex-grow space-y-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{course.instructor?.name || "Lead Instructor"}</h3>
                  <p className="text-blue-600 font-medium text-xs">Expert Educator</p>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span>4.9 Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>{course.studentsEnrolled.toLocaleString()} Students</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {course.instructor?.bio || "Leading expert in the field with years of practical experience and a passion for teaching modern technologies."}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar (Right) */}
        <div className="relative">
          <div className="sticky top-16 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            {/* Preview Section */}
            <div className="relative aspect-video bg-slate-900 flex items-center justify-center group overflow-hidden">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={course.title}
                  fill
                  unoptimized
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-blue-500/40" />
              )}
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors" />
              <PlayCircle className="w-12 h-12 text-white fill-white/10 relative z-10 group-hover:scale-105 transition-transform cursor-pointer" />
              <p className="absolute bottom-3 text-white text-[9px] font-medium uppercase tracking-widest z-10 opacity-80">Preview Course</p>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-2xl font-bold text-slate-900">{formatPrice(course.price)}</span>
                <div className="flex flex-col">
                  {course.price > 0 && (
                    <>
                      <span className="text-xs text-slate-400 line-through">{formatPrice(Math.round(course.price * 2.5))}</span>
                      <span className="text-blue-600 font-semibold text-[10px] uppercase tracking-wide">60% OFF</span>
                    </>
                  )}
                </div>
              </div>
              {course.price > 0 && (
                <p className="text-[11px] text-slate-500 font-medium">
                  ≈ {formatPrice(ngnToUsd(course.price, fxRate), "USD")} for international students
                </p>
              )}

              <div className="space-y-2">
                {isEnrolled ? (
                  <Link
                    href={`/courses/${courseId}/lessons/start`}
                    className="w-full py-2.5 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    Go to Course
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70 shadow-sm shadow-blue-600/20"
                  >
                    {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enroll Now"}
                  </button>
                )}
                
                {/* Add to Cart is a learner feature — hidden for instructors */}
                {!isEnrolled && convexUser?.role !== "instructor" && (
                  <button
                    onClick={() => {
                      if (course) {
                        addItem({
                          id: course._id,
                          title: course.title,
                          price: course.price,
                          image: displayImage || undefined,
                          instructor: course.instructor?.name || "Instructor"
                        });
                      }
                    }}
                    disabled={inCart}
                    className={cn(
                      "w-full py-2.5 border border-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5",
                      inCart
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "hover:bg-slate-50"
                    )}
                  >
                    {inCart ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        In Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </>
                    )}
                  </button>
                )}
              </div>

              <p className="text-[11px] text-center text-slate-400">30-Day Money-Back Guarantee</p>

              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <h5 className="font-semibold text-[10px] uppercase tracking-wide text-slate-400">This course includes:</h5>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <PlayCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{course.duration} on-demand video</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Full lifetime access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Assignments & Projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-blue-600 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" /> {shareCopied ? "Link Copied!" : "Share"}
                </button>
                <button
                  onClick={handleSave}
                  className={cn(
                    "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all",
                    isSaved ? "text-red-500" : "text-slate-400 hover:text-red-500"
                  )}
                >
                  <Heart className={cn("w-3.5 h-3.5", isSaved && "fill-current")} /> {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionAccordion({ section, isEnrolled }: { section: Doc<"sections">; isEnrolled: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const lessons = useQuery(api.content.listLessons, { sectionId: section._id });

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          "w-full p-3 flex justify-between items-center transition-colors",
          isOpen ? "bg-slate-50" : "hover:bg-slate-50/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-6 h-6 rounded flex items-center justify-center transition-all",
            isOpen ? "bg-blue-600 text-white rotate-180" : "bg-slate-100 text-slate-500"
          )}>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-xs sm:text-sm text-slate-900">{section.title}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{lessons?.length || 0} lessons</p>
          </div>
        </div>
      </button>
      
      {isOpen && (
        <div className="p-1.5 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
          {lessons?.map((lesson) => {
            const isLocked = !isEnrolled && !lesson.isFree;
            
            return (
              <div 
                key={lesson._id} 
                className={cn(
                  "flex items-center justify-between p-2 px-3 rounded-md transition-colors group/lesson",
                  isLocked ? "bg-slate-50/50 opacity-60 cursor-not-allowed" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                   <div className={cn(
                     "w-6 h-6 rounded flex items-center justify-center shrink-0",
                     isLocked ? "bg-slate-200 text-slate-400" : "bg-blue-50 text-blue-600"
                   )}>
                     {isLocked ? <Clock className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
                   </div>
                   {isLocked ? (
                     <span className="font-medium text-xs text-slate-700">{lesson.title}</span>
                   ) : (
                    <Link 
                      href={`/courses/${section.courseId}/lessons/${lesson._id}`}
                      className="font-medium text-xs text-slate-800 hover:text-blue-600 transition-colors"
                    >
                      {lesson.title}
                    </Link>
                   )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  {lesson.isFree && <span className="text-emerald-600 text-[9px] font-medium">Preview</span>}
                  {isLocked && <span className="text-slate-400 text-[9px] font-medium">Locked</span>}
                  <span>{lesson.duration || "5m"}</span>
                </div>
              </div>
            );
          })}
          
          {lessons?.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-[11px] text-slate-400">No lessons in this section</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
