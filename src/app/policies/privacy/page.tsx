import PolicyLayout from "@/components/PolicyLayout";

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy" updated="25 June 2026">
      <p>
        MedLive Healthcare Pvt. Ltd. (&quot;MedLive&quot;, &quot;we&quot;, &quot;us&quot;) respects your privacy.
        This policy explains how we collect, use, and protect personal information when you use
        medlivehealthcare.in and related services.
      </p>
      <h2 className="text-base font-bold text-slate-900">Information we collect</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Name, email, phone number, and delivery addresses</li>
        <li>Order history, payment method (we do not store full card/UPI details — Razorpay processes payments)</li>
        <li>Optional GSTIN for tax invoices</li>
        <li>Device and usage data via standard web logs and analytics (when enabled)</li>
      </ul>
      <h2 className="text-base font-bold text-slate-900">How we use your data</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Fulfil orders and provide delivery updates</li>
        <li>Generate GST tax invoices</li>
        <li>Customer support, returns, and refunds</li>
        <li>Improve our products and website experience</li>
      </ul>
      <h2 className="text-base font-bold text-slate-900">Data retention &amp; security</h2>
      <p>
        We retain order and invoice records as required under Indian tax and commercial laws.
        Passwords are stored using industry-standard hashing. Sessions use secure HTTP-only cookies.
      </p>
      <h2 className="text-base font-bold text-slate-900">Your rights</h2>
      <p>
        You may request access, correction, or deletion of your account data by emailing{" "}
        <a href="mailto:privacy@medlivehealthcare.in" className="text-primary-600">
          privacy@medlivehealthcare.in
        </a>
        . We respond within 30 days.
      </p>
      <h2 className="text-base font-bold text-slate-900">Contact</h2>
      <p>
        MedLive Healthcare Pvt. Ltd., 42 Healthcare Park, Andheri East, Mumbai 400069.
        Email: support@medlivehealthcare.in · Phone: +91 1800-633-5483
      </p>
    </PolicyLayout>
  );
}
