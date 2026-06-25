import { SavedAddress } from "@/lib/types";

export type AddressLabel = SavedAddress["label"];

export interface ShippingFormData {
  label: AddressLabel;
  fullName: string;
  phone: string;
  flatHouse: string;
  building: string;
  street: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

export function emptyShippingForm(
  defaults?: Partial<ShippingFormData>
): ShippingFormData {
  return {
    label: "Home",
    fullName: defaults?.fullName ?? "",
    phone: defaults?.phone ?? "",
    flatHouse: defaults?.flatHouse ?? "",
    building: defaults?.building ?? "",
    street: defaults?.street ?? "",
    area: defaults?.area ?? "",
    landmark: defaults?.landmark ?? "",
    city: defaults?.city ?? "",
    state: defaults?.state ?? "",
    pincode: defaults?.pincode ?? "",
  };
}

export function savedAddressToForm(address: SavedAddress): ShippingFormData {
  return {
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    flatHouse: address.flatHouse,
    building: address.building ?? "",
    street: address.street,
    area: address.area,
    landmark: address.landmark ?? "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  };
}

export function formToSavedAddress(
  form: ShippingFormData,
  options?: { id?: string; isDefault?: boolean }
): SavedAddress {
  return {
    id: options?.id ?? crypto.randomUUID(),
    label: form.label,
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    flatHouse: form.flatHouse.trim(),
    building: form.building.trim() || undefined,
    street: form.street.trim(),
    area: form.area.trim(),
    landmark: form.landmark.trim() || undefined,
    city: form.city.trim(),
    state: form.state,
    pincode: form.pincode.trim(),
    isDefault: options?.isDefault ?? false,
  };
}

export function formatSavedAddress(address: SavedAddress): string {
  const parts = [
    address.flatHouse,
    address.building,
    address.street,
    address.area,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean);
  return parts.join(", ");
}

export function legacyAddressFromForm(form: ShippingFormData): {
  address: string;
  city: string;
  zip: string;
  phone: string;
} {
  const line = [form.flatHouse, form.building, form.street, form.area]
    .filter(Boolean)
    .join(", ");
  return {
    address: form.landmark ? `${line}, ${form.landmark}` : line,
    city: form.city,
    zip: form.pincode,
    phone: form.phone,
  };
}
