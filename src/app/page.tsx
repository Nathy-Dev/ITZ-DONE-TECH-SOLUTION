import React from "react";
import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import { MoveRight, PlayCircle, Users } from "lucide-react";
import Link from "next/link";

/**
 * Main ITZ-DONE TECH SOLUTION Landing Page.
 * Assembles various sections to create a high-converting experience.
 */
export default function Home() {
  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <Hero />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Quick Stats / Trust Section */}
      <section className="py-20 border-y border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <h3 className="text-4xl font-extrabold text-indigo-600">500+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Expert Courses</p>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-4xl font-extrabold text-indigo-600">250k+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Active Students</p>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-4xl font-extrabold text-indigo-600">120+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Elite Mentors</p>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-4xl font-extrabold text-indigo-600">98%</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Join as Instructor */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="relative rounded-[3rem] bg-indigo-600 overflow-hidden shadow-2xl shadow-indigo-600/20">
            {/* Decorative circles */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-indigo-500/20 rounded-full blur-3xl rotate-12" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[80%] bg-white/5 rounded-full blur-3xl" />
            
            <div className="relative px-8 py-16 md:p-20 flex flex-col items-center text-center space-y-8 z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white max-w-2xl">
                Become an Instructor and Share Your Expertise
              </h2>
              <p className="text-indigo-100 text-lg max-w-xl">
                Join our elite community of tech mentors. Reach thousands of students worldwide and create an impact in their tech journeys.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/teach" 
                  className="px-10 py-4 bg-white text-indigo-600 font-bold rounded-2xl border border-white hover:bg-slate-50 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                >
                  Start Teaching Today
                  <MoveRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/learn-more" 
                  className="px-10 py-4 bg-indigo-700/50 backdrop-blur-md text-white font-bold rounded-2xl border border-indigo-400/30 hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  Watch How it Works
                  <PlayCircle className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
