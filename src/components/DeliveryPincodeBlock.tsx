"use client";

import { useCart } from "@/context/CartContext";
import PincodeChecker from "@/components/PincodeChecker";

interface DeliveryPincodeBlockProps {
  compact?: boolean;
  className?: string;
}

/** PIN code checker wired to cart — use on any page. */
export default function DeliveryPincodeBlock({
  compact = false,
  className,
}: DeliveryPincodeBlockProps) {
  const { pincode, setPincode, pincodeResult, checkDeliveryPincode } = useCart();

  return (
    <PincodeChecker
      value={pincode}
      onChange={setPincode}
      onCheck={() => checkDeliveryPincode()}
      resultMessage={pincodeResult?.message ?? null}
      serviceable={pincodeResult?.serviceable ?? null}
      city={pincodeResult?.city ?? null}
      district={pincodeResult?.district ?? null}
      state={pincodeResult?.state ?? null}
      eta={pincodeResult?.eta}
      compact={compact}
      className={className}
    />
  );
}
