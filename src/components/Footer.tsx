import Link from "next/link";
import { HeartPulse, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="container-app py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">MedLive</span>
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Healthcare
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Your trusted destination for home patient care essentials and medical devices across India.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="transition hover:text-primary-400">All Products</Link></li>
              <li><Link href="/products?category=Gloves" className="transition hover:text-primary-400">Gloves</Link></li>
              <li><Link href="/products?category=Adult%20Diapers" className="transition hover:text-primary-400">Adult Diapers</Link></li>
              <li><Link href="/products?category=Hygiene" className="transition hover:text-primary-400">Hygiene</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
              Account
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/auth/signin" className="transition hover:text-primary-400">Login / Signup</Link></li>
              <li><Link href="/account" className="transition hover:text-primary-400">My Account</Link></li>
              <li><Link href="/cart" className="transition hover:text-primary-400">My Cart</Link></li>
              <li><Link href="/checkout" className="transition hover:text-primary-400">Checkout</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-primary-500" />
                +91 1800-633-5483
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-primary-500" />
                support@medlivehealthcare.in
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                <span>
                  42, Healthcare Park, Andheri East
                  <br />
                  Mumbai, Maharashtra 400069
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} MedLive Healthcare Pvt. Ltd. All rights reserved.</p>
          <p>Free shipping anywhere in India</p>
        </div>
      </div>
    </footer>
  );
}
