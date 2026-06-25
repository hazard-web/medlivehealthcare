/** Razorpay checkout locks body scroll — restore normal scrolling after close. */
export function unlockPageScroll() {
  if (typeof document === "undefined") return;

  const body = document.body;
  const html = document.documentElement;

  body.style.overflow = "";
  body.style.paddingRight = "";
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";

  html.style.overflow = "";
  html.style.paddingRight = "";
}

export function scrollToTop() {
  if (typeof window === "undefined") return;
  unlockPageScroll();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}
