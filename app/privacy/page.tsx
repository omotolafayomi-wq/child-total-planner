"use client";

import Link from "next/link";

const LAST_UPDATED = "August 26, 2026";

const sections = [
  { id: "information-collected", title: "Information Collected", content: "We collect information that you provide directly, such as parent or guardian names, contact details, and child profiles including names, ages, development goals and uploaded evidence. We also collect technical information such as device type, browser version, IP address and usage patterns to improve the service." },
  { id: "purpose", title: "Purpose", content: "Your data is used solely to deliver the development planning features of the platform: creating child profiles, tracking goals, recording evidence, generating reports, and improving the overall experience. We do not use personal data for unrelated advertising." },
  { id: "child-data", title: "Child Data", content: "Child-related information is treated as private by default. Profiles, goals, evidence and reflections are only visible to the parent or guardian account holder. We never make child data public or share it with other families." },
  { id: "storage", title: "Storage", content: "Data is stored on secure servers with encryption in transit and at rest. Access is restricted to authorised personnel and systems only. Regular security reviews are conducted to maintain safe storage practices." },
  { id: "user-control", title: "User Control", content: "You can update, correct or request deletion of your account data at any time. Account deletion removes personal information unless we are required by law to retain certain records." },
  { id: "third-parties", title: "Third Parties", content: "We do not sell personal data. Limited service providers may process data on our behalf for hosting, analytics or communication — under strict data-processing agreements and only to the extent necessary." },
  { id: "email", title: "Email", content: "Email addresses are used for authentication, security alerts and optional product updates. You may unsubscribe from non-essential emails at any time using the link in the message." },
  { id: "cookies-sessions", title: "Cookies / Sessions", content: "We use minimal cookies and session tokens to keep you signed in and secure. Essential cookies cannot be disabled without affecting functionality. We do not use invasive tracking cookies." },
  { id: "data-retention", title: "Data Retention", content: "We retain data only for as long as your account is active or as needed to provide the service. When you delete your account, associated data is removed in accordance with our retention policy and legal obligations." },
  { id: "security", title: "Security", content: "We implement industry-standard security measures including access controls, encryption and monitoring. No system is completely secure, but we continuously improve our safeguards to protect your family&apos;s information." },
  { id: "changes", title: "Changes", content: "This policy may be updated to reflect new features, legal requirements or operational changes. The updated version will be posted with a revised date and, when appropriate, users will be notified within the platform." },
  { id: "contact", title: "Contact", content: "If you have questions about this privacy policy or how your data is handled, please reach out through our contact page or social channels." },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 w-full">
        <section className="bg-white border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
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
            <Link href="/" className="btn-outline inline-flex items-center gap-2">
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
