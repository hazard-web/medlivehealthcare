import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/types";

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllHref: string;
  eyebrow?: string;
  showCardLogoBadge?: boolean;
}

export default function ProductSection({
  title,
  products,
  viewAllHref,
  eyebrow,
  showCardLogoBadge = false,
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="container-app">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            {eyebrow && <p className="section-eyebrow mb-2">{eyebrow}</p>}
            <h2 className="section-title">{title}</h2>
          </div>
          <Link
            href={viewAllHref}
            className="btn-secondary shrink-0 px-4 py-2 text-sm"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showCardLogoBadge={showCardLogoBadge}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
