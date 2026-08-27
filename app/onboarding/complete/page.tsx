"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOnboardingState as getStoreOnboardingState, clearOnboardingState } from "@/lib/store";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const existing = user ? getStoreOnboardingState(user.id) : null;

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
      return;
    }
    if (!existing?.childId) {
      router.push("/onboarding/child");
      return;
    }
    clearOnboardingState();
  }, [user, router, existing]);

  useEffect(() => {
    if (user && existing?.childId) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [user, existing, router]);

  if (!user || !existing?.childId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const childName = existing.childData?.name || "your child";

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
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-growth-100 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-growth-600">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">You&apos;re All Set</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-2">
            {childName}&apos;s development profile is ready.
          </p>
          <p className="text-muted-foreground mb-8">
            You can now explore activities, set goals, build plans and track growth. We&apos;ll guide you at every step.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="btn-primary text-base px-8 py-3">
              Go to Dashboard
            </Link>
            <Link href="/dashboard/activities" className="btn-outline text-base px-8 py-3">
              Explore Activities
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Redirecting to dashboard in a few seconds...
          </p>
        </div>
      </main>
    </div>
  );
}
