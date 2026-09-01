"use client";

import React, { useState } from "react";
import { Users, CheckCircle2, ArrowRight, Target, Flame, Compass, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import MentorCard from "@/components/mentorship/MentorCard";

export default function MentorshipPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const mentors = useQuery(api.mentors.listMentors);
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
    <div className="min-h-screen bg-slate-50 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 leading-tight text-slate-900">
            Accelerate your career with <span className="text-blue-600">1-on-1 Mentorship</span>
          </h1>
          <p className="text-slate-500 mb-5 text-sm leading-relaxed">
            Connect directly with senior engineers and industry leaders to guide your technical journey and career growth.
          </p>

          {/* Mentors or Waitlist */}
          {mentors && mentors.length > 0 ? (
            <div className="mt-10 text-left">
              <div className="flex items-center justify-between mb-5">
                <div>
                   <h2 className="text-xl font-bold text-slate-900 mb-1">Available Mentors</h2>
                   <p className="text-slate-500 text-xs">Book a session with one of our top industry experts.</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   {mentors.length} Online
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentors.map((mentor) => (
                  <MentorCard 
                    key={mentor._id}
                    name={mentor.user.name || "Anonymous"}
                    image={mentor.user.profileImage}
                    bio={mentor.bio}
                    expertise={mentor.expertise}
                    hourlyRate={mentor.hourlyRate}
                    rating={mentor.rating}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Waitlist Form */
            <div className="max-w-sm mx-auto bg-white rounded-lg p-2 border border-slate-200 shadow-xs relative">
              {isSuccess ? (
                <div className="p-6 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">You&apos;re on the list!</h3>
                  <p className="text-xs text-slate-500">We&apos;ll be in touch soon when spots open up.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3">
                  <div className="text-left mb-1">
                    <h3 className="font-semibold text-sm text-slate-900">Join the Mentorship Waitlist</h3>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">Spots are extremely limited</p>
                  </div>
                  
                  <input
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-colors"
                  />
                  
                  {error && <p className="text-xs text-red-500 px-1 text-left">{error}</p>}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Reserve My Spot
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
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
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-sm hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 bg-slate-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
