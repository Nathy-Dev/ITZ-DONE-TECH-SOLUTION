"use client";

import React, { useState } from "react";
import { Search, Filter, ChevronDown, LayoutGrid, List } from "lucide-react";
import CourseCard from "@/components/courses/CourseCard";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Mock data for courses
const MOCK_COURSES = [
  {
    id: "nextjs-fullstack",
    title: "Mastering Next.js 15: The Complete Full-Stack Guide",
    instructor: "Nathy Dev",
    rating: 4.9,
    reviews: 1250,
    price: 49.99,
    originalPrice: 129.99,
    image: "",
    level: "Advanced",
    duration: "24h 45m",
    badge: "Best Seller"
  },
  {
    id: "ai-engineering",
    title: "AI Engineering with Python & OpenAI API",
    instructor: "Sarah Johnson",
    rating: 4.8,
    reviews: 840,
    price: 89.99,
    originalPrice: 199.99,
    image: "",
    level: "Intermediate",
    duration: "18h 20m",
    badge: "New"
  },
  {
    id: "ui-ux-modern",
    title: "Modern UI/UX Design with Figma & Framer",
    instructor: "Alex Rivera",
    rating: 4.7,
    reviews: 2100,
    price: 39.99,
    originalPrice: 89.99,
    image: "",
    level: "Beginner",
    duration: "12h 15m"
  },
  {
    id: "cloud-architect",
    title: "AWS Solutions Architect Associate Certification",
    instructor: "David Miller",
    rating: 4.9,
    reviews: 3200,
    price: 99.99,
    originalPrice: 249.99,
    image: "",
    level: "Intermediate",
    duration: "35h 00m",
    badge: "Top Rated"
  },
  {
    id: "cybersecurity-zero",
    title: "Cybersecurity from Zero to Hero (2025)",
    instructor: "Emma Wilson",
    rating: 4.6,
    reviews: 1500,
    price: 59.99,
    originalPrice: 149.99,
    image: "",
    level: "All Levels",
    duration: "20h 30m"
  },
  {
    id: "react-native-mastery",
    title: "React Native Mastery: Build Cross-Platform Apps",
    instructor: "Nathy Dev",
    rating: 4.9,
    reviews: 600,
    price: 45.99,
    originalPrice: 119.99,
    image: "",
    level: "Intermediate",
    duration: "15h 45m"
  },
];

const categories = ["Web Development", "AI & ML", "Data Science", "Mobile Dev", "Cloud", "Design", "DevOps"];

/**
 * Course Catalog Page.
 * Features a sidebar for filtering and a grid of course cards.
 */
export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const courses = useQuery(api.courses.list) || [];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Tech Courses</h1>
            <p className="text-muted-foreground">Master the latest skills with our curated collection of technical courses.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search for anything..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="hidden sm:flex items-center gap-2 p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-10 hidden lg:block">
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Categories</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => setSelectedCategory("All")}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    selectedCategory === "All" ? "bg-blue-800 text-white shadow-lg shadow-blue-800/20" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground",
                      selectedCategory === cat ? "bg-blue-800 text-white shadow-lg shadow-blue-800/20" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Price</h4>
              <div className="space-y-3">
                {["Free", "Paid"].map((price) => (
                  <label key={price} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-800" />
                    <span className="text-sm group-hover:text-cyan-500 transition-colors">{price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Level</h4>
              <div className="space-y-3">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-800" />
                    <span className="text-sm group-hover:text-cyan-500 transition-colors">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-900">
              <p className="text-sm font-medium">Showing <span className="font-bold text-blue-800">6</span> results</p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 group cursor-pointer text-sm font-medium">
                  Sort By: <span className="font-bold text-blue-800 flex items-center gap-1">Newest First <ChevronDown className="w-4 h-4" /></span>
                </div>
                <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                  <button className="p-1 px-2.5 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button className="p-1 px-2.5 text-muted-foreground hover:bg-white/50 transition-all rounded-md">
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard 
                  key={course._id} 
                  id={course._id}
                  title={course.title}
                  instructor={course.instructorId}
                  rating={course.rating}
                  price={course.price}
                  image={course.thumbnailUrl}
                  level={course.level}
                  duration={course.duration}
                  reviews={Math.floor(Math.random() * 2000)} // Keeping mock for reviews for now
                />
              ))}
            </div>

            {/* Pagination Placeholder */}
            <div className="mt-16 flex items-center justify-center gap-2">
              <button className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold bg-blue-800 text-white">1</button>
              <button className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold hover:bg-slate-50 transition-all">2</button>
              <button className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold hover:bg-slate-50 transition-all">3</button>
              <span className="px-2">...</span>
              <button className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold hover:bg-slate-50 transition-all">12</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
