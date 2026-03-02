import React from "react";
import CourseCard from "@/components/courses/CourseCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

const FeaturedCourses = () => {
  return (
    <section className="py-24 bg-slate-50/50 dark:bg-slate-900/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-xl space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Most <span className="text-indigo-600">Popular</span> Courses</h2>
            <p className="text-muted-foreground">Expertly crafted lessons to help you master the most in-demand tech skills in today's market.</p>
          </div>
          <Link href="/courses" className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            View All Courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SAMPLE_COURSES.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
