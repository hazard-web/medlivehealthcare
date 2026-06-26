"use client";

export default function OrderPlacedAnimation() {
  return (
    <div className="order-success-tick mx-auto mb-6 flex h-24 w-24 items-center justify-center">
      <svg viewBox="0 0 72 72" className="h-24 w-24" aria-hidden>
        <circle
          className="order-success-circle"
          cx="36"
          cy="36"
          r="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="order-success-check"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M22 37.5 31.5 47 50 27.5"
        />
      </svg>
    </div>
  );
}
