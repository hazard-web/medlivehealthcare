import Link from "next/link";
import { Hand, Baby, Droplets } from "lucide-react";

const quickCategories = [
  { label: "Gloves", href: "/products?category=Gloves", icon: Hand },
  { label: "Adult Diapers", href: "/products?category=Adult%20Diapers", icon: Baby },
  { label: "Hygiene", href: "/products?category=Hygiene", icon: Droplets },
];

export default function CategoryQuickLinks() {
  return (
    <section className="border-b border-border bg-surface-muted py-8">
      <div className="container-app">
        <p className="section-eyebrow mb-4 text-center">Shop by Category</p>
        <div className="flex flex-wrap justify-center gap-3">
          {quickCategories.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="card card-hover flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-slate-700 hover:text-primary-700"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                <Icon className="h-4 w-4 text-primary-600" />
              </span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
