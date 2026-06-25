import { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightElement?: ReactNode;
  className?: string;
}

export function Input({ icon, rightElement, className, ...props }: InputProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-white px-4 transition",
        "focus-within:border-primary-500 focus-within:ring-[3px] focus-within:ring-primary-500/15",
        className
      )}
    >
      {icon && (
        <span className="flex shrink-0 items-center text-slate-400 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      )}
      <input
        {...props}
        className="input-autofill-fix min-w-0 flex-1 bg-white py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
      {rightElement && (
        <span className="flex shrink-0 items-center text-slate-400">{rightElement}</span>
      )}
    </div>
  );
}
