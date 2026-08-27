"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOnboardingState as getStoreOnboardingState, saveOnboardingState as saveStoreOnboardingState } from "@/lib/store";

const steps = [
  { key: "welcome", label: "Welcome" },
  { key: "child", label: "Child" },
  { key: "profile", label: "Profile" },
  { key: "plan", label: "Start Plan" },
] as const;

function ProgressIndicator({ currentStep }: { currentStep: (typeof steps)[number]["key"] }) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);
  return (
    <nav className="w-full mb-8" aria-label="Onboarding progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <li key={step.key} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${isCompleted ? "bg-growth-600 border-growth-600 text-white" : isCurrent ? "bg-white border-primary text-primary" : "bg-white border-border text-muted-foreground"}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? "✓" : String(idx + 1).padStart(2, "0")}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-growth-600" : "bg-border"}`} aria-hidden="true" />
                )}
              </div>
              <span className={`mt-2 text-xs font-medium ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
      return;
    }
    const existing = getStoreOnboardingState(user.id);
    if (existing && existing.step !== "welcome") {
      router.push(`/onboarding/${existing.step}`);
      return;
    }
    const state = {
      step: "welcome" as const,
      parentId: user.id,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveStoreOnboardingState(state);
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const existing = getStoreOnboardingState(user.id);
  const childName = existing?.childData?.name;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-primary tracking-tight">
            Total Child
          </Link>
        </div>
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
        <ProgressIndicator currentStep="welcome" />
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Total Child Development Planner</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Welcome. Let&apos;s build a practical development journey around your child — one realistic goal, meaningful activity and useful experience at a time.
          </p>
          <p className="text-muted-foreground mb-8">
            You do not need to plan everything at once. We&apos;ll help you understand your child&apos;s current capabilities, identify priorities and build a realistic path forward.
          </p>

          {childName && (
            <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
              <p className="font-medium mb-2">Welcome back. You were creating a development profile for {childName}.</p>
              <Link href="/onboarding/child" className="btn-primary text-sm px-4 py-2">
                Continue
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/onboarding/child" className="btn-primary text-base px-8 py-3">
              Add My Child
            </Link>
            <Link href="/dashboard" className="btn-outline text-base px-8 py-3">
              Explore First
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground px-4 py-3">
              Skip for Now
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
