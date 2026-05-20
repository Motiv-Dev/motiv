import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <nav className="sticky top-0 z-50 bg-[#faf9f7]/80 backdrop-blur-xl border-b border-stone-200/50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 rounded-xl hover:bg-stone-100 text-stone-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-stone-900">Terms & Conditions</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-stone-400 mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-stone-600 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">1. What is Motiv?</h2>
            <p>
              Motiv is a habit accountability platform. You stake real money on a personal commitment. If you complete your challenge (verified by proof submission), you get your full stake back. If you miss a day, that day&apos;s portion is forfeited.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">2. How Your Money Works</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stake amount:</strong> You choose how much to stake (₹100 - ₹25,000). This is split equally across your challenge days.</li>
              <li><strong>Platform fee:</strong> A one-time fee of ₹9-₹99 (based on stake amount) is charged at payment. This is non-refundable and covers verification costs.</li>
              <li><strong>Daily risk:</strong> Each day you miss, that day&apos;s share is permanently forfeited.</li>
              <li><strong>Completion:</strong> Complete all required days and your remaining stake is returned in full via UPI.</li>
              <li><strong>Forfeited funds:</strong> Money forfeited due to missed days is retained by Motiv to sustain the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">3. Refund Policy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Before stake activation:</strong> If your payment hasn&apos;t been verified yet, you can request a full refund by emailing motiv2812@gmail.com.</li>
              <li><strong>After stake activation:</strong> No refunds. This is the entire point of the platform -- your commitment is binding.</li>
              <li><strong>Completed challenges:</strong> Your remaining stake (minus any burned days) is returned within 3-5 business days of requesting withdrawal.</li>
              <li><strong>Platform fee:</strong> Non-refundable in all cases.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">4. Proof Verification</h2>
            <p className="mb-2">
              All proofs are currently verified manually by the founder. Verification is done within 24 hours of submission. You must:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Submit proof before the daily deadline</li>
              <li>Include the unique keyword shown on your dashboard</li>
              <li>Provide genuine, original proof (no reused photos/videos)</li>
              <li>Not attempt to fake or manipulate proof submissions</li>
            </ul>
            <p className="mt-2">
              If your proof is rejected, you&apos;ll be notified with a reason and may resubmit within the deadline.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">5. Skip Days</h2>
            <p>
              You may request a skip day for genuine emergencies (illness, travel, family emergency). Skip requests are reviewed manually. Approved skips do not count as missed days. You get a limited number of skip requests per challenge.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">6. Account & Privacy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We use Clerk for authentication. Your login is secured by industry-standard encryption.</li>
              <li>Payment screenshots are stored securely and used only for verification.</li>
              <li>Proof photos/videos are stored securely and never shared publicly without consent.</li>
              <li>The Wall of Shame and Leaderboard use anonymized usernames (e.g., MOTIVated-123).</li>
              <li>We do not sell your data to third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">7. Prohibited Conduct</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Submitting fake, manipulated, or reused proof</li>
              <li>Creating multiple accounts to exploit the system</li>
              <li>Attempting to reverse UPI payments after stake activation</li>
              <li>Any form of abuse, harassment, or spam</li>
            </ul>
            <p className="mt-2">
              Violation may result in account suspension and forfeiture of staked funds.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">8. Disputes</h2>
            <p>
              If you believe a proof was incorrectly rejected or a burn was unfair, email us at{" "}
              <a href="mailto:motiv2812@gmail.com" className="text-orange-500 font-semibold underline">motiv2812@gmail.com</a>.
              We review all disputes within 48 hours. Our decision is final but we aim to be fair.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">9. Payments</h2>
            <p>
              Payments are currently processed via direct UPI transfer. A payment gateway integration is coming soon.
              UPI has daily transaction limits set by your bank (typically 20-40 transactions/day).
              If you face issues, contact us and we&apos;ll help resolve them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">10. Limitation of Liability</h2>
            <p>
              Motiv is provided &quot;as is.&quot; While we make every effort to ensure fair verification and secure payments,
              we are not liable for losses arising from technical failures, UPI processing delays, or disputes
              beyond our control. Our total liability is limited to the amount you have staked.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-3">11. Contact</h2>
            <p>
              For any questions, disputes, or refund requests:
            </p>
            <p className="mt-2 font-semibold text-stone-900">
              Email: <a href="mailto:motiv2812@gmail.com" className="text-orange-500 underline">motiv2812@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
