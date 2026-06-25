"use client";

import { Star } from "lucide-react";
import { buildRatingBreakdown } from "@/lib/rating-breakdown";
import { cn } from "@/lib/cn";

interface ProductReviewsBreakdownProps {
  rating: number;
  reviews: number;
  className?: string;
}

function starState(index: number, rating: number): "full" | "half" | "empty" {
  const value = rating - index;
  if (value >= 1) return "full";
  if (value >= 0.5) return "half";
  return "empty";
}

function StarDisplay({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const sizeClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const state = starState(i, value);
        return (
          <span key={i} className={cn("relative inline-flex shrink-0", sizeClass)}>
            <Star className={cn(sizeClass, "text-slate-200")} />
            {state !== "empty" && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: state === "half" ? "50%" : "100%" }}
              >
                <Star className={cn(sizeClass, "fill-amber-400 text-amber-400")} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function ProductReviewsBreakdown({
  rating,
  reviews,
  className,
}: ProductReviewsBreakdownProps) {
  const breakdown = buildRatingBreakdown(rating, reviews);
  const displayRating = breakdown.average.toFixed(1);
  const reviewLabel = reviews === 1 ? "rating" : "ratings";

  return (
    <section
      id="reviews"
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-white shadow-xs ring-1 ring-primary-100/60",
        className
      )}
      aria-label="Customer reviews"
    >
      <div className="border-b border-primary-100/80 bg-gradient-to-r from-primary-50/90 via-white to-white px-3.5 py-2">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-800">
          Customer reviews
        </h2>
      </div>

      <div className="p-3.5">
        <div className="flex items-center gap-4">
          <div className="shrink-0 border-r border-border pr-4 text-center sm:text-left">
            <div className="flex items-baseline justify-center gap-0.5 sm:justify-start">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {displayRating}
              </span>
              <span className="text-xs font-medium text-slate-400">/ 5</span>
            </div>
            <StarDisplay
              value={breakdown.average}
              size="md"
              className="mt-1.5 justify-center sm:justify-start"
            />
            <p className="mt-1.5 text-xs font-semibold text-primary-700">
              {reviews.toLocaleString("en-IN")} global {reviewLabel}
            </p>
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            {breakdown.rows.map(({ star, count }) => {
              const barPercent = reviews > 0 ? (count / reviews) * 100 : 0;
              const displayPercent = Math.round(barPercent);

              return (
                <div
                  key={star}
                  className="group grid grid-cols-[2.25rem_1fr_2rem] items-center gap-2"
                >
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-primary-700 transition group-hover:text-primary-800">
                    {star}
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        count > 0
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                          : "bg-transparent"
                      )}
                      style={{ width: `${count > 0 ? Math.max(barPercent, 3) : 0}%` }}
                    />
                  </div>
                  <span
                    className="text-right text-[11px] font-medium text-slate-500"
                    title={`${count.toLocaleString("en-IN")} ratings`}
                  >
                    {displayPercent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
