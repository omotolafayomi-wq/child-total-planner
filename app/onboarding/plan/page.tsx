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
  { key: "plan", label: "Plan" },
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                    isCompleted
                      ? "bg-growth-600 border-growth-600 text-white"
                      : isCurrent
                        ? "bg-white border-primary text-primary"
                        : "bg-white border-border text-muted-foreground"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? "✓" : idx + 1}
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

export default function OnboardingPlanPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const existing = user ? getStoreOnboardingState(user.id) : null;

  const [planType, setPlanType] = useState<"weekly" | "monthly" | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
      return;
    }
    if (!existing?.childId) {
      router.push("/onboarding/child");
      return;
    }
    if (existing.planData?.type) {
      setPlanType(existing.planData.type);
    }
  }, [user, router, existing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!planType) {
      setError("Please choose a plan type to continue.");
      return;
    }
    setLoading(true);
    try {
      saveStoreOnboardingState({
        ...existing,
        step: "complete",
        planData: { type: planType },
        updatedAt: new Date().toISOString(),
        parentId: existing!.parentId,
      } as any);
      router.push("/onboarding/complete");
      router.refresh();
    } catch (err) {
      setError("We couldn't save that just now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!user || !existing?.childId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-primary tracking-tight">
            Total Child
          </Link>
        </div>
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
        <ProgressIndicator currentStep="plan" />
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">You&apos;re Ready to Start</h1>
            <p className="text-muted-foreground">Choose the type of development plan you&apos;d like to begin with.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPlanType("weekly")}
                className={`card text-left p-6 border-2 transition-colors ${planType === "weekly" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              >
                <h3 className="text-lg font-bold mb-1">Build a Holiday Plan</h3>
                <p className="text-sm text-muted-foreground">Structured holiday development programme with daily activities and goals.</p>
              </button>
              <button
                type="button"
                onClick={() => setPlanType("monthly")}
                className={`card text-left p-6 border-2 transition-colors ${planType === "monthly" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              >
                <h3 className="text-lg font-bold mb-1">Create a School-Term Plan</h3>
                <p className="text-sm text-muted-foreground">Lighter school-term routine focused on consistent growth alongside studies.</p>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button type="submit" className="btn-primary flex-1" disabled={loading || !planType}>
                {loading ? "Saving..." : "Continue"}
              </button>
              <Link href="/dashboard" className="btn-outline text-center">
                Skip for Now
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
