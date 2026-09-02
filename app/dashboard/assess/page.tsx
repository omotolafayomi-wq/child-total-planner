"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { getChildren, getAssessments, createAssessment, PILLARS, DEVELOPMENT_LEVELS } from "@/lib/store";
import BackButton from "@/components/BackButton";
import Breadcrumbs from "@/components/Breadcrumbs";

const PRIMARY_PILLARS = PILLARS.slice(0, 5);
const SUPPORTING_AREAS = PILLARS.slice(5);

export default function AssessPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [activeTab, setActiveTab] = useState<"primary" | "supporting">("primary");
  const [assessments, setAssessments] = useState<Record<string, { level: string; observations: string; supportNeeded: string }>>({});
  const [saved, setSaved] = useState(false);
  const router = useRouter();

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
        const savedChild = localStorage.getItem("selectedChildId");
        const child = kids.find((c) => c.id === savedChild) || kids[0];
        setSelectedChildId(child.id);
        loadAssessments(child.id);
      }
    });
  }, [router]);

  function loadAssessments(childId: string) {
    const items = getAssessments(childId);
    const map: Record<string, { level: string; observations: string; supportNeeded: string }> = {};
    items.forEach((a) => {
      map[a.pillar + "|" + a.area] = { level: a.level, observations: a.observations, supportNeeded: a.supportNeeded };
    });
    setAssessments(map);
  }

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    loadAssessments(childId);
  }

  function updateField(pillar: string, area: string, field: string, value: string) {
    setAssessments((prev) => ({
      ...prev,
      [pillar + "|" + area]: {
        ...(prev[pillar + "|" + area] || { level: "BEGINNING", observations: "", supportNeeded: "" }),
        [field]: value,
      },
    }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedChildId) return;
    Object.entries(assessments).forEach(([key, data]) => {
      const [pillar, area] = key.split("|");
      const existing = getAssessments(selectedChildId).find((a) => a.pillar === pillar && a.area === area);
      if (existing) {
        const { updateAssessment } = require("@/lib/store");
        updateAssessment(existing.id, { level: data.level as any, observations: data.observations, supportNeeded: data.supportNeeded });
      } else {
        createAssessment({
          childId: selectedChildId,
          pillar: pillar as any,
          area,
          level: data.level as any,
          observations: data.observations,
          supportNeeded: data.supportNeeded,
        });
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!user) return null;

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const currentAreas = activeTab === "primary" ? PRIMARY_PILLARS : SUPPORTING_AREAS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Development Planning Assessment</h1>
        <p className="text-muted-foreground">Assess current capabilities across all development domains</p>
      </div>

      {children.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted-foreground mb-4">Add a child first to complete the assessment.</p>
          <Link href="/dashboard/children" className="btn-primary">Add Child</Link>
        </div>
      ) : (
        <>
          <BackButton />
      <Breadcrumbs />
          <div className="flex items-center gap-3">
            <label className="label mb-0">Child:</label>
            <select value={selectedChildId} onChange={(e) => handleChildChange(e.target.value)} className="input w-auto">
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          {selectedChild && (
            <div className="flex items-center gap-2 border-b border-border">
              <button onClick={() => setActiveTab("primary")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "primary" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                Primary Pillars
              </button>
              <button onClick={() => setActiveTab("supporting")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "supporting" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                Supporting Areas
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {currentAreas.map((pillar) => {
              const key = pillar.value + "|" + pillar.label;
              const data = assessments[key] || { level: "BEGINNING", observations: "", supportNeeded: "" };
              return (
                <div key={pillar.value} className="card">
                  <h3 className="font-semibold mb-3">{pillar.label}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="label">Current Level</label>
                      <select value={data.level} onChange={(e) => updateField(pillar.value, pillar.label, "level", e.target.value)} className="input">
                        {DEVELOPMENT_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>{level.label} — {level.description}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Observations</label>
                      <textarea value={data.observations} onChange={(e) => updateField(pillar.value, pillar.label, "observations", e.target.value)} className="input min-h-[80px]" placeholder="What can the child do? What evidence have you seen?" />
                    </div>
                    <div>
                      <label className="label">Support Needed</label>
                      <textarea value={data.supportNeeded} onChange={(e) => updateField(pillar.value, pillar.label, "supportNeeded", e.target.value)} className="input min-h-[80px]" placeholder="What support does the child need to reach the next level?" />
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary">Save Assessment</button>
              {saved && <span className="text-sm text-growth">Assessment saved successfully!</span>}
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Next step: Turn your assessment into focused goals.</p>
              <Link href="/dashboard/goals" className="btn-outline">Set Goals</Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

