import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import TrustBar from "@/components/TrustBar";
import ProductSection from "@/components/ProductSection";
import { ButtonLink } from "@/components/ui/Button";
import { homeSections, getProductsForSection } from "@/lib/products";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <TrustBar />

      <section className="mesh-bg py-16 text-center sm:py-20">
        <div className="container-app">
          <p className="section-eyebrow mb-3">Home Patient Care</p>
          <h2 className="section-title mx-auto max-w-2xl">
            Caring For Your Loved Ones Starts At Home
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            Everything you need for elderly care, patient recovery, hygiene and daily caregiving - delivered to your doorstep across India.
          </p>
        </div>
      </section>

      <div className="bg-white">
        {homeSections.map((section, i) => (
          <ProductSection
            key={section.title}
            title={section.title}
            eyebrow={i === 0 ? "Bestsellers" : section.category}
            products={getProductsForSection(section.category, section.filter)}
            viewAllHref={`/products?category=${encodeURIComponent(section.category)}`}
            showCardLogoBadge={
              "cardLogoBadge" in section ? Boolean(section.cardLogoBadge) : false
            }
          />
        ))}
      </div>

      <section className="gradient-cta relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        </div>
        <div className="container-app relative text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Premium Medical Supplies, Unbeatable Prices
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-100">
            For hospitals, clinics & home care. Sign up, order in minutes, and
            pay securely in rupees.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <ButtonLink
              href="/auth/signup"
              variant="secondary"
              size="lg"
              className="!bg-white !text-primary-800 !border-white hover:!bg-primary-50"
            >
              Create Free Account
            </ButtonLink>
            <ButtonLink href="/products" variant="outline-white" size="lg">
              Shop All Products
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
