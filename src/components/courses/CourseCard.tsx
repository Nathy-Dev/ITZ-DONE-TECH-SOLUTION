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
import { useSession } from "next-auth/react";

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
 * Clean white card with subtle border and hover elevation.
 */
const CourseCard = ({
  id, _id, title, instructor, rating, reviews = 0, price,
  originalPrice, level, duration, badge, image, thumbnailUrl
}: CourseCardProps) => {
  const courseId = (_id || id) as string;
  const displayInstructor = instructor || "ITS-DONE Instructor";
  const rawImage = thumbnailUrl || image;

  const { data: session } = useSession();
  const convexUser = useQuery(api.users.getUserByProviderId,
    session?.user?.id ? {
      providerId: session.user.id,
      email: session.user.email ?? undefined
    } : "skip"
  );
  // Cart is a learner feature — hidden for instructor accounts
  const isLearner = convexUser?.role !== "instructor";

  const { addItem, isInCart } = useCart();
  const inCart = isInCart(courseId);

  // rawImage is a stable display URL, a Convex storage ID (legacy), or a media asset ID.
  const isNonUrl = rawImage && !rawImage.startsWith("http") && !rawImage.startsWith("/");
  const displayImage = isNonUrl ? `/api/media/${rawImage}/thumbnail` : rawImage;

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
    <div className="group block bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-blue-400/50 hover:shadow-sm transition-all h-full flex flex-col relative">
      <Link href={`/courses/${courseId}`} className="flex-grow flex flex-col">
        {/* Course Image */}
        <div className="relative aspect-video overflow-hidden bg-slate-100">
          {displayImage ? (
             <Image
               src={displayImage}
               alt={title}
               fill
               unoptimized
               className="object-cover group-hover:scale-105 transition-transform duration-300"
             />
          ) : (
            <div className="absolute inset-0 bg-blue-50 flex items-center justify-center">
              <span className="text-base font-semibold text-blue-600/30 select-none">ITS-DONE</span>
            </div>
          )}

          {badge && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-white/95 backdrop-blur-sm rounded text-[9px] font-semibold uppercase tracking-wide text-blue-600 shadow-xs">
              {badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 flex flex-col flex-grow space-y-2">
          <h3 className="font-semibold text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 text-slate-900">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span className="truncate">{displayInstructor}</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 fill-current" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-900 ml-0.5">{rating.toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-slate-400">({reviews.toLocaleString()})</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart className="w-3 h-3 text-slate-400" aria-hidden="true" />
              <span>{level}</span>
            </div>
          </div>

          <div className="pt-2 mt-auto border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900">{formatPrice(price)}</span>
              {originalPrice && (
                <span className="text-xs text-slate-400 line-through">{formatPrice(originalPrice)}</span>
              )}
            </div>

            {isLearner && (
              <button
                onClick={handleAddToCart}
                disabled={inCart}
                aria-label={inCart ? "Already in cart" : `Add ${title} to cart`}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  inCart
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {inCart ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <ShoppingCart className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
