import PolicyLayout from "@/components/PolicyLayout";

export const metadata = {
  title: "Shipping Policy | MedLive Healthcare",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout title="Shipping Policy" updated="25 June 2026">
      <h2 className="text-base font-bold text-slate-900">Delivery coverage</h2>
      <p>
        We ship pan-India to serviceable PIN codes. Use the PIN checker on product, cart, or
        checkout pages to confirm delivery availability and estimated delivery time.
      </p>
      <h2 className="text-base font-bold text-slate-900">Shipping charges</h2>
      <p>Free shipping on all orders anywhere in India.</p>
      <h2 className="text-base font-bold text-slate-900">Dispatch &amp; tracking</h2>
      <p>
        Orders are typically dispatched within 1–2 business days. You will receive an AWB number and
        tracking link on your order details page once the courier picks up the package.
      </p>
      <h2 className="text-base font-bold text-slate-900">Cash on Delivery</h2>
      <p>
        COD is available on eligible pincodes. Please keep exact change or UPI ready for the
        delivery partner. Refused COD deliveries may affect future COD eligibility.
      </p>
      <h2 className="text-base font-bold text-slate-900">Delays</h2>
      <p>
        Weather, festivals, or remote locations may cause delays. Contact support@medlivehealthcare.in
        if your order is significantly delayed beyond the estimated date.
      </p>
    </PolicyLayout>
  );
}
