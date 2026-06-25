"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  HeartPulse,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import AnnouncementBar from "./AnnouncementBar";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact Us" },
];

function isNavLinkActive(pathname: string, searchParams: URLSearchParams, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  const [path, queryString] = href.split("?");
  if (pathname !== path) {
    return false;
  }

  if (!queryString) {
    // For plain routes like /about, /contact — match the pathname only.
    // For /products, ensure no filters are applied so only one tab is active.
    if (path === "/products") {
      return !searchParams.get("category") && !searchParams.get("q");
    }
    return true;
  }

  const linkParams = new URLSearchParams(queryString);
  const linkCategory = linkParams.get("category");
  const currentCategory = searchParams.get("category");

  return linkCategory === currentCategory;
}

export default function Header() {
  const { user, signOut, isLoading } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuthPlaceholder = !mounted || isLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <AnnouncementBar />

      <div className="container-app flex items-center gap-4 py-3.5 lg:py-4">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-[var(--shadow-primary)] transition group-hover:scale-105">
            <HeartPulse className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Med<span className="text-primary-600">Live</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
              Healthcare
            </span>
          </div>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 md:flex md:justify-center">
          <div className="flex w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface-muted shadow-xs transition has-[input:focus-visible]:border-primary-500">
            <div className="flex flex-1 items-center gap-2 px-4">
              <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Products"
                aria-label="Search products"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 focus-visible:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-r-xl bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
            >
              Search
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-surface-subtle"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            {mounted && totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {showAuthPlaceholder ? (
            <div
              aria-hidden
              className="hidden h-10 w-[140px] rounded-xl bg-slate-100 sm:block"
            />
          ) : user ? (
            <>
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-surface-subtle sm:flex"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={signOut}
                className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 sm:flex"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="btn-primary hidden px-5 py-2.5 text-sm sm:inline-flex"
            >
              Login / Signup
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-surface-subtle md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-border md:block">
        <div className="container-app flex gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-lg px-4 py-3.5 text-sm font-medium transition",
                isNavLinkActive(pathname, searchParams, link.href)
                  ? "text-primary-700 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:rounded-full after:bg-primary-600"
                  : "text-slate-600 hover:text-primary-700"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-white px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4 flex overflow-hidden rounded-xl border border-border has-[input:focus-visible]:border-primary-500">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Products"
              aria-label="Search products"
              className="flex-1 bg-transparent px-4 py-3 text-sm outline-none focus-visible:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="bg-primary-600 px-4 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium transition",
                  isNavLinkActive(pathname, searchParams, link.href)
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                )}
              >
                {link.label}
              </Link>
            ))}
            {!showAuthPlaceholder && !user && (
              <Link
                href="/auth/signup"
                onClick={() => setMobileOpen(false)}
                className="btn-primary mt-2 py-3 text-center text-sm"
              >
                Create Account
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
