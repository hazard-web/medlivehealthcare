import { formatPrice, formatPriceDetailed } from "@/lib/products";
import {
  SELLER_ADDRESS,
  SELLER_GSTIN,
  SELLER_LEGAL_NAME,
} from "@/lib/product-compliance";
import { StoredOrder } from "@/lib/server/store";
import { formatSavedAddress } from "@/lib/addresses";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildGstInvoiceHtml(order: StoredOrder): string {
  const date = escapeHtml(
    new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  );

  const buyerName = escapeHtml(
    order.shippingAddress.fullName || order.guestName || "Customer"
  );
  const buyerGstin = escapeHtml(order.gstin || "—");
  const taxable = order.subtotal - order.promoDiscount;
  const invoiceNumber = escapeHtml(order.invoiceNumber ?? "");
  const orderNumber = escapeHtml(order.orderNumber);

  const rows = order.items
    .map(
      (item) => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.hsn ?? "—")}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${formatPriceDetailed(item.unitPrice)}</td>
      <td style="text-align:right">${formatPriceDetailed(item.lineTotal)}</td>
      <td style="text-align:center">${Math.round((item.gstRate ?? 0.12) * 100)}%</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8" />
  <title>Tax Invoice ${invoiceNumber}</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #0f172a; margin: 32px; font-size: 13px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .muted { color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f8fafc; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
    .totals { margin-top: 16px; max-width: 360px; margin-left: auto; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .grand { font-size: 16px; font-weight: 700; border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 8px; }
    @media print { body { margin: 16px; } }
  </style>
</head>
<body>
  <h1>Tax Invoice</h1>
  <p class="muted">Invoice No: <strong>${invoiceNumber}</strong> · Order: <strong>${orderNumber}</strong> · Date: ${date}</p>

  <div class="grid">
    <div>
      <strong>Sold by</strong><br />
      ${SELLER_LEGAL_NAME}<br />
      GSTIN: ${SELLER_GSTIN}<br />
      ${SELLER_ADDRESS}
    </div>
    <div>
      <strong>Bill to / Ship to</strong><br />
      ${buyerName}<br />
      ${escapeHtml(order.shippingAddress.phone)}<br />
      ${escapeHtml(formatSavedAddress(order.shippingAddress))}<br />
      Buyer GSTIN: ${buyerGstin}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>HSN</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Taxable</th>
        <th>GST%</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
    ${order.promoDiscount > 0 ? `<div><span>Promo (${escapeHtml(order.promoCode ?? "")})</span><span>−${formatPrice(order.promoDiscount)}</span></div>` : ""}
    <div><span>Taxable value</span><span>${formatPrice(taxable)}</span></div>
    ${order.cgst > 0 ? `<div><span>CGST</span><span>${formatPriceDetailed(order.cgst)}</span></div>` : ""}
    ${order.sgst > 0 ? `<div><span>SGST</span><span>${formatPriceDetailed(order.sgst)}</span></div>` : ""}
    ${order.igst > 0 ? `<div><span>IGST</span><span>${formatPriceDetailed(order.igst)}</span></div>` : ""}
    ${order.shipping > 0 ? `<div><span>Shipping</span><span>${formatPrice(order.shipping)}</span></div>` : ""}
    <div class="grand"><span>Grand Total</span><span>${formatPriceDetailed(order.total)}</span></div>
    <div><span>Payment</span><span>${order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid online (Razorpay)"}</span></div>
  </div>

  <p class="muted" style="margin-top:32px">This is a computer-generated tax invoice. For queries contact support@medlivehealthcare.in</p>
</body>
</html>`;
}
