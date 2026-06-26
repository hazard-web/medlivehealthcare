"use client";

import { useEffect } from "react";
import { isChunkLoadError, reloadOnceOnChunkError } from "@/lib/chunk-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (isChunkLoadError(error)) {
      reloadOnceOnChunkError();
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-semibold text-slate-900">This page couldn&apos;t load</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Reload to try again, or go back to continue shopping.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => window.location.reload()} className="btn-primary px-5 py-2.5">
          Reload
        </button>
        <button type="button" onClick={() => reset()} className="btn-secondary px-5 py-2.5">
          Try again
        </button>
        <a href="/" className="btn-secondary px-5 py-2.5">
          Back to home
        </a>
      </div>
    </div>
  );
}
