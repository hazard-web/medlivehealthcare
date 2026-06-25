"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { scrollToTop } from "@/lib/razorpay-scroll";

function ScrollToTopInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    scrollToTop();
  }, [pathname, searchParams]);

  return null;
}

export default function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollToTopInner />
    </Suspense>
  );
}
