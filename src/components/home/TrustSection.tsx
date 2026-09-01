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
    <section className="py-5 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-medium text-slate-400 uppercase tracking-[0.12em] mb-4">
          Trusted by engineers at world-class companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 opacity-50">
           {companies.map((company) => (
              <div key={company.name} className="flex items-center gap-1.5 cursor-default">
                 <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-semibold text-slate-500 text-xs">
                   {company.icon}
                 </div>
                 <span className="font-semibold text-sm text-slate-500">
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
