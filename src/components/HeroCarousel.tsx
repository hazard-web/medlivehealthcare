"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const slides = [
  {
    title: "PROTECTED HANDS.",
    highlight: "BETTER CARE.",
    subtitle: "Premium nitrile & latex gloves for home care, clinics & hospitals.",
    cta: "Shop Gloves",
    href: "/products?category=Gloves",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&h=500&fit=crop",
    badge: "Up to 87% OFF",
  },
  {
    title: "CARING FOR YOUR",
    highlight: "LOVED ONES",
    subtitle: "Adult care pants, hygiene wipes & recovery essentials — delivered to your doorstep.",
    cta: "Shop Home Care",
    href: "/products?category=Adult%20Diapers",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=500&fit=crop",
    badge: "Pan-India Delivery",
  },
  {
    title: "PREMIUM GLOVES,",
    highlight: "UNBEATABLE PRICES",
    subtitle: "For hospitals, clinics & labs. Bulk pricing available on 100+ boxes.",
    cta: "View All Products",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&h=500&fit=crop",
    badge: "From ₹135/box",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden bg-slate-900">
      <div className="container-app !px-0 sm:!px-6 lg:!px-8">
        <div className="relative overflow-hidden rounded-none sm:rounded-2xl sm:shadow-lg">
          <div className="relative aspect-[21/9] min-h-[300px] w-full sm:min-h-[380px]">
            <Image
              key={slide.image}
              src={slide.image}
              alt=""
              fill
              className="object-cover transition-opacity duration-700"
              priority
              sizes="100vw"
            />
            <div className="gradient-hero-overlay absolute inset-0" />

            <div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-16">
              <div className="max-w-xl animate-fade-in">
                <span className="badge-sale mb-4 inline-flex rounded-full px-3 py-1 text-xs">
                  {slide.badge}
                </span>
                <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {slide.title}
                  <br />
                  <span className="bg-gradient-to-r from-primary-200 to-emerald-300 bg-clip-text text-transparent">
                    {slide.highlight}
                  </span>
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.href}
                  scroll
                  className="btn-primary mt-7 inline-flex px-7 py-3.5 text-sm"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>

            <button
              onClick={prev}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:left-5"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:right-5"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === current ? "w-8 bg-primary-400" : "w-2 bg-white/40 hover:bg-white/60"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
