"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useRef,
} from "react";
import { CartItem, Product } from "@/lib/types";
import { AppliedPromo, validatePromoCode } from "@/lib/promo";
import { checkPincode, PincodeCheckResult } from "@/lib/pincode";
import { calculateOrderTotals, OrderTotals } from "@/lib/orderTotals";
import { getCartLineId } from "@/lib/cart-line";
import { resolveCartLineUnitPrice } from "@/lib/cart-pricing";
import { useAuth } from "./AuthContext";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variantKey?: string) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  removeItems: (lineIds: string[]) => void;
  totalItems: number;
  subtotal: number;
  appliedPromo: AppliedPromo | null;
  promoDiscount: number;
  applyPromo: (code: string) => Promise<{ success: boolean; error?: string }>;
  removePromo: () => void;
  pincode: string;
  setPincode: (pincode: string) => void;
  pincodeResult: PincodeCheckResult | null;
  checkDeliveryPincode: (pincode?: string) => PincodeCheckResult;
  totals: OrderTotals;
  /** True after auth and this user's cart have been loaded from storage. */
  isReady: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const GUEST_SCOPE = "guest";
const LEGACY_CART_KEY = "medlive_cart";
const LEGACY_PROMO_KEY = "medlive_promo";
const LEGACY_PINCODE_KEY = "medlive_pincode";

type CartKind = "cart" | "promo" | "pincode";

function storageKey(scope: string, kind: CartKind): string {
  return `medlive_${kind}__${scope}`;
}

function migrateCartItem(raw: CartItem): CartItem {
  const lineId = raw.lineId ?? getCartLineId(raw.product.id, raw.variantKey);
  const unitPrice = resolveCartLineUnitPrice(
    raw.product.id,
    raw.variantKey,
    raw.quantity,
    raw.product.price
  );
  return {
    ...raw,
    lineId,
    product: { ...raw.product, price: unitPrice },
  };
}

function parseStoredCart(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const items: CartItem[] = [];
    for (const entry of parsed) {
      try {
        if (!entry || typeof entry !== "object") continue;
        const item = entry as CartItem;
        if (!item.product?.id || typeof item.quantity !== "number" || item.quantity < 1) {
          continue;
        }
        items.push(migrateCartItem(item));
      } catch {
        /* skip corrupt line */
      }
    }
    return items;
  } catch {
    return [];
  }
}

function readLegacyCart(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LEGACY_CART_KEY);
}

function migrateLegacyKeys(scope: string): void {
  if (typeof window === "undefined") return;
  const pairs: [CartKind, string][] = [
    ["cart", LEGACY_CART_KEY],
    ["promo", LEGACY_PROMO_KEY],
    ["pincode", LEGACY_PINCODE_KEY],
  ];
  for (const [kind, legacyKey] of pairs) {
    const legacy = localStorage.getItem(legacyKey);
    if (!legacy) continue;
    const scoped = storageKey(scope, kind);
    if (!localStorage.getItem(scoped)) {
      localStorage.setItem(scoped, legacy);
    }
    localStorage.removeItem(legacyKey);
  }
}

function loadCartForScope(scope: string): CartItem[] {
  if (typeof window === "undefined") return [];
  migrateLegacyKeys(scope);
  const raw = localStorage.getItem(storageKey(scope, "cart")) ?? readLegacyCart();
  return raw ? parseStoredCart(raw) : [];
}

function loadPromoForScope(scope: string): AppliedPromo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(scope, "promo"));
    return raw ? (JSON.parse(raw) as AppliedPromo) : null;
  } catch {
    return null;
  }
}

function loadPincodeForScope(scope: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(storageKey(scope, "pincode")) ?? "";
}

function persistScope(
  scope: string,
  items: CartItem[],
  promo: AppliedPromo | null,
  pincode: string
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(scope, "cart"), JSON.stringify(items));
  if (promo) {
    localStorage.setItem(storageKey(scope, "promo"), JSON.stringify(promo));
  } else {
    localStorage.removeItem(storageKey(scope, "promo"));
  }
  if (pincode) {
    localStorage.setItem(storageKey(scope, "pincode"), pincode);
  } else {
    localStorage.removeItem(storageKey(scope, "pincode"));
  }
}

function clearScopeStorage(scope: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(scope, "cart"));
  localStorage.removeItem(storageKey(scope, "promo"));
  localStorage.removeItem(storageKey(scope, "pincode"));
}

function mergeGuestIntoAccount(account: CartItem[], guest: CartItem[]): CartItem[] {
  const byLine = new Map<string, CartItem>();
  for (const item of account) {
    byLine.set(item.lineId, { ...item, fromGuestSession: false });
  }
  for (const item of guest) {
    const existing = byLine.get(item.lineId);
    if (existing) {
      byLine.set(item.lineId, {
        ...existing,
        quantity: existing.quantity + item.quantity,
        fromGuestSession: true,
      });
    } else {
      byLine.set(item.lineId, { ...item, fromGuestSession: true });
    }
  }
  return Array.from(byLine.values());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const scope = user?.id ?? GUEST_SCOPE;

  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [pincode, setPincodeState] = useState("");
  const [pincodeResult, setPincodeResult] = useState<PincodeCheckResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const prevScopeRef = useRef<string | null>(null);
  const itemsRef = useRef(items);
  const promoRef = useRef(appliedPromo);
  const pincodeRef = useRef(pincode);

  itemsRef.current = items;
  promoRef.current = appliedPromo;
  pincodeRef.current = pincode;

  useEffect(() => {
    if (authLoading) return;

    const prevScope = prevScopeRef.current;

    if (prevScope === null) {
      const loadedItems = loadCartForScope(scope);
      const loadedPromo = loadPromoForScope(scope);
      const loadedPincode = loadPincodeForScope(scope);
      setItems(loadedItems);
      setAppliedPromo(loadedPromo);
      setPincodeState(loadedPincode);
      setPincodeResult(loadedPincode ? checkPincode(loadedPincode) : null);
      prevScopeRef.current = scope;
      setHydrated(true);
      return;
    }

    if (prevScope === scope) return;

    persistScope(prevScope, itemsRef.current, promoRef.current, pincodeRef.current);

    let nextItems = loadCartForScope(scope);
    let nextPromo = loadPromoForScope(scope);
    const nextPincode = loadPincodeForScope(scope);

    if (prevScope === GUEST_SCOPE && scope !== GUEST_SCOPE) {
      nextItems = mergeGuestIntoAccount(nextItems, itemsRef.current);
      if (!nextPromo && promoRef.current) {
        nextPromo = promoRef.current;
      }
      clearScopeStorage(GUEST_SCOPE);
    }

    const resolvedPincode =
      nextPincode || (prevScope === GUEST_SCOPE ? pincodeRef.current : "");

    setItems(nextItems);
    setAppliedPromo(nextPromo);
    setPincodeState(resolvedPincode);
    setPincodeResult(resolvedPincode ? checkPincode(resolvedPincode) : null);
    prevScopeRef.current = scope;
  }, [authLoading, scope]);

  useEffect(() => {
    if (!hydrated || authLoading) return;
    localStorage.setItem(storageKey(scope, "cart"), JSON.stringify(items));
  }, [items, hydrated, scope, authLoading]);

  useEffect(() => {
    if (!hydrated || authLoading) return;
    if (appliedPromo) {
      localStorage.setItem(storageKey(scope, "promo"), JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem(storageKey(scope, "promo"));
    }
  }, [appliedPromo, hydrated, scope, authLoading]);

  useEffect(() => {
    if (!hydrated || authLoading) return;
    if (pincode) {
      localStorage.setItem(storageKey(scope, "pincode"), pincode);
    } else {
      localStorage.removeItem(storageKey(scope, "pincode"));
    }
  }, [pincode, hydrated, scope, authLoading]);

  const subtotal = items.reduce(
    (sum, i) =>
      sum +
      resolveCartLineUnitPrice(i.product.id, i.variantKey, i.quantity, i.product.price) *
        i.quantity,
    0
  );

  useEffect(() => {
    if (!appliedPromo) return;
    const result = validatePromoCode(appliedPromo.code, subtotal);
    if (!result.success) {
      setAppliedPromo(null);
    } else if (result.promo.discount !== appliedPromo.discount) {
      setAppliedPromo(result.promo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const promoDiscount = appliedPromo?.discount ?? 0;
  const totals = useMemo(
    () => calculateOrderTotals(subtotal, promoDiscount),
    [subtotal, promoDiscount]
  );

  const addItem = useCallback((product: Product, quantity = 1, variantKey?: string) => {
    const lineId = getCartLineId(product.id, variantKey);
    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        return prev.map((i) =>
          i.lineId === lineId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { lineId, product, quantity, variantKey }];
    });
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.lineId === lineId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedPromo(null);
  }, []);

  const removeItems = useCallback((lineIds: string[]) => {
    const ids = new Set(lineIds);
    setItems((prev) => prev.filter((i) => !ids.has(i.lineId)));
  }, []);

  const applyPromo = useCallback(
    async (code: string) => {
      await new Promise((r) => setTimeout(r, 300));
      const result = validatePromoCode(code, subtotal);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      setAppliedPromo(result.promo);
      return { success: true };
    },
    [subtotal]
  );

  const removePromo = useCallback(() => setAppliedPromo(null), []);

  const setPincode = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setPincodeState(cleaned);
    if (cleaned.length !== 6) {
      setPincodeResult(null);
    }
  }, []);

  const checkDeliveryPincode = useCallback(
    (value?: string) => {
      const code = (value ?? pincode).trim();
      const result = checkPincode(code);
      setPincodeState(code.replace(/\D/g, "").slice(0, 6));
      setPincodeResult(result);
      return result;
    },
    [pincode]
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        removeItems,
        totalItems,
        subtotal,
        appliedPromo,
        promoDiscount,
        applyPromo,
        removePromo,
        pincode,
        setPincode,
        pincodeResult,
        checkDeliveryPincode,
        totals,
        isReady: hydrated && !authLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
