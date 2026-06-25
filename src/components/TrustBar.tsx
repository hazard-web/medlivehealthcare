import { MapPin, Truck, Shield, IndianRupee } from "lucide-react";

const items = [
  { icon: MapPin, title: "Pan India", subtitle: "Delivery Available" },
  { icon: Truck, title: "Free Shipping", subtitle: "Anywhere in India" },
  { icon: Shield, title: "Quality Products", subtitle: "Trusted Wellness" },
  { icon: IndianRupee, title: "Best Prices", subtitle: "Value That Cares" },
];

export default function TrustBar() {
  return (
    <section className="border-b border-border bg-white">
      <div className="container-app">
        <div className="grid grid-cols-2 divide-x divide-border md:grid-cols-4">
          {items.map(({ icon: Icon, title, subtitle }) => (
            <div
              key={title}
              className="group flex items-center gap-3 px-4 py-5 transition hover:bg-surface-muted sm:gap-4 sm:px-6 sm:py-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 ring-1 ring-primary-100 transition group-hover:bg-primary-100">
                <Icon className="h-5 w-5 text-primary-700" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
