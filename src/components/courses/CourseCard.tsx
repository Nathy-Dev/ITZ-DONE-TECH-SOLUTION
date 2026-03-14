"use client";

import React from "react";
import Link from "next/link";
import { Star, Clock, User, BarChart, ShoppingCart, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";

interface CourseCardProps {
  id?: string;
  _id?: string;
  title: string;
  instructor?: string;
  instructorId?: string;
  rating: number;
  reviews?: number;
  price: number;
  originalPrice?: number;
  image?: string;
  thumbnailUrl?: string;
  level: string;
  duration: string;
  badge?: string;
}

/**
 * Reusable Course Card component.
 */
const CourseCard = ({ 
  id, _id, title, instructor, rating, reviews = 0, price, 
  originalPrice, level, duration, badge, image, thumbnailUrl 
}: CourseCardProps) => {
  const courseId = (_id || id) as string;
  const displayInstructor = instructor || "ITS-DONE Instructor";
  const rawImage = thumbnailUrl || image;
  
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(courseId);
  
  // Check if rawImage is a external URL or a Convex storage ID
  const isStorageId = rawImage && !rawImage.startsWith("http") && !rawImage.startsWith("/");
  
  const resolvedUrl = useQuery(api.files.getImageUrl, 
    isStorageId ? { storageId: rawImage as string } : "skip"
  );

  const displayImage = isStorageId ? resolvedUrl : rawImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addItem({
        id: courseId,
        title,
        price,
        image: displayImage || undefined,
        instructor: displayInstructor
      });
    }
  };

  return (
    <div className="group block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all h-full flex flex-col relative">
      <Link href={`/courses/${courseId}`} className="flex-grow flex flex-col">
        {/* Course Image */}
        <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
          {displayImage ? (
             <Image 
               src={displayImage} 
               alt={title} 
               fill
               className="object-cover group-hover:scale-110 transition-transform duration-500" 
             />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 to-cyan-500/20 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
              <span className="text-4xl font-bold text-blue-800/10 dark:text-blue-400/5 select-none">ITS-DONE</span>
            </div>
          )}
          
          {badge && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-blue-800 shadow-sm">
              {badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow space-y-3">
          <h3 className="font-bold text-lg leading-tight group-hover:text-blue-800 transition-colors line-clamp-2">
            {title}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{displayInstructor}</span>
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

          <div className="pt-3 mt-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold">{formatPrice(price)}</span>
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
              )}
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={inCart}
              className={cn(
                "p-2.5 rounded-xl transition-all active:scale-95 shadow-lg",
                inCart 
                  ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                  : "bg-blue-800 text-white hover:bg-blue-900 shadow-blue-800/20"
              )}
            >
              {inCart ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
