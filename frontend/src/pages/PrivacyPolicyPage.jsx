export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-white">
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-navy">Privacy Policy</h1>
      <p className="mb-6 text-sm text-brandgray">Last updated: March 29, 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-navy">1. Information We Collect</h2>
          <p>
            When you create an account, we collect your email address, first name, and last name. When you
            run a vulnerability assessment, we query your email address against third-party breach databases
            (Have I Been Pwned), public profile services (Shodan), and email verification services
            (Hunter.io) on your behalf.
          </p>
          <p>We may also collect:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Phone number and date of birth</strong> (optional, encrypted at rest with AES-256-GCM)
            </li>
            <li>
              <strong>Payment information</strong> — processed by Stripe. We never see or store your card
              number.
            </li>
            <li>
              <strong>Assessment results</strong> — your vulnerability score, breach data, and remediation
              progress.
            </li>
            <li>
              <strong>Usage data</strong> — server logs including request paths and response times. We never
              log email addresses, passwords, or personal data.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">2. How We Use Your Information</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>To provide vulnerability assessments and remediation guidance</li>
            <li>To send transactional emails (verification, password reset, assessment summaries)</li>
            <li>To process payments via Stripe</li>
            <li>To improve our service and fix bugs</li>
          </ul>
          <p>
            We do <strong>not</strong> sell, rent, or share your personal information with third parties for
            marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">3. Data Storage & Security</h2>
          <p>
            Your data is stored in a PostgreSQL database hosted on Railway. Sensitive fields (phone, date of
            birth) are encrypted at rest using AES-256-GCM. Passwords are hashed with bcrypt (12 rounds).
            Authentication uses short-lived (4-hour) JWT tokens stored in httpOnly, secure, SameSite=strict
            cookies.
          </p>
          <p>
            All API communication uses HTTPS. We implement rate limiting, input validation, CSRF protection,
            and follow OWASP security best practices.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">4. Third-Party Services</h2>
          <p>We use the following third-party services to operate ProTechtable:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Have I Been Pwned</strong> — breach database lookups
            </li>
            <li>
              <strong>Shodan</strong> — public profile discovery
            </li>
            <li>
              <strong>Hunter.io</strong> — email verification
            </li>
            <li>
              <strong>Stripe</strong> — payment processing
            </li>
            <li>
              <strong>SendGrid</strong> — transactional emails
            </li>
            <li>
              <strong>Railway</strong> — hosting and database
            </li>
            <li>
              <strong>Vercel</strong> — frontend hosting
            </li>
          </ul>
          <p>
            Each service has its own privacy policy. We only share the minimum data required for each service
            to function (e.g., your email address for breach lookups).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">5. Your Rights (GDPR)</h2>
          <p>You have the right to:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Access</strong> your data — view your profile and assessment history in the dashboard
            </li>
            <li>
              <strong>Rectify</strong> your data — edit your profile from the Account page
            </li>
            <li>
              <strong>Delete</strong> your data — permanently delete your account and all associated data from
              the Account page. This action is irreversible and cascades to all assessments, remediation
              actions, and Stripe subscriptions.
            </li>
            <li>
              <strong>Export</strong> your data — contact us at the email below
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">6. Cookies</h2>
          <p>
            We use a single httpOnly authentication cookie to maintain your login session. We do not use
            tracking cookies, analytics cookies, or third-party advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">7. Data Retention</h2>
          <p>
            We retain your account data and assessment history as long as your account is active. When you
            delete your account, all data is permanently removed within 24 hours. Webhook event logs are
            retained for 90 days for billing reconciliation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">8. Changes to This Policy</h2>
          <p>We may update this policy from time to time. We will notify you of significant changes via email.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy">9. Contact</h2>
          <p>
            Questions about this policy? Email us at{" "}
            <a href="mailto:privacy@protechtable.com" className="text-navy underline">
              privacy@protechtable.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
    </div>
  );
}
