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
    <section className="py-8 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6 space-y-1.5">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">The ITS-DONE Way</h2>
          <p className="text-xs sm:text-sm text-slate-500">Our methodology is designed for maximum retention and job-readiness.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {steps.map((step, idx) => (
             <div key={idx} className="p-4 bg-white border border-slate-200 rounded-lg space-y-3 group hover:border-blue-400/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <step.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-300">0{idx + 1}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
