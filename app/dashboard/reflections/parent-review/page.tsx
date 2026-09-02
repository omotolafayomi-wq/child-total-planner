"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOnboardingState } from "@/lib/store";
import { getChildren, getReflections, createReflection } from "@/lib/store";

const PARENT_REVIEW_QUESTIONS = [
  { key: "q1", label: "What progress have you noticed this week?", placeholder: "Describe specific improvements or changes you observed." },
  { key: "q2", label: "What challenges did your child face?", placeholder: "What was difficult? How did they respond?" },
  { key: "q3", label: "How did your child engage with planned activities?", placeholder: "Were they enthusiastic, reluctant, focused, distracted?" },
  { key: "q4", label: "What support did you provide?", placeholder: "How did you help? What scaffolding worked?" },
  { key: "q5", label: "What will you focus on next week?", placeholder: "What adjustments or new goals are you considering?" },
];

export default function ParentReviewPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [reflections, setReflections] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onboarding = getOnboardingState();
      if (!onboarding) {
        router.replace("/onboarding/welcome");
        return;
      }
      setUser({ id: onboarding.parentId });
      const kids = getChildren(onboarding.parentId);
      setChildren(kids);
      if (kids.length > 0) {
        const savedChild = localStorage.getItem("selectedChildId");
        const child = kids.find((c) => c.id === savedChild) || kids[0];
        setSelectedChildId(child.id);
        setReflections(getReflections(child.id).filter((r) => r.type === "parentReview"));
      }
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    setReflections(getReflections(childId).filter((r) => r.type === "parentReview"));
    setAnswers({});
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChildId) return;
    const hasAnswers = Object.values(answers).some((a) => a.trim());
    if (!hasAnswers) return;
    createReflection({
      childId: selectedChildId,
      type: "parentReview",
      answers,
      date: new Date().toISOString(),
    });
    setReflections(getReflections(selectedChildId).filter((r) => r.type === "parentReview"));
    setAnswers({});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Parent Review</h1>
          <p className="text-muted-foreground">Weekly review of your child&apos;s development progress</p>
        </div>
        {children.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="label mb-0">Child:</label>
            <select value={selectedChildId} onChange={(e) => handleChildChange(e.target.value)} className="input w-auto">
              {children.map((child) => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!selectedChildId ? (
        <div className="card text-center py-12">
          <p className="text-muted-foreground">Select a child to record a review.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="section-title mb-4">Weekly Parent Review</h2>
            {saved && (
              <div className="mb-4 rounded-lg bg-growth/10 text-growth px-4 py-2 text-sm font-medium">
                Review saved successfully!
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {PARENT_REVIEW_QUESTIONS.map((q) => (
                <div key={q.key}>
                  <label className="label">{q.label}</label>
                  <textarea
                    value={answers[q.key] || ""}
                    onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                    className="input min-h-[60px]"
                    placeholder={q.placeholder}
                  />
                </div>
              ))}
              <button type="submit" className="btn-primary">Save Review</button>
            </form>
          </div>

          <div>
            <h2 className="section-title mb-4">Past Parent Reviews</h2>
            {reflections.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-muted-foreground">No parent reviews yet. Complete the form above to add the first one.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...reflections].reverse().map((reflection) => (
                  <div key={reflection.id} className="card">
                    <div className="text-xs text-muted-foreground mb-3">{new Date(reflection.date).toLocaleDateString()}</div>
                    <div className="space-y-3">
                      {PARENT_REVIEW_QUESTIONS.map((q) => (
                        reflection.answers[q.key] ? (
                          <div key={q.key}>
                            <p className="text-sm font-medium text-muted-foreground">{q.label}</p>
                            <p className="text-sm">{reflection.answers[q.key]}</p>
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

