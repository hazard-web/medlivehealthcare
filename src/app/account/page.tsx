"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatSavedAddress, normalizeSavedAddresses } from "@/lib/addresses";
import { fetchOrdersFromApi } from "@/lib/orders-api";
import OrderHistoryCard from "@/components/OrderHistoryCard";
import { StoredOrder } from "@/lib/orders";

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin?redirect=/account");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchOrdersFromApi().then((apiOrders) => {
      setOrders(apiOrders as StoredOrder[]);
    });
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const savedAddresses = normalizeSavedAddresses(user.savedAddresses);

  return (
    <div className="container-app py-10 sm:py-12">
      <h1 className="section-title mb-8">My Account</h1>

      <div className="mb-8 card p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Profile</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-slate-400" />
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-900">{user.name}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-slate-400" />
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{user.email}</dd>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-400" />
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-medium text-slate-900">{user.phone}</dd>
            </div>
          )}
        </dl>
      </div>

      {savedAddresses.length > 0 ? (
        <div className="mb-8 card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <MapPin className="h-5 w-5 text-primary-600" />
            Saved addresses
          </h2>
          <ul className="space-y-3">
            {savedAddresses.map((address) => (
              <li
                key={address.id}
                className="rounded-xl border border-border bg-surface-muted/50 p-4 text-sm"
              >
                <p className="font-semibold text-slate-900">
                  {address.label}
                  {address.isDefault ? (
                    <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-800">
                      Default
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-slate-700">
                  {address.fullName} · {address.phone}
                </p>
                <p className="mt-1 text-slate-600">{formatSavedAddress(address)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : user.address ? (
        <div className="mb-8 card p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Address</h2>
          <p className="text-sm text-slate-700">
            {user.address}, {user.city} {user.zip}
          </p>
        </div>
      ) : null}

      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Package className="h-5 w-5 text-primary-600" />
          Order History
        </h2>

        {orders.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-slate-500">No orders yet.</p>
            <Link
              href="/products"
              className="mt-4 inline-block text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Start shopping →
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <OrderHistoryCard key={order.id} order={order} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
