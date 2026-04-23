"use client";

import React from "react";
import CourseCard from "@/components/courses/CourseCard";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const FeaturedCourses = () => {
  const courses = useQuery(api.courses.listFeatured, { limit: 4 });

  return (
    <section className="py-24 bg-slate-50/50 dark:bg-slate-900/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-xl space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Most <span className="text-cyan-500">Popular</span> Courses</h2>
            <p className="text-muted-foreground">Expertly crafted lessons to help you master the most in-demand tech skills in today&apos;s market.</p>
          </div>
          <Link href="/courses" className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            View All Courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {courses === undefined ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">
            <p className="text-muted-foreground font-bold">No courses published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                id={course._id}
                title={course.title}
                instructor={course.instructorName}
                rating={course.rating}
                reviews={course.totalReviews}
                price={course.price}
                image={course.thumbnailUrl}
                level={course.level}
                duration={course.duration}
                badge={course.studentsEnrolled > 50 ? "Popular" : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;
