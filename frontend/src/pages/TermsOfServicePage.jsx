export default function TermsOfServicePage() {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-white">
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-navy">Terms of Service</h1>
      <p className="mb-6 text-sm text-brandgray">Last updated: March 29, 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-navy">1. Acceptance of Terms</h2>
          <p>
            By creating an account or using ProTechtable (&quot;the Service&quot;), you agree to these Terms of
            Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">2. Description of Service</h2>
          <p>
            ProTechtable provides vulnerability assessment services that check your email address against
            public breach databases and provide remediation guidance. We query third-party APIs on your behalf
            and present the results with a vulnerability score and recommended actions.
          </p>
          <p>
            The Service is provided &quot;as is.&quot; Vulnerability scores are estimates based on available data
            and should not be treated as a comprehensive security audit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">3. User Accounts</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>You must provide accurate information when creating an account.</li>
            <li>You may only scan your own verified email address.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>
              Passwords must be at least 12 characters and include uppercase, lowercase, numbers, and special
              characters.
            </li>
            <li>You must be at least 16 years old to use the Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">4. Free and Premium Tiers</h2>
          <p>
            <strong>Free tier:</strong> One vulnerability assessment, basic remediation guidance, and 3 data
            broker removal links.
          </p>
          <p>
            <strong>Premium tier ($9.99/month or $99/year):</strong> Unlimited assessments, all data broker
            removal links, and email support. Payments are processed by Stripe. You may cancel at any time
            from your Account page.
          </p>
          <p>Refunds are handled on a case-by-case basis. Contact us within 7 days of a charge for a refund request.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Scan email addresses that do not belong to you</li>
            <li>Attempt to circumvent rate limits or access restrictions</li>
            <li>Use the Service for competitive intelligence gathering</li>
            <li>Resell or redistribute assessment results commercially</li>
            <li>Attempt to reverse-engineer, exploit, or attack the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">6. Limitation of Liability</h2>
          <p>
            ProTechtable provides informational guidance only. We are not responsible for actions taken based
            on assessment results. We do not guarantee the accuracy or completeness of breach data, as it depends
            on third-party data sources.
          </p>
          <p>
            To the maximum extent permitted by law, our total liability for any claim arising from use of the
            Service is limited to the amount you paid us in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">7. Termination</h2>
          <p>
            We may suspend or terminate your account if you violate these terms. You may delete your account at
            any time from the Account page. Upon termination, all your data is permanently deleted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">8. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use after changes constitutes acceptance. We
            will notify you of significant changes via email.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">9. Contact</h2>
          <p>
            Questions? Email{" "}
            <a href="mailto:legal@protechtable.com" className="text-navy underline">
              legal@protechtable.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
    </div>
  );
}
