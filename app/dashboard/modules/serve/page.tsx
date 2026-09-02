"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, ACTIVITY_LIBRARY, PILLARS } from "@/lib/store";

const PILLAR = "SERVE";
const MODULE_DESCRIPTION = "Cultivate community participation, environmental responsibility and civic contribution.";
const GUIDANCE = [
  "Participate together in community clean-ups or neighbour help.",
  "Visit elderly relatives and community members regularly.",
  "Discuss local issues and how families can contribute positively.",
  "Practice environmental care: recycling, planting trees, reducing waste.",
  "Volunteer as a family at church, mosque, or community events.",
  "Teach that serving others builds character and community.",
];

export default function ServeModulePage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const router = useRouter();

  const activities = ACTIVITY_LIBRARY.filter((a) => a.pillar === PILLAR);
  const pillarInfo = PILLARS.find((p) => p.value === PILLAR);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) { router.push("/signin"); return; }
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
          <h1 className="text-2xl font-bold">{pillarInfo?.label || "Serve"}</h1>
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
