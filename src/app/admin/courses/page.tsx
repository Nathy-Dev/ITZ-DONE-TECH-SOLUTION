"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSession } from "next-auth/react";
import { Search, MoreVertical, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AdminCoursesPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");

  const courses = useQuery(api.admin.listCourses, 
    session?.user?.id ? { providerId: session.user.id } : "skip"
  );

  const togglePublishStatus = useMutation(api.admin.toggleCoursePublishStatus);

  const handleTogglePublish = async (courseId: any, currentStatus: boolean) => {
    if (!session?.user?.id) return;
    try {
      await togglePublishStatus({
        providerId: session.user.id,
        courseId: courseId,
        isPublished: !currentStatus
      });
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
      alert("Failed to update course status");
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
                        course.isPublished ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleTogglePublish(course._id, course.isPublished)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ml-auto",
                          course.isPublished 
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700" 
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-cyan-400 dark:hover:bg-blue-900/50"
                        )}
                      >
                        {course.isPublished ? (
                          <><EyeOff className="w-4 h-4" /> Unpublish</>
                        ) : (
                          <><Eye className="w-4 h-4" /> Publish</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
