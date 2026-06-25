import { checkPincode } from "@/lib/pincode";
import { StoredShipment } from "./server/store";

const COURIERS = ["Delhivery", "Blue Dart", "DTDC"] as const;

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function pickCourier(pincode: string): string {
  const prefix = pincode.slice(0, 2);
  const metro = ["11", "12", "20", "22", "40", "41", "50", "56", "60", "70", "80"];
  if (metro.includes(prefix)) return "Blue Dart";
  if (["30", "31", "32", "33", "34"].includes(prefix)) return "Delhivery";
  return COURIERS[Math.abs(pincode.charCodeAt(0) - 48) % COURIERS.length];
}

export function createShipment(
  orderNumber: string,
  pincode: string,
  city: string
): StoredShipment {
  const courier = pickCourier(pincode);
  const awb = `${courier.slice(0, 2).toUpperCase()}${orderNumber.replace(/\D/g, "")}${pincode.slice(-3)}`;
  const etaDays = pincode.startsWith("11") || pincode.startsWith("40") ? 2 : 4;

  const now = new Date().toISOString();
  return {
    awb,
    courier,
    trackingUrl: `https://track.medlivehealthcare.in/${awb}`,
    estimatedDelivery: addDays(etaDays),
    status: "label_created",
    events: [
      {
        at: now,
        status: "Shipping label created",
        location: "MedLive Warehouse, Mumbai",
      },
      {
        at: addDays(0),
        status: "Handed to courier",
        location: `MedLive Hub — ${city}`,
      },
    ],
  };
}

export function advanceShipmentStatus(shipment: StoredShipment, orderAgeDays: number): StoredShipment {
  const copy = { ...shipment, events: [...shipment.events] };
  if (orderAgeDays >= 1 && copy.status === "label_created") {
    copy.status = "picked_up";
    copy.events.push({
      at: addDays(1),
      status: "Picked up by courier",
      location: "Mumbai Sorting Center",
    });
  }
  if (orderAgeDays >= 2 && copy.status === "picked_up") {
    copy.status = "in_transit";
    copy.events.push({
      at: addDays(2),
      status: "In transit",
      location: "Regional hub",
    });
  }
  if (orderAgeDays >= 3 && copy.status === "in_transit") {
    copy.status = "out_for_delivery";
    copy.events.push({
      at: addDays(3),
      status: "Out for delivery",
      location: "Local delivery center",
    });
  }
  if (orderAgeDays >= 4 && copy.status === "out_for_delivery") {
    copy.status = "delivered";
    copy.events.push({
      at: addDays(4),
      status: "Delivered",
      location: "Customer address",
    });
  }
  return copy;
}

export interface PincodeServiceability {
  serviceable: boolean;
  city?: string;
  state?: string;
  etaDays: number;
  codAvailable: boolean;
  courier: string;
}

export function checkLogisticsPincode(pincode: string): PincodeServiceability {
  const result = checkPincode(pincode);
  const courier = pickCourier(pincode);
  const etaDays = result.region === "metro" ? 2 : result.region === "tier1" ? 3 : 5;

  return {
    serviceable: result.serviceable,
    city: result.city,
    state: result.state,
    etaDays,
    codAvailable: result.serviceable,
    courier,
  };
}
