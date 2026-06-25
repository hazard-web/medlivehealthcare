import PolicyLayout from "@/components/PolicyLayout";

export const metadata = {
  title: "Terms of Service | MedLive Healthcare",
};

export default function TermsPage() {
  return (
    <PolicyLayout title="Terms of Service" updated="25 June 2026">
      <p>
        By using MedLive Healthcare&apos;s website and placing orders, you agree to these terms.
        Our products are sold for home care and general hygiene unless otherwise stated.
      </p>
      <h2 className="text-base font-bold text-slate-900">Orders &amp; pricing</h2>
      <p>
        Prices are in INR and include applicable GST at checkout. Bulk discounts and promo codes
        apply as shown on the product or cart page. We reserve the right to cancel orders with
        pricing errors or stock unavailability.
      </p>
      <h2 className="text-base font-bold text-slate-900">Payments</h2>
      <p>
        Online payments are processed by Razorpay. Cash on Delivery (COD) is available on
        serviceable pincodes. COD orders may require phone verification.
      </p>
      <h2 className="text-base font-bold text-slate-900">Medical disclaimer</h2>
      <p>
        MedLive products are not intended to diagnose, treat, cure, or prevent any disease.
        Consult a healthcare professional for medical advice. Read product labels and compliance
        information on each product page.
      </p>
      <h2 className="text-base font-bold text-slate-900">Limitation of liability</h2>
      <p>
        To the extent permitted by law, MedLive is not liable for indirect or consequential damages
        arising from product use. Our liability is limited to the purchase price of the affected items.
      </p>
    </PolicyLayout>
  );
}
