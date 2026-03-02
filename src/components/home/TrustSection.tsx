import React from "react";

const companies = [
  { name: "Google", icon: "G" },
  { name: "Microsoft", icon: "M" },
  { name: "Amazon", icon: "A" },
  { name: "Meta", icon: "M" },
  { name: "Netflix", icon: "N" },
  { name: "Apple", icon: "A" },
];

const TrustSection = () => {
  return (
    <section className="py-12 bg-white dark:bg-slate-950/50 border-y border-slate-100 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <p className="text-center text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-10">
          Trusted by engineers at world-class companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           {companies.map((company) => (
             <div key={company.name} className="flex items-center gap-2 group cursor-default">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {company.icon}
                </div>
                <span className="font-bold text-lg text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {company.name}
                </span>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
