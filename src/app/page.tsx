import React from "react";
import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import TrustSection from "@/components/home/TrustSection";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import HowItWorks from "@/components/home/HowItWorks";
import { MoveRight, PlayCircle, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";

/**
 * Main ITZ-DONE TECH SOLUTION Landing Page.
 * Assembles various sections to create a high-converting experience.
 */
export default function Home() {
  return (
    <div className="w-full overflow-x-hidden pt-16">
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
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-800/5 blur-3xl rounded-full" />
              <div className="relative rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-2xl">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Practical Learning</h4>
                      <p className="text-muted-foreground">Every course includes hands-on projects and real-world scenarios to ensure you can apply what you learn.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Expert-Led Instruction</h4>
                      <p className="text-muted-foreground">Learn from professionals working at top tech companies like Google, Meta, and Netflix.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Collaborative Community</h4>
                      <p className="text-muted-foreground">Join a thriving community of learners. Get help, share insights, and network with peers worldwide.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Why thousands of students choose <span className="text-cyan-500">ITZ-DONE</span> every day.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We don't just provide content; we provide a career-focused learning ecosystem. Our platform is built by engineers, for engineers, with a focus on simplicity, quality, and results.
              </p>
              <div className="pt-4">
                <Link href="/register" className="px-10 py-4 bg-blue-800 text-white font-bold rounded-2xl hover:bg-blue-900 shadow-xl shadow-blue-800/20 transition-all active:scale-95 inline-block">
                  Join the Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats / Trust Section */}
      <section className="py-20 border-y border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-2 group">
              <h3 className="text-4xl font-extrabold text-blue-800 group-hover:scale-110 transition-transform">500+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Expert Courses</p>
            </div>
            <div className="text-center space-y-2 group">
              <h3 className="text-4xl font-extrabold text-blue-800 group-hover:scale-110 transition-transform">250k+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Active Students</p>
            </div>
            <div className="text-center space-y-2 group">
              <h3 className="text-4xl font-extrabold text-blue-800 group-hover:scale-110 transition-transform">120+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Elite Mentors</p>
            </div>
            <div className="text-center space-y-2 group">
              <h3 className="text-4xl font-extrabold text-blue-800 group-hover:scale-110 transition-transform">98%</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Join as Instructor */}
      <section className="py-24 pb-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="relative rounded-[3rem] bg-blue-800 overflow-hidden shadow-2xl shadow-blue-800/20">
            {/* Decorative circles */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-700/20 rounded-full blur-3xl rotate-12" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[80%] bg-white/5 rounded-full blur-3xl" />
            
            <div className="relative px-8 py-16 md:p-20 flex flex-col items-center text-center space-y-8 z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white max-w-2xl leading-tight">
                Ready to share your expertise? <br />
                <span className="text-cyan-200">Become an Instructor.</span>
              </h2>
              <p className="text-blue-100 text-lg max-w-xl">
                Join our elite community of tech mentors. Reach thousands of students worldwide and create an impact in their tech journeys.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Link 
                  href="/teach" 
                  className="px-10 py-5 bg-white text-blue-800 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 group"
                >
                  Start Teaching Today
                  <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/learn-more" 
                  className="px-10 py-5 bg-blue-700/50 backdrop-blur-md text-white font-bold rounded-2xl border border-blue-400/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
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
