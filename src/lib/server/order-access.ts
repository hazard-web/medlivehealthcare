import { StoredOrder, StoredUser } from "./store";

export function canAccessOrder(
  sessionUser: StoredUser | null,
  order: StoredOrder
): boolean {
  if (!sessionUser?.id || !order.userId) return false;
  return order.userId === sessionUser.id;
}
