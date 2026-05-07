"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSession } from "next-auth/react";
import { Search, Eye, CheckCircle, XCircle, X, PlayCircle, Video } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AdminCoursesPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const courses = useQuery(api.admin.listCourses, 
    session?.user?.id ? { providerId: session.user.id } : "skip"
  );

  const reviewCourse = useMutation(api.admin.reviewCourse);

  const handleOpenReview = (course: any) => {
    setSelectedCourse(course);
    setRejectionReason(course.rejectionReason || "");
    setReviewModalOpen(true);
  };

  const handleCloseReview = () => {
    setReviewModalOpen(false);
    setSelectedCourse(null);
    setRejectionReason("");
  };

  const handleSubmitReview = async (status: "published" | "rejected") => {
    if (!session?.user?.id || !selectedCourse) return;
    
    if (status === "rejected" && !rejectionReason.trim()) {
      alert("Please provide a reason for rejecting the course.");
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewCourse({
        providerId: session.user.id,
        courseId: selectedCourse._id,
        status,
        rejectionReason: status === "rejected" ? rejectionReason : undefined,
      });
      handleCloseReview();
    } catch (error) {
      console.error("Failed to review course:", error);
      alert("Failed to update course status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourses = courses?.filter(course => 
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">
            Course Management
          </h1>
          <p className="text-muted-foreground font-medium">
            Monitor and manage all courses on the platform.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-800 transition-all font-medium"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-800/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-sm font-black text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-5">Course</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5">Enrollments</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {!filteredCourses ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">Loading courses...</td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">No courses found.</td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0 relative">
                            {course.thumbnailUrl && course.thumbnailUrl.startsWith("http") ? (
                               <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                            ) : (
                               <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30"></div>
                            )}
                         </div>
                         <span className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[200px]">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {course.category}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {formatPrice(course.price)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {course.studentsEnrolled || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit",
                        course.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : 
                        course.status === "in_review" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-cyan-400 animate-pulse" :
                        course.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {course.status === "published" ? "Published" : 
                         course.status === "in_review" ? "In Review" :
                         course.status === "rejected" ? "Rejected" :
                         "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenReview(course)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ml-auto",
                          course.status === "in_review" 
                            ? "bg-blue-800 text-white hover:bg-blue-900 shadow-lg shadow-blue-800/20" 
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        )}
                      >
                        <Eye className="w-4 h-4" /> 
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviewModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-6">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
               <div>
                 <h2 className="text-2xl font-bold">Course Review</h2>
                 <p className="text-sm text-muted-foreground mt-1">Reviewing: <span className="font-bold text-slate-900 dark:text-white">{selectedCourse.title}</span></p>
               </div>
               <button onClick={handleCloseReview} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
               <div className="space-y-3">
                 <label className="text-sm font-bold block">Course Curriculum Preview</label>
                 <CoursePreview courseId={selectedCourse._id} />
               </div>

               <div className="space-y-3">
                 <label className="text-sm font-bold block">Rejection Reason (if rejecting)</label>
                 <textarea 
                   placeholder="Provide detailed feedback on what the instructor needs to fix before this course can be published..."
                   rows={4}
                   value={rejectionReason}
                   onChange={(e) => setRejectionReason(e.target.value)}
                   className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-800/20 resize-none text-sm"
                 />
                 <p className="text-xs text-muted-foreground">This feedback will be emailed directly to the instructor.</p>
               </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-3 justify-end">
               <button 
                 disabled={isSubmitting}
                 onClick={() => handleSubmitReview("rejected")}
                 className="px-6 py-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
               >
                 <XCircle className="w-5 h-5" />
                 Reject & Return to Draft
               </button>
               <button 
                 disabled={isSubmitting}
                 onClick={() => handleSubmitReview("published")}
                 className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
               >
                 <CheckCircle className="w-5 h-5" />
                 Approve & Publish
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CoursePreview({ courseId }: { courseId: any }) {
  const sections = useQuery(api.content.listSections, { courseId });
  
  if (!sections) return <div className="p-4 text-center text-sm text-slate-500 animate-pulse">Loading curriculum...</div>;
  if (sections.length === 0) return <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl">No sections added yet.</div>;

  return (
    <div className="space-y-4 pr-2">
      {sections.sort((a, b) => a.order - b.order).map(section => (
        <SectionPreview key={section._id} section={section} />
      ))}
    </div>
  );
}

function SectionPreview({ section }: { section: any }) {
  const lessons = useQuery(api.content.listLessons, { sectionId: section._id });

  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 font-bold text-sm">
        {section.title}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {!lessons ? (
          <div className="p-3 text-xs text-slate-400 pl-8">Loading lessons...</div>
        ) : lessons.length === 0 ? (
          <div className="p-3 text-xs text-slate-400 pl-8">Empty section</div>
        ) : (
          lessons.sort((a, b) => a.order - b.order).map((lesson: any) => (
            <div key={lesson._id} className="p-3 pl-8 text-sm flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <PlayCircle className="w-3.5 h-3.5 text-blue-500" />
                  {lesson.title}
                </span>
                <span className="text-xs text-slate-400">{lesson.duration || "-"}</span>
              </div>
              {lesson.videoUrl && (
                 <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 ml-5 mt-1 w-fit">
                   <Video className="w-3 h-3" /> View Video
                 </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
