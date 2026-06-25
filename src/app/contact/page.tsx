import { Mail, MapPin, Navigation, Phone } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function ContactPage() {
  const address = "42, Healthcare Park, Andheri East, Mumbai, Maharashtra 400069";
  const googleMapsDirections = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    address
  )}`;
  const googleMapsSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
  const googleMapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
    address
  )}&output=embed`;

  return (
    <div className="mesh-bg min-h-[70vh]">
      <div className="container-app py-12 sm:py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="section-title">Contact Us</h1>
          <a
            href={googleMapsSearch}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary inline-flex px-4 py-2.5 text-sm"
          >
            Open in Maps
          </a>
        </div>

        <div className="card overflow-hidden">
          <div className="relative aspect-[16/6] min-h-[240px] w-full bg-surface-muted">
            <iframe
              title="MedLive Healthcare location"
              src={googleMapsEmbed}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="grid gap-6 border-t border-border p-6 sm:p-8 lg:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Address
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{address}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Email
              </p>
              <a
                href="mailto:support@medlivehealthcare.in"
                className="mt-2 inline-block text-sm font-semibold text-primary-700 hover:text-primary-800"
              >
                support@medlivehealthcare.in
              </a>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a
                href={googleMapsDirections}
                target="_blank"
                rel="noreferrer"
                className="btn-primary inline-flex px-5 py-2.5 text-sm"
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-base font-extrabold tracking-tight text-slate-900">
            GET IN TOUCH
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Your email address will not be published
          </p>

          <form
            className="card mt-5 p-6 sm:p-8"
            action="#"
          >
            <div className="grid gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <Input placeholder="Full Name" />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <Input type="email" placeholder="Email" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="Phone" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Message <span className="text-red-500">*</span>
                </label>
                <div className="rounded-xl border border-border bg-white px-4 transition focus-within:border-primary-500 focus-within:ring-[3px] focus-within:ring-primary-500/15">
                  <textarea
                    placeholder="Message"
                    rows={5}
                    className="w-full resize-none bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3 text-sm">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

