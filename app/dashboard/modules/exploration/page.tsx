"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, ACTIVITY_LIBRARY, PILLARS, SAFETY_LEVELS } from "@/lib/store";

const PILLAR = "EXPLORATION";
const MODULE_DESCRIPTION = "Explore the world through visits, nature, and new experiences.";
const GUIDANCE = [
  "Encourage curiosity about the world and how things work.",
  "Visit local places: markets, parks, historical sites, businesses.",
  "Prepare questions before visits and reflect afterwards.",
  "Document observations through photos, drawings, or journals.",
  "Connect exploration to learning across all pillars.",
];

export default function ExplorationPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const router = useRouter();

  const activities = ACTIVITY_LIBRARY.filter((a) => a.pillar === PILLAR);
  const pillarInfo = PILLARS.find((p) => p.value === PILLAR);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) {
        router.push("/");
        return;
      }
      setUser(u);
      const kids = getChildren(u.id);
      setChildren(kids);
      if (kids.length > 0) {
        const saved = localStorage.getItem("selectedChildId");
        setSelectedChildId(saved || kids[0].id);
      }
    });
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
          <h1 className="text-2xl font-bold">Exploration</h1>
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
        <h2 className="section-title mb-3">Guidance</h2>
        <ul className="space-y-2">
          {GUIDANCE.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="section-title mb-4">Activities</h2>
        {activities.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-muted-foreground">No activities in this module yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => (
              <div key={activity.id} className="pillar-card">
                <h3 className="font-semibold text-sm">{activity.title}</h3>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${pillarInfo?.color || "bg-gray-100"}`}>
                    {pillarInfo?.label}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${activity.safetyLevel === "AGE_APPROPRIATE" ? "bg-green-100 text-green-800" : activity.safetyLevel === "ADULT_GUIDANCE" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                    {activity.safetyLevel.replace(/_/g, " ")}
                  </span>
                </div>
                {activity.estimatedCost && <p className="text-xs text-muted-foreground mt-2">Cost: {activity.estimatedCost}</p>}
                {activity.timeEstimate && <p className="text-xs text-muted-foreground">Time: {activity.timeEstimate}</p>}
                {activity.lowCostAlternative && <p className="text-xs text-muted-foreground italic mt-1">Low-cost: {activity.lowCostAlternative}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Coming soon:</span> Exploration logs, visit planners, and discovery challenges will be added.
        </p>
      </div>
    </div>
  );
}

