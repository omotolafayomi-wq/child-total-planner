"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOnboardingState } from "@/lib/store";
import { getChildren, ACTIVITY_LIBRARY, PILLARS } from "@/lib/store";

const PILLAR = "LEARN";
const MODULE_DESCRIPTION = "Build knowledge, literacy, research, critical thinking and communication skills.";
const GUIDANCE = [
  "Create a daily reading routine — even 15 minutes matters.",
  "Ask open-ended questions that encourage thinking, not just answers.",
  "Connect learning to real life: market maths, cooking fractions, family budgeting.",
  "Celebrate effort and progress, not just grades.",
  "Visit libraries, museums, and educational sites together.",
  "Encourage curiosity — when you don't know something, research together.",
];

export default function LearnModulePage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const router = useRouter();

  const activities = ACTIVITY_LIBRARY.filter((a) => a.pillar === PILLAR);
  const pillarInfo = PILLARS.find((p) => p.value === PILLAR);

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
        const saved = localStorage.getItem("selectedChildId");
        setSelectedChildId(saved || kids[0].id);
      }
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{pillarInfo?.label || "Learn"}</h1>
          <p className="text-muted-foreground">{MODULE_DESCRIPTION}</p>
        </div>
        {children.length > 1 && (
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

      <div className="card">
        <h2 className="section-title mb-3">Parent Guidance</h2>
        <ul className="space-y-2">
          {GUIDANCE.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="section-title mb-3">Suggested Activities</h2>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No specific activities yet. Check the Activities page for ideas.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-lg border border-border p-3">
                <h3 className="font-semibold">{activity.title}</h3>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

