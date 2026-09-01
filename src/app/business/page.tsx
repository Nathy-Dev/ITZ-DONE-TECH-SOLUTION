"use client";

import React, { useState } from "react";
import { Briefcase, CheckCircle2, ArrowRight, Building2, Users, Shield, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function BusinessPage() {
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
      await joinWaitlist({ email, type: "business" });
      setIsSuccess(true);
      setEmail("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-5 h-5" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 leading-tight text-slate-900">
            Upskill your entire <span className="text-blue-600">engineering team</span>
          </h1>
          <p className="text-slate-500 mb-5 text-sm leading-relaxed">
            Get unlimited access to our premium course library, custom learning paths, and dedicated analytics for your organization.
          </p>

          {/* Waitlist Form */}
          <div className="max-w-sm mx-auto bg-slate-50 rounded-lg p-2 border border-slate-200 shadow-xs relative">
            {isSuccess ? (
              <div className="p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">You&apos;re on the list!</h3>
                <p className="text-xs text-slate-500">We&apos;ll be in touch soon with priority access.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3">
                <div className="text-left mb-1">
                  <h3 className="font-semibold text-sm text-slate-900">Join the Business Waitlist</h3>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">Early access opening soon</p>
                </div>
                
                <input
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-colors"
                />
                
                {error && <p className="text-xs text-red-500 px-1 text-left">{error}</p>}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-70 group"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Get Priority Access
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mt-16">
          {[
            {
              icon: Building2,
              title: "Enterprise Library",
              desc: "Full access to our entire catalog of highly-rated technical courses."
            },
            {
              icon: Users,
              title: "Team Analytics",
              desc: "Track progress, completion rates, and skill development across your org."
            },
            {
              icon: Shield,
              title: "SSO & Security",
              desc: "Enterprise-grade security with SAML SSO integration and admin controls."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-slate-50 p-5 rounded-lg border border-slate-200 hover:border-blue-200 hover:shadow-xs transition-all duration-200">
              <div className="w-9 h-9 bg-white text-blue-600 rounded-lg flex items-center justify-center mb-3 shadow-xs border border-slate-100">
                <feature.icon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{feature.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
