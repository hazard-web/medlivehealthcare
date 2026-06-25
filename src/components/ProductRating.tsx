import { Star } from "lucide-react";
import { buildRatingBreakdown } from "@/lib/rating-breakdown";
import { cn } from "@/lib/cn";

interface ProductRatingProps {
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

export default function ProductRating({ rating, reviews, className }: ProductRatingProps) {
  const breakdown = buildRatingBreakdown(rating, reviews);
  const displayRating = breakdown.average.toFixed(1);
  const reviewLabel = reviews === 1 ? "rating" : "ratings";

  return (
    <div className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-1", className)}>
      <div
        className="flex items-center gap-0.5"
        aria-label={`${displayRating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const state = starState(i, breakdown.average);
          return (
            <span key={i} className="relative inline-flex h-5 w-5 shrink-0">
              <Star className="h-5 w-5 text-slate-200" aria-hidden />
              {state !== "empty" && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: state === "half" ? "50%" : "100%" }}
                >
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden />
                </span>
              )}
            </span>
          );
        })}
      </div>

      <a href="#reviews" className="text-sm font-medium text-primary-700 hover:text-primary-800 hover:underline">
        {displayRating} out of 5
      </a>

      <span className="text-sm text-slate-300" aria-hidden>
        |
      </span>

      <a href="#reviews" className="text-sm font-medium text-primary-700 hover:text-primary-800 hover:underline">
        {reviews.toLocaleString("en-IN")} {reviewLabel}
      </a>
    </div>
  );
}
