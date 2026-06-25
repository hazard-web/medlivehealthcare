import { HeartPulse } from "lucide-react";
import { cn } from "@/lib/cn";

type WatermarkVariant = "card" | "detail" | "thumb";

const variantStyles: Record<
  WatermarkVariant,
  { box: string; icon: string; title: string; subtitle: string; wrap: string }
> = {
  card: {
    box: "h-6 w-6 rounded-md",
    icon: "h-3.5 w-3.5",
    title: "text-[8px]",
    subtitle: "text-[6.5px]",
    wrap: "gap-1 py-0.5 pl-0.5 pr-1.5 rounded-tl-lg",
  },
  detail: {
    box: "h-8 w-8 rounded-lg",
    icon: "h-4 w-4",
    title: "text-[10px]",
    subtitle: "text-[8px]",
    wrap: "gap-1.5 py-1 pl-1 pr-2 rounded-tl-xl",
  },
  thumb: {
    box: "h-4 w-4 rounded",
    icon: "h-2.5 w-2.5",
    title: "hidden",
    subtitle: "hidden",
    wrap: "p-0.5 rounded-tl-md",
  },
};

interface MedLiveWatermarkProps {
  variant?: WatermarkVariant;
  className?: string;
}

/** MedLive Healthcare™ image watermark. */
export default function MedLiveWatermark({
  variant = "card",
  className,
}: MedLiveWatermarkProps) {
  const s = variantStyles[variant];
  const iconOnly = variant === "thumb";

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-0 right-0 z-10 flex max-w-[calc(100%-4px)] items-center bg-white/95 shadow-sm",
        s.wrap,
        className
      )}
      aria-hidden
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700",
          s.box
        )}
      >
        <HeartPulse className={cn("text-white", s.icon)} strokeWidth={2.5} />
      </div>
      {!iconOnly && (
        <div className="min-w-0 leading-none">
          <span
            className={cn(
              "block truncate font-extrabold tracking-tight text-slate-900",
              s.title
            )}
          >
            Med<span className="text-primary-600">Live</span>
          </span>
          <span
            className={cn(
              "mt-px block truncate font-semibold uppercase tracking-wide text-primary-600",
              s.subtitle
            )}
          >
            Healthcare™
          </span>
        </div>
      )}
    </div>
  );
}
