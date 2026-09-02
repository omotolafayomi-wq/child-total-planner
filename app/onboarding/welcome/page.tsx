"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOnboardingState as getStoreOnboardingState, saveOnboardingState as saveStoreOnboardingState, getChildren } from "@/lib/store";

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

type BiodataFormData = {
  parentName: string;
  email: string;
  phone: string;
  location: string;
  numberOfChildren: string;
};

const formSteps = [
  {
    title: "Your Details",
    subtitle: "Tell us about yourself so we can personalise the experience.",
    fields: ["parentName", "email", "phone"] as (keyof BiodataFormData)[],
  },
  {
    title: "Family Background",
    subtitle: "A little about your household helps us tailor suggestions.",
    fields: ["location", "numberOfChildren"] as (keyof BiodataFormData)[],
  },
] as const;

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const [form, setForm] = useState<BiodataFormData>({
    parentName: "",
    email: "",
    phone: "",
    location: "",
    numberOfChildren: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [agreed, setAgreed] = useState(false);

   useEffect(() => {
     const existing = getStoreOnboardingState();
     if (existing && existing.step !== "welcome") {
       router.push(`/onboarding/${existing.step}`);
     }
  }, [router]);

  function update(field: keyof BiodataFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateStep(stepIndex: number): boolean {
    setError("");
    if (stepIndex === 0) {
      if (!form.parentName.trim() || !form.email.trim() || !form.phone.trim()) {
        setError("Please fill in all fields.");
        return false;
      }
    }
    if (stepIndex === 1) {
      if (!form.location.trim() || !form.numberOfChildren.trim()) {
        setError("Please fill in all fields.");
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
    if (!agreed) {
      setError("Please agree to the privacy statement before continuing.");
      return;
    }
    if (!validateStep(1)) return;
    setLoading(true);
    try {
      const state = {
        step: "welcome" as const,
        parentId: "local-" + Date.now(),
        biodata: form,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveStoreOnboardingState(state);
      setSaved(true);
      setTimeout(() => {
        router.push("/onboarding/child");
      }, 600);
    } catch (err) {
      setError("We couldn't save that just now. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <ProgressIndicator currentStep="welcome" />
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Total Child Development Planner</h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Let&apos;s build a practical development journey around your child — one realistic goal, meaningful activity and useful experience at a time.
            </p>
            <p className="text-muted-foreground mb-4">
              You do not need to plan everything at once. We&apos;ll help you understand your child&apos;s current capabilities, identify priorities and build a realistic path forward.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Your data stays on this device. Nothing is uploaded or shared.</span>
            </div>
          </div>

          {saved && (
            <div className="mb-6 rounded-lg border border-growth-200 bg-growth-50 px-4 py-3 text-sm text-growth-800">
              Biodata saved. Let&apos;s add your child.
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="card space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{currentStepData.title}</h2>
              <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {formSteps.length}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{currentStepData.subtitle}</p>

            {currentStepData.fields.map((field) => {
              if (field === "parentName") {
                return (
                  <div key={field}>
                    <label className="label" htmlFor="parentName">Your Full Name</label>
                    <input id="parentName" type="text" className="input" value={form.parentName} onChange={(e) => update("parentName", e.target.value)} required />
                  </div>
                );
              }
              if (field === "email") {
                return (
                  <div key={field}>
                    <label className="label" htmlFor="email">Email Address</label>
                    <input id="email" type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                  </div>
                );
              }
              if (field === "phone") {
                return (
                  <div key={field}>
                    <label className="label" htmlFor="phone">Phone Number</label>
                    <input id="phone" type="tel" className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
                  </div>
                );
              }
              if (field === "location") {
                return (
                  <div key={field}>
                    <label className="label" htmlFor="location">State / City</label>
                    <input id="location" type="text" className="input" value={form.location} onChange={(e) => update("location", e.target.value)} required />
                  </div>
                );
              }
              if (field === "numberOfChildren") {
                return (
                  <div key={field}>
                    <label className="label" htmlFor="numberOfChildren">Number of Children</label>
                    <input id="numberOfChildren" type="number" min="1" className="input" value={form.numberOfChildren} onChange={(e) => update("numberOfChildren", e.target.value)} required />
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
                <div className="flex-1 space-y-3">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Privacy note:</span>{" "}
                      The information you provide here is stored only in your browser and is used solely for your personal planning experience.
                      It is not shared with third parties, and you remain in control of your data throughout.
                    </p>
                  </div>
                  <label className="flex items-start gap-3 rounded-lg border border-border bg-white p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      I have read the privacy note and agree that my data will be used only for my personal planning experience.
                    </span>
                  </label>
                  <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={loading || saved || !agreed}
                  >
                    {loading ? "Saving..." : saved ? "Saved" : "Add My Child"}
                  </button>
                  {!agreed && (
                    <p className="text-xs text-red-600 mt-2">You must agree to the privacy statement before continuing.</p>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
