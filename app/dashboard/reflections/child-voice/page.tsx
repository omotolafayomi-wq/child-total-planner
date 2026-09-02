"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOnboardingState } from "@/lib/store";
import { getChildren, getReflections, createReflection } from "@/lib/store";

const CHILD_VOICE_QUESTIONS = [
  { key: "q1", label: "What did you enjoy learning this week?", placeholder: "What activities or topics made you happy?" },
  { key: "q2", label: "What was hard for you?", placeholder: "What did you find difficult or frustrating?" },
  { key: "q3", label: "What do you want to get better at?", placeholder: "What skill or subject would you like to improve?" },
  { key: "q4", label: "What are you proud of?", placeholder: "What accomplishment makes you feel good?" },
  { key: "q5", label: "What would you like to do next?", placeholder: "What do you want to learn or try next week?" },
];

export default function ChildVoicePage() {
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
        setReflections(getReflections(child.id).filter((r) => r.type === "childVoice"));
      }
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    setReflections(getReflections(childId).filter((r) => r.type === "childVoice"));
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
      type: "childVoice",
      answers,
      date: new Date().toISOString(),
    });
    setReflections(getReflections(selectedChildId).filter((r) => r.type === "childVoice"));
    setAnswers({});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Child Voice</h1>
          <p className="text-muted-foreground">Capture your child&apos;s own reflections on their development</p>
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
          <p className="text-muted-foreground">Select a child to record reflections.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="section-title mb-4">This Week&apos;s Reflection</h2>
            {saved && (
              <div className="mb-4 rounded-lg bg-growth/10 text-growth px-4 py-2 text-sm font-medium">
                Reflection saved successfully!
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {CHILD_VOICE_QUESTIONS.map((q) => (
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
              <button type="submit" className="btn-primary">Save Reflection</button>
            </form>
          </div>

          <div>
            <h2 className="section-title mb-4">Past Child Voice Entries</h2>
            {reflections.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-muted-foreground">No child voice reflections yet. Complete the form above to add the first one.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...reflections].reverse().map((reflection) => (
                  <div key={reflection.id} className="card">
                    <div className="text-xs text-muted-foreground mb-3">{new Date(reflection.date).toLocaleDateString()}</div>
                    <div className="space-y-3">
                      {CHILD_VOICE_QUESTIONS.map((q) => (
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

