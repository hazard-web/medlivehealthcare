"use client";

import { useEffect, useState } from "react";
import { Home, MapPin, Briefcase, User, Loader2 } from "lucide-react";
import { User as UserType } from "@/lib/types";
import { PincodeCheckResult } from "@/lib/pincode";
import PincodeChecker from "@/components/PincodeChecker";
import {
  emptyShippingForm,
  formToSavedAddress,
  legacyAddressFromForm,
  normalizeSavedAddresses,
  savedAddressToForm,
  ShippingFormData,
} from "@/lib/addresses";
import { INDIAN_STATES } from "@/lib/india-states";
import { cn } from "@/lib/cn";

interface ShippingAddressFormProps {
  user: UserType;
  pincode: string;
  onPincodeChange: (value: string) => void;
  onPincodeCheck: () => PincodeCheckResult;
  pincodeResult: PincodeCheckResult | null;
  onSubmit: (
    form: ShippingFormData,
    options: { saveToAccount: boolean; makeDefault: boolean; addressId?: string }
  ) => void;
  error?: string | null;
  isGuest?: boolean;
  isSubmitting?: boolean;
}

const LABEL_OPTIONS = [
  { value: "Home" as const, icon: Home },
  { value: "Work" as const, icon: Briefcase },
];

export default function ShippingAddressForm({
  user,
  pincode,
  onPincodeChange,
  onPincodeCheck,
  pincodeResult,
  onSubmit,
  error,
  isGuest = false,
  isSubmitting = false,
}: ShippingAddressFormProps) {
  const savedAddresses = normalizeSavedAddresses(user.savedAddresses);
  const defaultSaved = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];

  const [selectedId, setSelectedId] = useState<string | "new">(
    defaultSaved?.id ?? "new"
  );
  const [form, setForm] = useState<ShippingFormData>(() =>
    defaultSaved
      ? savedAddressToForm(defaultSaved)
      : emptyShippingForm({
          fullName: user.name,
          phone: user.phone ?? "",
          city: user.city ?? "",
          pincode: user.zip ?? pincode,
          street: user.address ?? "",
        })
  );
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [makeDefault, setMakeDefault] = useState(savedAddresses.length === 0);

  useEffect(() => {
    if (!pincodeResult?.serviceable) return;
    setForm((prev) => ({
      ...prev,
      city: pincodeResult.city ?? prev.city,
      state: pincodeResult.state ?? prev.state,
      pincode,
    }));
  }, [pincodeResult, pincode, pincodeResult?.city, pincodeResult?.state, pincodeResult?.serviceable]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, pincode }));
  }, [pincode]);

  const update = (patch: Partial<ShippingFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const selectSaved = (id: string) => {
    setSelectedId(id);
    const found = savedAddresses.find((a) => a.id === id);
    if (found) {
      setForm(savedAddressToForm(found));
      onPincodeChange(found.pincode);
    }
  };

  const selectNew = () => {
    setSelectedId("new");
    setForm(
      emptyShippingForm({
        fullName: user.name,
        phone: user.phone ?? "",
        pincode,
      })
    );
    setSaveToAccount(true);
    setMakeDefault(savedAddresses.length === 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form, {
      saveToAccount,
      makeDefault,
      addressId: selectedId === "new" ? undefined : selectedId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <div className="mb-6 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-slate-900">Shipping Address</h2>
      </div>

      {!isGuest && (
        <div className="mb-5 rounded-xl bg-surface-muted p-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-900">{user.name}</span>
            {user.email && (
              <>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{user.email}</span>
              </>
            )}
          </div>
        </div>
      )}

      {!isGuest && savedAddresses.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-sm font-semibold text-slate-800">Saved addresses</p>
          <div className="space-y-2">
            {savedAddresses.map((address) => (
              <label
                key={address.id}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border p-3 transition",
                  selectedId === address.id
                    ? "border-primary-600 bg-primary-50 ring-1 ring-primary-100"
                    : "border-border hover:border-primary-200"
                )}
              >
                <input
                  type="radio"
                  name="saved-address"
                  checked={selectedId === address.id}
                  onChange={() => selectSaved(address.id)}
                  className="mt-1 shrink-0"
                />
                <span className="min-w-0 text-sm">
                  <span className="font-semibold text-slate-900">
                    {address.label}
                    {address.isDefault ? " · Default" : ""}
                  </span>
                  <span className="mt-0.5 block text-slate-600">
                    {address.fullName} · {address.phone}
                  </span>
                  <span className="mt-0.5 block text-slate-500">
                    {address.flatHouse}, {address.area}, {address.city} — {address.pincode}
                  </span>
                </span>
              </label>
            ))}
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-medium transition",
                selectedId === "new"
                  ? "border-primary-600 bg-primary-50 text-primary-800 ring-1 ring-primary-100"
                  : "border-border text-slate-700 hover:border-primary-200"
              )}
            >
              <input
                type="radio"
                name="saved-address"
                checked={selectedId === "new"}
                onChange={selectNew}
                className="shrink-0"
              />
              Add a new address
            </label>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => update({ fullName: e.target.value })}
              placeholder="Name on the package"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Mobile number
            </label>
            <input
              type="tel"
              required
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              value={form.phone}
              onChange={(e) =>
                update({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
              }
              placeholder="10-digit mobile"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <PincodeChecker
            value={pincode}
            onChange={(value) => {
              onPincodeChange(value);
              update({ pincode: value });
            }}
            onCheck={onPincodeCheck}
            resultMessage={pincodeResult?.message ?? null}
            serviceable={pincodeResult?.serviceable ?? null}
            city={pincodeResult?.city ?? null}
            district={pincodeResult?.district ?? null}
            state={pincodeResult?.state ?? null}
            eta={pincodeResult?.eta}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Flat, House no., Building, Company
          </label>
          <input
            type="text"
            required
            value={form.flatHouse}
            onChange={(e) => update({ flatHouse: e.target.value })}
            placeholder="e.g. Flat 402, Tower B"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Apartment, suite, unit (optional)
          </label>
          <input
            type="text"
            value={form.building}
            onChange={(e) => update({ building: e.target.value })}
            placeholder="Building or society name"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Street address
          </label>
          <input
            type="text"
            required
            value={form.street}
            onChange={(e) => update({ street: e.target.value })}
            placeholder="Street, road name"
            className="input-field"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Area, Colony, Sector
            </label>
            <input
              type="text"
              required
              value={form.area}
              onChange={(e) => update({ area: e.target.value })}
              placeholder="Locality / neighbourhood"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Landmark (optional)
            </label>
            <input
              type="text"
              value={form.landmark}
              onChange={(e) => update({ landmark: e.target.value })}
              placeholder="Near metro, hospital, etc."
              className="input-field"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Town / City
            </label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => update({ city: e.target.value })}
              placeholder="City"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              State
            </label>
            <select
              required
              value={form.state}
              onChange={(e) => update({ state: e.target.value })}
              className="input-field"
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Address type</p>
          <div className="flex flex-wrap gap-2">
            {LABEL_OPTIONS.map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ label: value })}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition",
                  form.label === value
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-border bg-white text-slate-700 hover:border-primary-200"
                )}
              >
                <Icon className="h-4 w-4" />
                {value}
              </button>
            ))}
          </div>
        </div>

        {!isGuest && (
        <div className="space-y-2 rounded-xl border border-border bg-surface-muted/60 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={saveToAccount}
              onChange={(e) => setSaveToAccount(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
            />
            <span className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Save address to my account</span>
              <span className="mt-0.5 block text-slate-500">
                Use this address faster on your next order
              </span>
            </span>
          </label>
          {saveToAccount && (
            <label className="flex cursor-pointer items-center gap-3 pl-7">
              <input
                type="checkbox"
                checked={makeDefault}
                onChange={(e) => setMakeDefault(e.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-border"
              />
              <span className="text-sm text-slate-700">Make this my default address</span>
            </label>
          )}
        </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary mt-6 w-full py-3.5 text-sm disabled:opacity-70"
      >
        {isSubmitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Continuing…
          </span>
        ) : (
          "Continue to Payment"
        )}
      </button>
    </form>
  );
}
