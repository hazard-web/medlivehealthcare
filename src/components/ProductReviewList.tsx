"use client";

import { BadgeCheck, Star } from "lucide-react";
import { ProductReview } from "@/lib/product-reviews";
import { cn } from "@/lib/cn";

interface ProductReviewListProps {
  reviews: ProductReview[];
  className?: string;
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
          )}
        />
      ))}
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProductReviewList({ reviews, className }: ProductReviewListProps) {
  if (reviews.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold text-slate-900">Top reviews from India</h3>

      {reviews.map((review) => (
        <article
          key={review.id}
          className="rounded-xl border border-border bg-white p-3.5 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-800"
              aria-hidden
            >
              {initials(review.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                <span className="text-xs text-slate-400">{review.city}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <ReviewStars rating={review.rating} />
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-700">
                  <BadgeCheck className="h-3 w-3" />
                  Verified purchase
                </span>
              </div>
            </div>
          </div>

          <p className="mt-2.5 text-sm font-semibold text-slate-800">{review.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{review.body}</p>
          <p className="mt-2 text-xs text-slate-400">Reviewed in India on {review.date}</p>
        </article>
      ))}
    </div>
  );
}
