"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Star, MessageSquare, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface CourseReviewsProps {
  courseId: Id<"courses">;
  isEnrolled: boolean;
}

export default function CourseReviews({ courseId, isEnrolled }: CourseReviewsProps) {
  const reviews = useQuery(api.reviews.getReviewsByCourse, { courseId });
  const addReview = useMutation(api.reviews.addReview);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addReview({
        courseId,
        rating,
        comment,
      });
      setComment("");
      setShowForm(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (reviews === undefined) return null;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <Star className="w-8 h-8 text-amber-400 fill-current" />
          Student Reviews ({reviews.length})
        </h2>
        
        {isEnrolled && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-800 text-white rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-800/20"
          >
            Leave a Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[32px] border border-blue-800/20 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transform transition-transform hover:scale-110"
                  >
                    <Star 
                      className={cn(
                        "w-8 h-8 transition-colors",
                        star <= rating ? "text-amber-400 fill-current" : "text-slate-300 dark:text-slate-700"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Feedback</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think of the course?"
                className="w-full h-32 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-800/20 resize-none font-medium"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-blue-800 text-white rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-800/20"
              >
                {isSubmitting ? "Posting..." : <><Send className="w-4 h-4" /> Post Review</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div 
              key={review._id} 
              className="p-8 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm shadow-slate-200/50 dark:shadow-none hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    {review.user.profileImage ? (
                      <img src={review.user.profileImage} alt={review.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold">{review.user.name}</h4>
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={cn(
                        "w-4 h-4",
                        star <= review.rating ? "text-amber-400 fill-current" : "text-slate-200 dark:text-slate-700"
                      )} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
                &quot;{review.comment}&quot;
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
