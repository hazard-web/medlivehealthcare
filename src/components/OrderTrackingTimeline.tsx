import { CheckCircle2, Circle, Truck } from "lucide-react";
import { buildTrackingSteps, StoredOrder } from "@/lib/orders";

interface OrderTrackingTimelineProps {
  order: StoredOrder;
}

export default function OrderTrackingTimeline({ order }: OrderTrackingTimelineProps) {
  const steps = buildTrackingSteps(order);

  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <div key={step.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step.done
                  ? "bg-primary-600 text-white"
                  : step.current
                    ? "bg-primary-100 text-primary-700 ring-2 ring-primary-500"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {step.done ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : step.current ? (
                <Truck className="h-4 w-4" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`my-1 w-0.5 flex-1 min-h-[28px] ${
                  step.done ? "bg-primary-300" : "bg-slate-200"
                }`}
              />
            )}
          </div>

          <div className={`pb-6 ${step.current ? "" : ""}`}>
            <p
              className={`text-sm font-semibold ${
                step.done || step.current ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {step.label}
            </p>
            <p className="text-sm text-slate-500">{step.detail}</p>
            {step.at && step.done && (
              <p className="mt-0.5 text-xs text-slate-400">
                {new Date(step.at).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
