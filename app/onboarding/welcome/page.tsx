"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, getCurrentUser } from "@/lib/auth";
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

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u) {
        const kids = getChildren(u.id);
        if (kids.length > 0) {
          router.push("/dashboard");
        } else {
          const existing = getStoreOnboardingState(u.id);
          if (existing && existing.step !== "welcome") {
            router.push(`/onboarding/${existing.step}`);
          }
        }
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(email, name, password);
      if (result.user) {
        const state = {
          step: "welcome" as const,
          parentId: result.user.id,
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveStoreOnboardingState(state);
        setCreated(true);
        setTimeout(() => {
          router.push("/onboarding/child");
        }, 600);
      }
    } catch (err) {
      setError((err as Error)?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              Welcome. Let&apos;s build a practical development journey around your child — one realistic goal, meaningful activity and useful experience at a time.
            </p>
            <p className="text-muted-foreground mb-8">
              You do not need to plan everything at once. We&apos;ll help you understand your child&apos;s current capabilities, identify priorities and build a realistic path forward.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Create Your Account</h2>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}
            {created && (
              <div className="mb-4 rounded-lg border border-growth-200 bg-growth-50 px-4 py-3 text-sm text-growth-800">
                Account created. Starting onboarding...
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="parentName">Your Full Name</label>
                <input id="parentName" type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="label" htmlFor="parentEmail">Email Address</label>
                <input id="parentEmail" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label" htmlFor="parentPassword">Password</label>
                <input id="parentPassword" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div>
                <label className="label" htmlFor="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading || created}>
                {loading ? "Creating account..." : created ? "Created" : "Add My Child"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
