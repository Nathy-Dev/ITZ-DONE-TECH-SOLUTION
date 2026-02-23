import React from "react";
import Link from "next/link";
import { Star, Clock, User, BarChart } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  image: string;
  level: string;
  duration: string;
  badge?: string;
}

/**
 * Reusable Course Card component.
 * Features:
 * - High-quality image container
 * - Modern typography
 * - Rating and reviews display
 * - Price formatting with discounts
 */
const CourseCard = ({ 
  id, title, instructor, rating, reviews, price, 
  originalPrice, level, duration, badge 
}: CourseCardProps) => {
  return (
    <Link href={`/courses/${id}`} className="group block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all h-full flex flex-col">
      {/* Course Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
        {/* Simplified color block instead of image since we don't have real images yet */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
          <span className="text-4xl font-bold text-indigo-600/10 dark:text-indigo-400/5 select-none">ITZ-DONE</span>
        </div>
        
        {badge && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow space-y-3">
        <h3 className="font-bold text-lg leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
          {title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>{instructor}</span>
        </div>

        <div className="flex items-center gap-1.5 py-1">
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-sm font-bold ml-1">{rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-muted-foreground">({reviews.toLocaleString()})</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart className="w-3.5 h-3.5" />
            <span>{level}</span>
          </div>
        </div>

        <div className="pt-3 mt-auto flex items-center gap-2">
          <span className="text-xl font-extrabold">${price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
