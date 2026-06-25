export type RazorpayPaymentMethod = "upi" | "card" | "netbanking" | "wallet" | "paylater";

export function formatIndianPhone(phone?: string): string {
  const digits = phone?.replace(/\D/g, "") ?? "";
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  if (local.length !== 10) return phone || "";
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

export function razorpayCheckoutConfig() {
  return {
    display: {
      blocks: {
        upi: {
          name: "Pay via UPI",
          instruments: [{ method: "upi" as const }],
        },
        card: {
          name: "Pay via Card",
          instruments: [{ method: "card" as const }],
        },
        netbanking: {
          name: "Pay via Netbanking",
          instruments: [{ method: "netbanking" as const }],
        },
        wallet: {
          name: "Pay via Wallet",
          instruments: [{ method: "wallet" as const }],
        },
        paylater: {
          name: "Pay Later",
          instruments: [{ method: "paylater" as const }],
        },
      },
      sequence: [
        "block.upi",
        "block.card",
        "block.netbanking",
        "block.wallet",
        "block.paylater",
      ],
      preferences: {
        show_default_blocks: true,
      },
    },
  };
}
