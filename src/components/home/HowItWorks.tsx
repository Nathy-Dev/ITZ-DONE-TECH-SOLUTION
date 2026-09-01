import React from "react";
import { PlayCircle, Target, Award, Infinity } from "lucide-react";

const steps = [
  {
    title: "Choose Your Path",
    description: "Browse curated paths across high-growth domains like AI, Cloud, and Web Development.",
    icon: Target,
  },
  {
    title: "Learn by Doing",
    description: "Watch high-quality video lessons and work on real-world projects with expert guidance.",
    icon: PlayCircle,
  },
  {
    title: "Get Certified",
    description: "Earn industry-recognized certificates of completion to boost your career prospects.",
    icon: Award,
  },
  {
    title: "Lifetime Access",
    description: "Once you enroll, the content is yours forever. Learn at your own pace, anytime.",
    icon: Infinity,
  }
];

const HowItWorks = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">The ITS-DONE Way</h2>
          <p className="text-slate-500">Our methodology is designed for maximum retention and job-readiness. Here&apos;s how it works.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {steps.map((step, idx) => (
             <div key={idx} className="space-y-4 group">
                {/* Connector line for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute" aria-hidden="true" />
                )}

                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <step.icon className="w-5 h-5 text-blue-600" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
