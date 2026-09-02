"use client";

import Link from "next/link";

const pillars = [
  { title: "Learn", desc: "Knowledge, literacy, research, critical thinking and communication.", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  { title: "Live", desc: "Practical independence, household skills, health, safety and everyday competence.", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  { title: "Lead", desc: "Communication, decision-making, teamwork, responsibility and mentoring.", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  { title: "Earn", desc: "Entrepreneurship, value creation, financial skills and vocational exposure.", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  { title: "Serve", desc: "Community participation, environmental responsibility and civic contribution.", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
];

const philosophies = [
  { label: "Learning", desc: "Intellectual curiosity and academic growth" },
  { label: "Capability", desc: "Practical skills and real-world competence" },
  { label: "Character", desc: "Values, integrity and emotional strength" },
  { label: "Health", desc: "Physical and mental wellbeing" },
  { label: "Responsibility", desc: "Accountability and contribution" },
  { label: "Opportunity", desc: "Future readiness and adaptability" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 w-full">
        <section className="relative overflow-hidden gradient-primary text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 lg:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 mb-6">
                <span className="h-2 w-2 rounded-full bg-gold-500 animate-pulse" />
                About This Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Total Child Development Planner
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl">
                A family-development operating system built on five coherent pillars — LEARN • LIVE • LEAD • EARN • SERVE — designed to raise capable, responsible and opportunity-ready children.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <h2 className="section-title mb-4">The Platform</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-6">
              Total Child Development Planner is a practical family-development platform that helps parents turn everyday life into purposeful growth. It provides a structured way to understand each child&apos;s current capabilities, set meaningful goals, and act through real activities while capturing evidence along the way.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Unlike apps focused only on exam scores, this platform connects learning to real life — giving parents a complete view of development that includes character, health, life skills, financial capability and civic responsibility.
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <h2 className="section-title mb-2">The Five Pillars</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              Every activity, assessment and goal maps to one of five pillars that together produce well-rounded, capable young people.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {pillars.map((pillar) => (
                <div key={pillar.title} className={`card rounded-xl border ${pillar.border} ${pillar.bg}`}>
                  <h3 className={`text-lg font-bold mb-2 ${pillar.color}`}>{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <h2 className="section-title mb-4">Why It Exists</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-6">
              Many development systems stop at examination readiness. Good grades are important, but they do not tell the whole story of a child&apos;s growth. A child may score highly on a test yet struggle with basic life skills, financial decisions, emotional resilience or community responsibility.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              This platform was created to move beyond the exam-only mindset. It gives parents and families a practical, evidence-based way to develop the whole child — building capability alongside learning, character alongside curiosity, and health alongside achievement.
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <h2 className="section-title mb-4">Nigerian &amp; African Context</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-6">
              This platform is built for families across Nigeria and the broader African continent. It acknowledges the realities of varying internet access, electricity reliability, family budgets and educational environments.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-6">
              Development does not require expensive gadgets or constant connectivity. It happens through conversations, chores, real activities, family time and community involvement — all of which this platform supports without demanding more than a family can give.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              The goal is practical relevance: every feature should work for a family in Makurdi, Lagos, Nairobi or Accra — whether they are online for an hour a day or have spotty data throughout the week.
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <h2 className="section-title mb-4">About Omotola Fayomi</h2>
            <div className="max-w-3xl">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Omotola Fayomi is a Chemistry researcher in the Department of Chemistry at Joseph Sarwuan Tarka University, Makurdi, Nigeria. Her research focuses on green-synthesised nanoparticles and their agricultural applications — work that bridges scientific innovation with practical, real-world benefit.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                She created the Total Child Development Planner to bring the same evidence-based, practical thinking into child and family development — helping parents nurture capable, balanced and responsible young people.
              </p>
              <a
                href="https://scholar.google.com/scholar?q=%22Fayomi+Omotola+Michael%22"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                Search Google Scholar
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <h2 className="section-title mb-8">Development Philosophy</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-10">
              Growth is not one-dimensional. We believe every child deserves a development plan that balances six essential dimensions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {philosophies.map((item) => (
                <div key={item.label} className="card flex flex-col gap-1">
                  <span className="text-sm font-semibold text-primary">{item.label}</span>
                  <span className="text-sm text-muted-foreground">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-white">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
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

