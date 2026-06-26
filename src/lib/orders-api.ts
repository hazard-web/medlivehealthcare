import { Order } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { serverOrderToClient } from "@/lib/server/order-adapter";
import { StoredOrder } from "@/lib/server/store";

export async function fetchOrdersFromApi(): Promise<Order[]> {
  try {
    const res = await apiFetch("/api/orders");
    if (!res.ok) return [];
    const data = await res.json();
    return (data.orders as StoredOrder[]).map(serverOrderToClient);
  } catch {
    return [];
  }
}

export async function fetchOrderByIdFromApi(orderId: string): Promise<Order | null> {
  try {
    const res = await apiFetch(`/api/orders/${orderId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return serverOrderToClient(data.order as StoredOrder);
  } catch {
    return null;
  }
}

export async function submitReturnToApi(
  orderId: string,
  payload: { productIds: string[]; reason: string; comments?: string }
): Promise<{ success: boolean; error?: string; order?: Order }> {
  const res = await apiFetch(`/api/orders/${orderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error };
  return { success: true, order: serverOrderToClient(data.order as StoredOrder) };
}
