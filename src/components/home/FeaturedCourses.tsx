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
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-3 mb-5">
          <div className="max-w-xl space-y-1">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Popular Courses</h2>
            <p className="text-xs sm:text-sm text-slate-500">Expertly crafted lessons to help you master the most in-demand tech skills.</p>
          </div>
          <Link href="/courses" className="text-xs sm:text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1">
            View all courses
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {courses === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg">
            <p className="text-xs text-slate-500">No courses published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
