"use client";

import React from "react";
import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import TrustSection from "@/components/home/TrustSection";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import HowItWorks from "@/components/home/HowItWorks";
import { MoveRight, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Main ITS-DONE TECH SOLUTION Landing Page.
 * Assembles various sections to create a clean, high-converting experience.
 */
export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const stats = useQuery(api.analytics.getPlatformStats);

  // Redirect authenticated users to the dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Show loading while checking auth status
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading"></div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden pt-14">
      {/* Hero Section */}
      <Hero />

      {/* Social Proof / Trusted By */}
      <TrustSection />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Core Methodology / How It Works */}
      <HowItWorks />

      {/* Popular Courses Grid */}
      <FeaturedCourses />

      {/* Benefits / Why Us Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1 rounded-xl border border-slate-200 p-5 md:p-6 bg-slate-50/50">
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-0.5">Practical Learning</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Every course includes hands-on projects and real-world scenarios to ensure you can apply what you learn.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-0.5">Expert-Led Instruction</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Learn from professionals working at top tech companies like Google, Meta, and Netflix.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-0.5">Collaborative Community</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Join a thriving community of learners. Get help, share insights, and network with peers worldwide.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-slate-900">
                Why thousands of students choose <span className="text-blue-600">ITS-DONE</span> every day.
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                We provide more than content — a career-focused learning ecosystem. Our platform is built by engineers, for engineers, with a focus on simplicity, quality, and results.
              </p>
              <div className="pt-1">
                <Link href="/register" className="px-5 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-block shadow-sm shadow-blue-600/20">
                  Join the Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats / Trust Section */}
      <section className="py-7 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-bold text-blue-600">
                {stats ? `${stats.totalCourses}+` : "..."}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Expert Courses</p>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-bold text-blue-600">
                {stats ? `${stats.totalStudents.toLocaleString()}+` : "..."}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Active Students</p>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-bold text-blue-600">
                {stats ? `${stats.totalMentors}+` : "..."}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Elite Mentors</p>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-bold text-blue-600">
                {stats ? `${stats.satisfactionRate}%` : "..."}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Join as Instructor */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden shadow-sm">
            <div className="relative px-5 py-8 md:p-10 flex flex-col items-center text-center space-y-4 z-10">
              <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white max-w-2xl leading-tight tracking-tight">
                Ready to share your expertise? <br />
                <span className="text-blue-100">Become an Instructor.</span>
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm max-w-lg">
                Join our community of tech mentors. Reach thousands of students worldwide and create an impact in their tech journeys.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Link
                  href="/teach"
                  className="px-5 py-2.5 bg-white text-blue-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5 group"
                >
                  Start Teaching Today
                  <MoveRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/learn-more"
                  className="px-5 py-2.5 bg-blue-700/60 text-white text-xs sm:text-sm font-medium rounded-lg border border-blue-400/30 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  Watch How it Works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
