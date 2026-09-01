"use client";

import React from "react";
import Link from "next/link";
import { Youtube, Twitter, Linkedin, Github, Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

/**
 * Footer component for ITS-DONE TECH SOLUTION.
 * Minimalist light footer with compact spacing.
 */
const Footer = () => {
  const pathname = usePathname();

  // Hide Footer on lesson player routes and admin dashboard
  if (pathname?.includes("/lessons/") || pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 py-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center" aria-label="ITZ-DONE TECH home">
              <Logo width={120} height={32} />
            </Link>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
              Empowering the next generation of tech leaders through industry-leading courses and hands-on mentorship.
            </p>
            <div className="flex gap-1.5">
              <Link href="#" aria-label="Twitter" className="p-1.5 text-slate-400 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors">
                <Twitter className="w-3.5 h-3.5" />
              </Link>
              <Link href="#" aria-label="YouTube" className="p-1.5 text-slate-400 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors">
                <Youtube className="w-3.5 h-3.5" />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="p-1.5 text-slate-400 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors">
                <Linkedin className="w-3.5 h-3.5" />
              </Link>
              <Link href="#" aria-label="GitHub" className="p-1.5 text-slate-400 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors">
                <Github className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">Learning</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link href="/courses" className="hover:text-blue-600 transition-colors">Course Catalog</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Free Workshops</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Learning Paths</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Certifications</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">Expertise</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Web Development</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Data Science</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Cloud Computing</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">UI/UX Design</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">Contact Us</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>support@itzdone.tech</span>
              </li>
              <li>
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide mb-1">Newsletter</p>
                  <p className="text-xs text-slate-500 mb-2">Get weekly tech insights</p>
                  <div className="flex gap-1.5">
                    <input
                      type="email"
                      placeholder="Email"
                      aria-label="Email for newsletter"
                      className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs w-full outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button className="bg-blue-600 text-white rounded-md px-3 py-1 text-xs font-medium hover:bg-blue-700 transition-colors shrink-0">
                      Join
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ITS-DONE TECH SOLUTIONS. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-blue-600">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-600">Terms of Service</Link>
            <Link href="#" className="hover:text-blue-600">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
