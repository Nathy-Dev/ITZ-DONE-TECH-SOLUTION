"use client";

import React, { useState } from "react";
import { Users, CheckCircle2, ArrowRight, Target, Flame, Compass, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function MentorshipPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const joinWaitlist = useMutation(api.waitlist.joinWaitlist);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError("");

    try {
      await joinWaitlist({ email, type: "mentorship" });
      setIsSuccess(true);
      setEmail("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-cyan-900/10">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Accelerate your career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">1-on-1 Mentorship</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 font-medium leading-relaxed">
            Connect directly with senior engineers and industry leaders to guide your technical journey and career growth.
          </p>

          {/* Waitlist Form */}
          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-[2rem] p-2 border border-slate-100 dark:border-slate-800 shadow-2xl relative">
            {isSuccess ? (
              <div className="p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black mb-2">You&apos;re on the list!</h3>
                <p className="text-sm font-medium text-slate-500">We&apos;ll be in touch soon when spots open up.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
                <div className="text-left mb-2">
                  <h3 className="font-black">Join the Mentorship Waitlist</h3>
                  <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Spots are extremely limited</p>
                </div>
                
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none transition-colors"
                />
                
                {error && <p className="text-xs font-bold text-red-500 px-2 text-left">{error}</p>}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Reserve My Spot
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          {[
            {
              icon: Target,
              title: "Personalized Goals",
              desc: "Work with your mentor to define exact technical milestones and career objectives."
            },
            {
              icon: Compass,
              title: "Career Guidance",
              desc: "Get insights on interview preparation, resume reviews, and salary negotiation."
            },
            {
              icon: Flame,
              title: "Code Reviews",
              desc: "Receive deeply technical feedback on your personal projects or open source contributions."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black mb-3">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
