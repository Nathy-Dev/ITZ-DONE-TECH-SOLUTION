import React from "react";
import { PlayCircle, Target, Award, Infinity } from "lucide-react";

const steps = [
  {
    title: "Choose Your Path",
    description: "Browse curated paths across high-growth domains like AI, Cloud, and Web Development.",
    icon: Target,
    color: "text-indigo-600",
    bg: "bg-indigo-600/10"
  },
  {
    title: "Learn by Doing",
    description: "Watch high-quality video lessons and work on real-world projects with expert guidance.",
    icon: PlayCircle,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10"
  },
  {
    title: "Get Certified",
    description: "Earn industry-recognized certificates of completion to boost your career prospects.",
    icon: Award,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Lifetime Access",
    description: "Once you enroll, the content is yours forever. Learn at your own pace, anytime.",
    icon: Infinity,
    color: "text-rose-500",
    bg: "bg-rose-500/10"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">The <span className="text-indigo-600">ITZ-DONE</span> Way</h2>
          <p className="text-lg text-muted-foreground">Our methodology is designed for maximum retention and job-readiness. Here's how it works.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
           {steps.map((step, idx) => (
             <div key={idx} className="relative space-y-6 group">
                {/* Connector line for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(2rem+24px)] w-[calc(100%-48px)] h-px bg-slate-100 dark:bg-slate-800 -z-10" />
                )}
                
                <div className={`w-16 h-16 ${step.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
