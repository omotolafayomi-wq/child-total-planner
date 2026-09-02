"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOnboardingState as getStoreOnboardingState, saveOnboardingState as saveStoreOnboardingState, createAssessment } from "@/lib/store";

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

type ProfileFormData = {
  email: string;
  strengths: string;
  areasToDevelop: string;
  interests: string;
  responsibilities: string;
  existingSkills: string;
  parentPriorities: string;
};

const formSteps = [
  {
    title: "Contact & Strengths",
    subtitle: "Where can we reach you, and what does your child already do well?",
    fields: ["email", "strengths", "areasToDevelop"] as (keyof ProfileFormData)[],
  },
  {
    title: "Interests & Responsibilities",
    subtitle: "What does your child enjoy, and what do they already handle?",
    fields: ["interests", "responsibilities"] as (keyof ProfileFormData)[],
  },
  {
    title: "Skills & Family Priorities",
    subtitle: "What can they do independently, and what matters most to your family?",
    fields: ["existingSkills", "parentPriorities"] as (keyof ProfileFormData)[],
  },
] as const;

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const existing = user ? getStoreOnboardingState(user.id) : null;

  const [form, setForm] = useState<ProfileFormData>({
    email: "",
    strengths: "",
    areasToDevelop: "",
    interests: "",
    responsibilities: "",
    existingSkills: "",
    parentPriorities: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    if (!user) {
      const existing = getStoreOnboardingState();
      if (!existing) {
        router.push("/onboarding/welcome");
      }
      return;
    }
    if (!existing?.childId) {
      router.push("/onboarding/child");
      return;
    }
    if (existing.profileData) {
      const data = existing.profileData as any;
      setForm({
        email: Array.isArray(data.email) ? data.email.join(", ") : data.email,
        strengths: Array.isArray(data.strengths) ? data.strengths.join(", ") : data.strengths,
        areasToDevelop: Array.isArray(data.areasToDevelop) ? data.areasToDevelop.join(", ") : data.areasToDevelop,
        interests: Array.isArray(data.interests) ? data.interests.join(", ") : data.interests,
        responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.join(", ") : data.responsibilities,
        existingSkills: Array.isArray(data.existingSkills) ? data.existingSkills.join(", ") : data.existingSkills,
        parentPriorities: Array.isArray(data.parentPriorities) ? data.parentPriorities.join(", ") : data.parentPriorities,
      });
    }
  }, [user, router, existing]);

  function update(field: keyof ProfileFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateStep(stepIndex: number): boolean {
    setError("");
    if (stepIndex === 0) {
      if (!form.strengths.trim() && !form.areasToDevelop.trim()) {
        setError("Please share at least one strength or area to develop.");
        return false;
      }
    }
    return true;
  }

  function goNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, formSteps.length - 1));
    }
  }

  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.strengths.trim() && !form.areasToDevelop.trim()) {
      setError("Please share at least one strength or area to develop.");
      return;
    }
    setLoading(true);
    try {
      if (existing?.childId) {
        createAssessment({
          childId: existing.childId,
          pillar: "DEVELOPMENT_PROFILE",
          area: "Onboarding Profile",
          level: "DEVELOPING",
          observations: `Strengths: ${form.strengths}\n\nAreas to develop: ${form.areasToDevelop}\n\nInterests: ${form.interests}\n\nResponsibilities: ${form.responsibilities}\n\nExisting skills: ${form.existingSkills}\n\nParent priorities: ${form.parentPriorities}`,
          supportNeeded: "To be determined through planning",
        });
      }
      const updated = { ...existing, step: "plan" as const, profileData: { ...form, email: form.email.trim() }, updatedAt: new Date().toISOString() };
      saveStoreOnboardingState(updated as any);
      setSaved(true);
      setTimeout(() => {
        router.push("/onboarding/plan");
      }, 600);
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

  const currentStepData = formSteps[currentStep];

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
        <ProgressIndicator currentStep="profile" />
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Development Profile</h1>
            <p className="text-muted-foreground">
              We&apos;ll use this to understand your child&apos;s current capabilities and plan realistic growth. This is not a test.
            </p>
            <div className="mt-4 rounded-lg border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-800">
              <p className="font-medium">Important Notice</p>
              <p className="mt-1">This is a planning and development tool, not a psychological, intelligence or clinical assessment.</p>
            </div>
          </div>

          {saved && (
            <div className="mb-6 rounded-lg border border-growth-200 bg-growth-50 px-4 py-3 text-sm text-growth-800">
              Development profile saved. Redirecting...
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{currentStepData.title}</h2>
              <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {formSteps.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">{currentStepData.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-6">
            {currentStepData.fields.map((field) => {
              if (field === "email") {
                return (
                  <div key={field}>
                    <label className="label" htmlFor="email">Email Address</label>
                    <input id="email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                  </div>
                );
              }
              if (field === "strengths") {
                return (
                  <div key={field}>
                    <label className="label" htmlFor="strengths">Current Strengths</label>
                    <textarea id="strengths" className="input min-h-[100px]" placeholder="What does your child already do well?" value={form.strengths} onChange={(e) => update("strengths", e.target.value)} />
                  </div>
                );
              }
              if (field === "areasToDevelop") {
                return (
                  <div key={field}>
                    <label className="label" htmlFor="areasToDevelop">Areas Worth Developing</label>
                    <textarea id="areasToDevelop" className="input min-h-[100px]" placeholder="What would you like your child to improve?" value={form.areasToDevelop} onChange={(e) => update("areasToDevelop", e.target.value)} />
                  </div>
                );
              }
              if (field === "interests") {
                return (
                  <div key={field}>
                    <label className="label" htmlFor="interests">Interests</label>
                    <textarea id="interests" className="input min-h-[80px]" placeholder="What does your child enjoy doing?" value={form.interests} onChange={(e) => update("interests", e.target.value)} />
                  </div>
                );
              }
              if (field === "responsibilities") {
                return (
                  <div key={field}>
                    <label className="label" htmlFor="responsibilities">Current Responsibilities</label>
                    <textarea id="responsibilities" className="input min-h-[80px]" placeholder="What responsibilities does your child already handle?" value={form.responsibilities} onChange={(e) => update("responsibilities", e.target.value)} />
                  </div>
                );
              }
              if (field === "existingSkills") {
                return (
                  <div key={field}>
                    <label className="label" htmlFor="existingSkills">Existing Skills</label>
                    <textarea id="existingSkills" className="input min-h-[80px]" placeholder="What can your child already do independently?" value={form.existingSkills} onChange={(e) => update("existingSkills", e.target.value)} />
                  </div>
                );
              }
              if (field === "parentPriorities") {
                return (
                  <div key={field}>
                    <label className="label" htmlFor="parentPriorities">Parent Priorities</label>
                    <textarea id="parentPriorities" className="input min-h-[80px]" placeholder="What matters most to your family at this stage?" value={form.parentPriorities} onChange={(e) => update("parentPriorities", e.target.value)} />
                  </div>
                );
              }
              return null;
            })}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {currentStep > 0 && (
                <button type="button" onClick={goBack} className="btn-outline flex-1">
                  Back
                </button>
              )}
              {currentStep < formSteps.length - 1 ? (
                <button type="button" onClick={goNext} className="btn-primary flex-1">
                  Next
                </button>
              ) : (
                <>
                  <button type="submit" className="btn-primary flex-1" disabled={loading}>
                    {loading ? "Saving..." : saved ? "Saved" : "Save & Continue"}
                  </button>
                  <Link href="/dashboard" className="btn-outline text-center">
                    Save & Finish Later
                  </Link>
                </>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

