"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { CartItem, Product } from "@/lib/types";
import { AppliedPromo, validatePromoCode } from "@/lib/promo";
import { checkPincode, PincodeCheckResult } from "@/lib/pincode";
import { calculateOrderTotals, OrderTotals } from "@/lib/orderTotals";
import { getCartLineId } from "@/lib/cart-line";
import { resolveCartLineUnitPrice } from "@/lib/cart-pricing";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variantKey?: string) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
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
  /** True after cart/promo/pincode have been read from localStorage. */
  isReady: boolean;
}

const CartContext = createContext<CartContextType | null>(null);
const CART_KEY = "medlive_cart";
const PROMO_KEY = "medlive_promo";
const PINCODE_KEY = "medlive_pincode";

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [pincode, setPincodeState] = useState("");
  const [pincodeResult, setPincodeResult] = useState<PincodeCheckResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        setItems(parseStoredCart(stored));
      }

      const storedPromo = localStorage.getItem(PROMO_KEY);
      if (storedPromo) setAppliedPromo(JSON.parse(storedPromo));

      const storedPincode = localStorage.getItem(PINCODE_KEY);
      if (storedPincode) {
        setPincodeState(storedPincode);
        setPincodeResult(checkPincode(storedPincode));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (appliedPromo) {
      localStorage.setItem(PROMO_KEY, JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem(PROMO_KEY);
    }
  }, [appliedPromo, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (pincode) {
      localStorage.setItem(PINCODE_KEY, pincode);
    } else {
      localStorage.removeItem(PINCODE_KEY);
    }
  }, [pincode, hydrated]);

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
        isReady: hydrated,
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
