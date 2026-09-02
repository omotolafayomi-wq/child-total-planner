"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOnboardingState as getStoreOnboardingState } from "@/lib/store";

function ChildrenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4v2h4v4h4v-4h4v-2a4 4 0 0 0-4-4z"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}

function AssessIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16v-3"/><path d="M11 16V8"/><path d="M15 16v-5"/><path d="M19 16v-9"/></svg>
  );
}

function GoalsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  );
}

function ActivitiesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  );
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  );
}

function TikTokIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.15V11.6a4.85 4.85 0 01-3.77-1.26V6.69h3.77z"/></svg>
  );
}

function YouTubeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.075-.199-.322-.615-.354-.676-.073-.381-.288-.688-.481-.791-.16-.086-.343-.06-.463-.036-.179.036-2.826 1.131-5.445 2.169-.416.166-.818.244-1.192.244-.363 0-.768-.076-1.177-.226-.415-.15-2.826-1.1-3.056-1.156-.228-.055-.326-.089-.463.089-.136.177-1.253 1.543-1.253 3.761 0 2.218 1.278 3.469 1.545 3.707.268.238.627.268 1.003.194.376-.073 2.826-1.153 5.445-2.17.416-.166.818-.243 1.192-.243.363 0 .768.076 1.177.226.415.15 2.826 1.1 3.056 1.156.228.055.326.089.463-.089.136-.177 1.253-1.543 1.253-3.761 0-2.218-1.278-3.469-1.545-3.707z"/></svg>
  );
}

export default function Home() {
  const router = useRouter();
  const isOnboardingComplete = getStoreOnboardingState()?.step === "complete";

  const pillars = [
    {
      title: "Learn",
      slug: "learn",
      desc: "Knowledge, literacy, research, critical thinking and communication.",
      color: "border-blue-200 bg-blue-50/50",
      accent: "#2B82BD",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      ),
    },
    {
      title: "Live",
      slug: "live",
      desc: "Practical independence, household skills, health, safety and everyday competence.",
      color: "border-emerald-200 bg-emerald-50/50",
      accent: "#3FA36B",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      ),
    },
    {
      title: "Lead",
      slug: "lead",
      desc: "Communication, decision-making, teamwork, responsibility and mentoring.",
      color: "border-purple-200 bg-purple-50/50",
      accent: "#8B5CF6",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      ),
    },
    {
      title: "Earn",
      slug: "earn",
      desc: "Entrepreneurship, value creation, financial skills and vocational exposure.",
      color: "border-amber-200 bg-amber-50/50",
      accent: "#F4B942",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="18" x2="12" y2="22"/></svg>
      ),
    },
    {
      title: "Serve",
      slug: "serve",
      desc: "Community participation, environmental responsibility and civic contribution.",
      color: "border-rose-200 bg-rose-50/50",
      accent: "#F43F5E",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      ),
    },
  ];

  const handlePillarClick = (slug: string) => {
    if (isOnboardingComplete) {
      router.push(`/dashboard/activities?pillar=${slug}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 w-full">
        <section className="relative overflow-hidden gradient-primary text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 lg:py-32 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 mb-6">
                <span className="h-2 w-2 rounded-full bg-growth-500 bg-[#3FA36B] animate-pulse" />
                Total Child Development Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Raise a child who can{" "}
                <span className="text-gold-300 text-[#F9D982]">learn</span>,{" "}
                <span className="text-growth-300 text-[#86EFAC]">live</span>,{" "}
                <span className="text-gold-300 text-[#F9D982]">lead</span>,{" "}
                <span className="text-growth-300 text-[#86EFAC]">earn</span> and{" "}
                <span className="text-gold-300 text-[#F9D982]">serve</span>.
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto">
                A practical family development platform that helps parents turn everyday life into purposeful growth — not just exam preparation.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => router.push("/onboarding/welcome")} className="btn-accent text-base px-8 py-3">
                  Start My Child&apos;s Development Plan
                </button>
                <Link href="/dashboard" className="btn-outline text-base px-8 py-3 border-white/30 text-white hover:bg-white/10 text-center">
                  I Have A Profile
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">LEARN • LIVE • LEAD • EARN • SERVE</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Five coherent pillars that develop capable, responsible, healthy, adaptable and opportunity-ready children.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {pillars.map((pillar) => (
                <button
                  key={pillar.slug}
                  onClick={() => handlePillarClick(pillar.slug)}
                  className={`card-interactive rounded-xl border ${pillar.color} p-6 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent text-left`}
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center" style={{ color: pillar.accent }}>
                      {pillar.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{pillar.desc}</p>
                  <span className="inline-flex items-center text-sm font-semibold" style={{ color: pillar.accent }}>
                    Explore {pillar.title}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              A continuous development cycle that connects assessment, planning, real activities, evidence and reflection.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Add Child", desc: "Create a development profile for each child.", icon: ChildrenIcon },
                { step: "2", title: "Assess", desc: "Understand current capabilities across all development domains.", icon: AssessIcon },
                { step: "3", title: "Set Goals", desc: "Choose 1-5 priority goals with observable behaviours.", icon: GoalsIcon },
                { step: "4", title: "Act & Track", desc: "Do real activities, record evidence and review together.", icon: ActivitiesIcon },
              ].map((item) => (
                <div key={item.step} className="card text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    <item.icon />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold mx-auto mb-3 -mt-8 relative z-10 border-4 border-white">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Family&apos;s Journey</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Every child deserves a development plan that is practical, balanced and personal.
            </p>
            <button onClick={() => router.push("/onboarding/welcome")} className="btn-primary text-base px-8 py-3">
              Start My Child&apos;s Development Plan
            </button>
            <p className="text-xs text-muted-foreground mt-4">
              No credit card required. Your family&apos;s data stays private.
            </p>
          </div>
        </section>

        <footer className="border-t border-border bg-surface-soft">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-3">Product</h3>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                  <li><Link href="/dashboard/children" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Children</Link></li>
                  <li><Link href="/dashboard/goals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Goals</Link></li>
                  <li><Link href="/dashboard/reports" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reports</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-3">Family</h3>
                <ul className="space-y-2">
                  <li><Link href="/dashboard/assess" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Assess</Link></li>
                  <li><Link href="/dashboard/activities" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Activities</Link></li>
                  <li><Link href="/dashboard/evidence" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Evidence</Link></li>
                  <li><Link href="/dashboard/plan/weekly" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Weekly Plan</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-3">Support</h3>
                <ul className="space-y-2">
                  <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                  <li><Link href="/dashboard/modules/parent-guidance" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Parent Guidance</Link></li>
                  <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
                  <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-3">Connect</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="https://www.facebook.com/profile.php?id=61562544517742" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                      <FacebookIcon /> Facebook
                    </a>
                  </li>
                  <li>
                    <a href="https://www.tiktok.com/@omotolafayomi" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                      <TikTokIcon /> TikTok
                    </a>
                  </li>
                  <li>
                    <a href="https://www.youtube.com/@fayomiomotola4672" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                      <YouTubeIcon /> YouTube
                    </a>
                  </li>
                  <li>
                    <a href="https://wa.me/2348038291810" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                      <WhatsAppIcon /> WhatsApp
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Total Child Development Planner — Built for Nigerian and African families.
              </p>
              <p className="text-xs text-muted-foreground mt-1">LEARN • LIVE • LEAD • EARN • SERVE</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
