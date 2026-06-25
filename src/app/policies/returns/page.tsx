import PolicyLayout from "@/components/PolicyLayout";

export const metadata = {
  title: "Return & Refund Policy | MedLive Healthcare",
};

export default function ReturnsPolicyPage() {
  return (
    <PolicyLayout title="Return & Refund Policy" updated="25 June 2026">
      <h2 className="text-base font-bold text-slate-900">Return window</h2>
      <p>
        Unopened, unused products in original packaging may be returned within <strong>7 days</strong> of
        delivery. Hygiene products that are opened or used cannot be returned for safety reasons.
      </p>
      <h2 className="text-base font-bold text-slate-900">How to return</h2>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Go to Account → Order details → Return / refund</li>
        <li>Select items and reason for return</li>
        <li>Our team approves eligible returns within 24–48 hours</li>
        <li>Reverse pickup is scheduled (metro cities) or self-ship label provided</li>
      </ol>
      <h2 className="text-base font-bold text-slate-900">Refunds</h2>
      <p>
        Online payments are refunded to the original method via Razorpay within 5–7 business days
        after we receive and inspect the return. COD orders receive refund via UPI or bank transfer.
        GST invoices are credited proportionally on approved returns.
      </p>
      <h2 className="text-base font-bold text-slate-900">Damaged or wrong items</h2>
      <p>
        Report within 48 hours of delivery with photos. We will arrange replacement or full refund
        including shipping where applicable.
      </p>
    </PolicyLayout>
  );
}
