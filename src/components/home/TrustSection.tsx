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
    <section className="py-8 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium text-slate-400 uppercase tracking-[0.15em] mb-6">
          Trusted by engineers at world-class companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 opacity-50">
           {companies.map((company) => (
              <div key={company.name} className="flex items-center gap-2 cursor-default">
                 <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center font-semibold text-slate-400 text-sm">
                   {company.icon}
                 </div>
                 <span className="font-semibold text-base text-slate-400">
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
