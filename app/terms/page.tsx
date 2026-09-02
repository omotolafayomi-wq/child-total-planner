"use client";

import Link from "next/link";

const LAST_UPDATED = "August 26, 2026";

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms", content: "By accessing or using Total Child Development Planner, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, please do not use the platform." },
  { id: "eligibility", title: "2. Eligibility", content: "You must be at least 18 years old to create an account. Users under 18 must use the platform only under the direct supervision of a parent or legal guardian who holds the account." },
  { id: "parent-responsibility", title: "3. Parent / Guardian Responsibility", content: "Parents and guardians are responsible for all activity on their account. This includes reviewing development plans, approving goals, supervising child input, and ensuring uploaded content is appropriate and truthful." },
  { id: "development-info", title: "4. Development Information", content: "The platform provides general child development guidance and planning tools. It is not a substitute for medical, psychological, educational or legal advice. Always consult qualified professionals for diagnosis or treatment." },
  { id: "accounts", title: "5. User Accounts", content: "You are responsible for keeping your login credentials secure. Notify us immediately of any unauthorised access. We reserve the right to suspend accounts that violate these terms or appear to be at risk." },
  { id: "child-data", title: "6. Child Data", content: "We treat all child data with strict privacy. Information about children is collected only for the purpose of delivering development planning features. We do not sell child data to third parties." },
  { id: "portfolio", title: "7. Portfolio and Uploaded Evidence", content: "You retain ownership of content you upload. By uploading, you grant us a limited licence to display and process that content within the platform. Do not upload content that violates intellectual property, privacy or child-safety rules." },
  { id: "prohibited-use", title: "8. Prohibited Use", content: "You may not use the platform for unlawful purposes, to harass others, to distribute harmful content, or to interfere with the service. Misuse may result in account termination." },
  { id: "safety", title: "9. Safety", content: "We are committed to child safety. Any content that endangers a child, promotes harm, or breaches safety standards will be removed and may be reported to authorities." },
  { id: "third-party", title: "10. Third-Party Services", content: "The platform may integrate third-party services for analytics, hosting or communication. These services have their own terms and privacy policies, which we encourage you to review." },
  { id: "availability", title: "11. Availability", content: "We strive for reliable access but do not guarantee uninterrupted service. Maintenance, updates and factors beyond our control may affect availability." },
  { id: "liability", title: "12. Limitation of Liability", content: "To the maximum extent permitted by law, we are not liable for indirect, incidental or consequential damages arising from your use of the platform. Our total liability is limited to the amount paid by you, if any, for access to the service." },
  { id: "changes", title: "13. Changes", content: "We may update these terms from time to time. Significant changes will be communicated through the platform. Continued use after changes constitutes acceptance of the updated terms." },
  { id: "contact", title: "14. Contact", content: "For questions about these terms, reach out through our contact page or the social channels listed there." },
];

export default function TermsPage() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 w-full">
        <section className="bg-white border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Use</h1>
            <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          </div>
        </section>

        <section className="bg-muted/30">
          <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
            <div className="card space-y-8">
              {sections.map((section) => (
                <div key={section.id} id={section.id}>
                  <h2 className="text-lg font-bold mb-2">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-white">
          <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-center">
            <Link href="/dashboard" className="btn-outline inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back to Home
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Total Child Development Planner — Built for Nigerian and African families.</p>
          <p className="mt-1">LEARN • LIVE • LEAD • EARN • SERVE</p>
        </div>
      </footer>
    </div>
  );
}

