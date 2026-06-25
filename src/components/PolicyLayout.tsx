import Link from "next/link";

interface PolicyLayoutProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export default function PolicyLayout({ title, updated, children }: PolicyLayoutProps) {
  return (
    <div className="container-app py-12 sm:py-16">
      <p className="section-eyebrow mb-2">Legal</p>
      <h1 className="section-title">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>
      <div className="prose-policy mt-8 max-w-3xl space-y-4 text-sm leading-relaxed text-slate-700">
        {children}
      </div>
      <Link href="/" className="mt-10 inline-block text-sm font-semibold text-primary-600">
        ← Back to home
      </Link>
    </div>
  );
}
