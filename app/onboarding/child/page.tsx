"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOnboardingState as getStoreOnboardingState, saveOnboardingState as saveStoreOnboardingState, createChild, Child } from "@/lib/store";

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

type FormData = {
  name: string;
  preferredName: string;
  age: string;
  dateOfBirth: string;
  schoolLevel: string;
  gender: string;
  schoolName: string;
  location: string;
  interests: string;
  hobbies: string;
  strengths: string;
  skills: string;
  areasForSupport: string;
};

const formSteps = [
  {
    title: "Basic Information",
    subtitle: "Let&apos;s start with the essentials.",
    fields: ["name", "preferredName", "age", "dateOfBirth"] as (keyof FormData)[],
  },
  {
    title: "School Details",
    subtitle: "Help us understand their learning environment.",
    fields: ["schoolLevel", "gender", "schoolName", "location"] as (keyof FormData)[],
  },
  {
    title: "Interests & Strengths",
    subtitle: "Tell us what makes them unique.",
    fields: ["interests", "hobbies", "strengths", "skills", "areasForSupport"] as (keyof FormData)[],
  },
] as const;

export default function OnboardingChildPage() {
  const router = useRouter();
  const existing = getStoreOnboardingState();

  const [form, setForm] = useState<FormData>({
    name: "",
    preferredName: "",
    age: "",
    dateOfBirth: "",
    schoolLevel: "",
    gender: "",
    schoolName: "",
    location: "",
    interests: "",
    hobbies: "",
    strengths: "",
    skills: "",
    areasForSupport: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const existing = getStoreOnboardingState();
    if (!existing) {
      router.push("/onboarding/welcome");
    }
  }, [router]);

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateStep(stepIndex: number): boolean {
    setError("");
    if (stepIndex === 0) {
      if (!form.name.trim()) {
        setError("Please enter the child's full name.");
        return false;
      }
      const ageNum = Number(form.age);
      if (!form.age || isNaN(ageNum) || ageNum < 3 || ageNum > 18) {
        setError("Please enter a valid age between 3 and 18.");
        return false;
      }
    }
    if (stepIndex === 1) {
      if (!form.schoolLevel.trim()) {
        setError("Please enter the school level.");
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
    if (!form.name.trim()) {
      setError("Please enter the child's full name.");
      return;
    }
    const ageNum = Number(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 3 || ageNum > 18) {
      setError("Please enter a valid age between 3 and 18.");
      return;
    }
    setLoading(true);
    try {
      const child: Child = createChild({
        parentId: existing!.parentId,
        name: form.name.trim(),
        age: ageNum,
        schoolLevel: form.schoolLevel.trim() || "Not specified",
        gender: form.gender.trim() || undefined,
        interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
        strengths: form.strengths.split(",").map((s) => s.trim()).filter(Boolean),
        areasForSupport: form.areasForSupport.split(",").map((s) => s.trim()).filter(Boolean),
      });
      saveStoreOnboardingState({
        step: "profile",
        parentId: existing!.parentId,
        childId: child.id,
        childData: form as any,
        startedAt: existing?.startedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => {
        router.push("/onboarding/profile");
      }, 600);
    } catch (err) {
      setError("We couldn't save that just now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAndAddAnother(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Please enter the child's full name.");
      return;
    }
    const ageNum = Number(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 3 || ageNum > 18) {
      setError("Please enter a valid age between 3 and 18.");
      return;
    }
    setLoading(true);
    try {
      createChild({
        parentId: existing!.parentId,
        name: form.name.trim(),
        age: ageNum,
        schoolLevel: form.schoolLevel.trim() || "Not specified",
        gender: form.gender.trim() || undefined,
        interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
        strengths: form.strengths.split(",").map((s) => s.trim()).filter(Boolean),
        areasForSupport: form.areasForSupport.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setForm({
        name: "",
        preferredName: "",
        age: "",
        dateOfBirth: "",
        schoolLevel: "",
        gender: "",
        schoolName: "",
        location: "",
        interests: "",
        hobbies: "",
        strengths: "",
        skills: "",
        areasForSupport: "",
      });
      setCurrentStep(0);
      setSaved(false);
    } catch (err) {
      setError("We couldn't save that just now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!existing) {
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
          <Link href="/dashboard" className="text-lg font-bold text-primary tracking-tight">
            Total Child
          </Link>
        </div>
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
        <ProgressIndicator currentStep="child" />
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Add Child / Ward</h1>
            <p className="text-muted-foreground">Tell us about the child you&apos;ll be planning for.</p>
          </div>

          {saved && (
            <div className="mb-6 rounded-lg border border-growth-200 bg-growth-50 px-4 py-3 text-sm text-growth-800">
              Child profile saved. Redirecting...
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentStepData.fields.map((field) => {
                if (field === "name") {
                  return (
                    <div key={field} className="sm:col-span-2">
                      <label className="label" htmlFor="name">Full Name *</label>
                      <input id="name" type="text" className="input" value={form.name} onChange={(e) => update("name", e.target.value)} required />
                    </div>
                  );
                }
                if (field === "preferredName") {
                  return (
                    <div key={field}>
                      <label className="label" htmlFor="preferredName">Preferred Name</label>
                      <input id="preferredName" type="text" className="input" value={form.preferredName} onChange={(e) => update("preferredName", e.target.value)} />
                    </div>
                  );
                }
                if (field === "age") {
                  return (
                    <div key={field}>
                      <label className="label" htmlFor="age">Age *</label>
                      <input id="age" type="number" min="3" max="18" className="input" value={form.age} onChange={(e) => update("age", e.target.value)} required />
                    </div>
                  );
                }
                if (field === "dateOfBirth") {
                  return (
                    <div key={field}>
                      <label className="label" htmlFor="dateOfBirth">Date of Birth</label>
                      <input id="dateOfBirth" type="date" className="input" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} />
                    </div>
                  );
                }
                if (field === "schoolLevel") {
                  return (
                    <div key={field} className="sm:col-span-2">
                      <label className="label" htmlFor="schoolLevel">School Level / Class *</label>
                      <input id="schoolLevel" type="text" className="input" value={form.schoolLevel} onChange={(e) => update("schoolLevel", e.target.value)} required />
                    </div>
                  );
                }
                if (field === "gender") {
                  return (
                    <div key={field}>
                      <label className="label" htmlFor="gender">Gender</label>
                      <select id="gender" className="input" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                        <option value="">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  );
                }
                if (field === "schoolName") {
                  return (
                    <div key={field}>
                      <label className="label" htmlFor="schoolName">School Name</label>
                      <input id="schoolName" type="text" className="input" value={form.schoolName} onChange={(e) => update("schoolName", e.target.value)} />
                    </div>
                  );
                }
                if (field === "location") {
                  return (
                    <div key={field}>
                      <label className="label" htmlFor="location">State / Location</label>
                      <input id="location" type="text" className="input" value={form.location} onChange={(e) => update("location", e.target.value)} />
                    </div>
                  );
                }
                if (field === "interests") {
                  return (
                    <div key={field} className="sm:col-span-2">
                      <label className="label" htmlFor="interests">Interests</label>
                      <input id="interests" type="text" className="input" placeholder="e.g. Reading, Football, Music" value={form.interests} onChange={(e) => update("interests", e.target.value)} />
                    </div>
                  );
                }
                if (field === "hobbies") {
                  return (
                    <div key={field} className="sm:col-span-2">
                      <label className="label" htmlFor="hobbies">Hobbies</label>
                      <input id="hobbies" type="text" className="input" placeholder="e.g. Drawing, Coding, Dancing" value={form.hobbies} onChange={(e) => update("hobbies", e.target.value)} />
                    </div>
                  );
                }
                if (field === "strengths") {
                  return (
                    <div key={field} className="sm:col-span-2">
                      <label className="label" htmlFor="strengths">Strengths</label>
                      <input id="strengths" type="text" className="input" placeholder="e.g. Creative, Good with numbers, Empathetic" value={form.strengths} onChange={(e) => update("strengths", e.target.value)} />
                    </div>
                  );
                }
                if (field === "skills") {
                  return (
                    <div key={field} className="sm:col-span-2">
                      <label className="label" htmlFor="skills">Existing Skills</label>
                      <input id="skills" type="text" className="input" placeholder="e.g. Can cook simple meals, Reads fluently" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
                    </div>
                  );
                }
                if (field === "areasForSupport") {
                  return (
                    <div key={field} className="sm:col-span-2">
                      <label className="label" htmlFor="areasForSupport">Areas Requiring Support</label>
                      <input id="areasForSupport" type="text" className="input" placeholder="e.g. Time management, Public speaking" value={form.areasForSupport} onChange={(e) => update("areasForSupport", e.target.value)} />
                    </div>
                  );
                }
                return null;
              })}
            </div>

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
                    {loading ? "Saving..." : saved ? "Saved" : "Save & Create Profile"}
                  </button>
                  <button type="button" onClick={handleSaveAndAddAnother} className="btn-outline flex-1" disabled={loading}>
                    Save & Add Another Child
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

