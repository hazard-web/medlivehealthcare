"use client";

import { ShieldCheck, FileText } from "lucide-react";
import { getProductCompliance } from "@/lib/product-compliance";
import { formatPrice } from "@/lib/products";

interface ProductComplianceSectionProps {
  productId: string;
}

export default function ProductComplianceSection({ productId }: ProductComplianceSectionProps) {
  const compliance = getProductCompliance(productId);
  if (!compliance) return null;

  return (
    <section className="card mt-8 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-slate-900">Product & compliance</h2>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">HSN code</dt>
          <dd className="font-semibold text-slate-900">{compliance.hsn}</dd>
        </div>
        <div>
          <dt className="text-slate-500">MRP</dt>
          <dd className="font-semibold text-slate-900">{formatPrice(compliance.mrp)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">GST rate</dt>
          <dd className="font-semibold text-slate-900">{Math.round(compliance.gstRate * 100)}%</dd>
        </div>
        <div>
          <dt className="text-slate-500">Manufacturer</dt>
          <dd className="font-semibold text-slate-900">{compliance.manufacturer}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Country of origin</dt>
          <dd className="font-semibold text-slate-900">{compliance.countryOfOrigin}</dd>
        </div>
        {compliance.shelfLife && (
          <div>
            <dt className="text-slate-500">Shelf life</dt>
            <dd className="font-semibold text-slate-900">{compliance.shelfLife}</dd>
          </div>
        )}
        <div className="sm:col-span-2">
          <dt className="text-slate-500">Storage</dt>
          <dd className="font-semibold text-slate-900">{compliance.storage}</dd>
        </div>
      </dl>

      {compliance.certifications.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {compliance.certifications.map((cert) => (
            <span key={cert} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800 ring-1 ring-primary-100">
              {cert}
            </span>
          ))}
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <FileText className="mt-0.5 h-4 w-4 shrink-0" />
        {compliance.disclaimer}
      </p>
    </section>
  );
}
