import React from "react";
import Link from "next/link";
import { Youtube, Twitter, Linkedin, Github, Mail } from "lucide-react";

/**
 * Footer component for ITZ-DONE TECH SOLUTION.
 * Organized into logical sections with a modern tech-focused aesthetic.
 */
const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                ITZ
              </div>
              <span className="font-bold text-xl tracking-tight">
                ITZ-DONE <span className="text-blue-800">TECH</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering the next generation of tech leaders through industry-leading courses and hands-on mentorship.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm hover:text-cyan-500 transition-all">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm hover:text-cyan-500 transition-all">
                <Youtube className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm hover:text-cyan-500 transition-all">
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm hover:text-cyan-500 transition-all">
                <Github className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6">Learning</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/courses" className="hover:text-cyan-500 transition-colors">Course Catalog</Link></li>
              <li><Link href="#" className="hover:text-cyan-500 transition-colors">Free Workshops</Link></li>
              <li><Link href="#" className="hover:text-cyan-500 transition-colors">Learning Paths</Link></li>
              <li><Link href="#" className="hover:text-cyan-500 transition-colors">Certifications</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-bold mb-6">Expertise</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-cyan-500 transition-colors">Web Development</Link></li>
              <li><Link href="#" className="hover:text-cyan-500 transition-colors">Data Science</Link></li>
              <li><Link href="#" className="hover:text-cyan-500 transition-colors">Cloud Computing</Link></li>
              <li><Link href="#" className="hover:text-cyan-500 transition-colors">UI/UX Design</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>support@itzdone.tech</span>
              </li>
              <li>
                <div className="mt-6 p-4 bg-blue-800/5 rounded-2xl border border-blue-800/10">
                  <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">Newsletter</p>
                  <p className="text-xs mb-3">Get weekly tech insights</p>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs w-full outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                    <button className="bg-blue-800 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-blue-900 transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ITZ-DONE TECH SOLUTIONS. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-cyan-500">Privacy Policy</Link>
            <Link href="#" className="hover:text-cyan-500">Terms of Service</Link>
            <Link href="#" className="hover:text-cyan-500">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
