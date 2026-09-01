"use client";

import React, { useState } from "react";
import { Search, Filter, ChevronDown, LayoutGrid, List } from "lucide-react";
import CourseCard from "@/components/courses/CourseCard";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

import { useDebounce } from "use-debounce";

// Mock data removed

const categories = ["Web Development", "AI & ML", "Data Science", "Mobile Dev", "Cloud", "Design", "DevOps"];

/**
 * Course Catalog Page.
 * Features a sidebar for filtering and a grid of course cards.
 */
export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Filters
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string[]>([]);

  // Use search if search query exists, otherwise use listFiltered
  const isSearching = debouncedSearchQuery.length > 0;
  
  const searchResults = useQuery(api.courses.search, isSearching ? {
    searchQuery: debouncedSearchQuery,
    category: selectedCategory === "All" ? undefined : selectedCategory,
    level: selectedLevels.length === 1 ? selectedLevels[0] : undefined,
    isFree: selectedPrice.length === 1 ? selectedPrice[0] === "Free" : undefined,
  } : "skip");

  const filteredCourses = useQuery(api.courses.listFiltered, !isSearching ? {
    category: selectedCategory === "All" ? undefined : selectedCategory,
    level: selectedLevels.length === 1 ? selectedLevels[0] : undefined,
    isFree: selectedPrice.length === 1 ? selectedPrice[0] === "Free" : undefined,
  } : "skip");

  const courses = isSearching ? (searchResults || []) : (filteredCourses || []);

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const togglePrice = (price: string) => {
    setSelectedPrice(prev => 
      prev.includes(price) ? prev.filter(p => p !== price) : [...prev, price]
    );
  };

  return (
    <div className="pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-1">Tech Courses</h1>
            <p className="text-xs sm:text-sm text-slate-500">Master the latest skills with our curated collection of technical courses.</p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="hidden sm:flex items-center gap-1.5 p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-all text-slate-600">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-56 shrink-0 space-y-4 hidden lg:block">
            <div className="space-y-2.5">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-400">Categories</h4>
              <div className="space-y-1">
                <button 
                  onClick={() => setSelectedCategory("All")}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    selectedCategory === "All" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      selectedCategory === cat ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-400">Price</h4>
              <div className="space-y-2">
                {["Free", "Paid"].map((price) => (
                  <label key={price} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      checked={selectedPrice.includes(price)}
                      onChange={() => togglePrice(price)}
                    />
                    <span className="text-xs text-slate-700 group-hover:text-blue-600 transition-colors">{price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-400">Level</h4>
              <div className="space-y-2">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      checked={selectedLevels.includes(level)}
                      onChange={() => toggleLevel(level)}
                    />
                    <span className="text-xs text-slate-700 group-hover:text-blue-600 transition-colors">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
              <p className="text-xs font-medium text-slate-600">Showing <span className="font-bold text-blue-600">{courses.length}</span> results</p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 group cursor-pointer text-xs font-medium text-slate-600">
                  Sort By: <span className="font-bold text-blue-600 flex items-center gap-0.5">Newest First <ChevronDown className="w-3.5 h-3.5" /></span>
                </div>
                <div className="hidden sm:flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md">
                  <button className="p-1 px-2 bg-white rounded shadow-xs text-slate-800">
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 px-2 text-slate-400 hover:text-slate-700 transition-all rounded">
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course: any) => (
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
                />
              ))}
            </div>

            {/* Pagination Placeholder */}
            <div className="mt-8 flex items-center justify-center gap-1.5">
              <button className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center text-xs font-bold bg-blue-600 text-white">1</button>
              <button className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all">2</button>
              <button className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all">3</button>
              <span className="px-1 text-xs text-slate-400">...</span>
              <button className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all">12</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
