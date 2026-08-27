"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChild, getAssessments, getGoals, getEvidence, getReflections, PILLARS, DEVELOPMENT_LEVELS, GOAL_STATUSES } from "@/lib/store";

export default function ChildDetailPage({ params }: { params: { id: string } }) {
  const [child, setChild] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) {
        router.push("/signin");
        return;
      }
      const c = getChild(params.id);
      if (!c || c.parentId !== u.id) {
        router.push("/dashboard/children");
        return;
      }
      setChild(c);
      setAssessments(getAssessments(c.id));
      setGoals(getGoals(c.id));
      setEvidence(getEvidence(c.id));
      setReflections(getReflections(c.id));
    });
  }, [params.id, router]);

  if (!child) return null;

  const primaryPillars = PILLARS.slice(0, 5);
  const activeGoals = goals.filter((g) => g.status === "IN_PROGRESS" || g.status === "NOT_STARTED");
  const recentReflections = reflections.slice(-3).reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/dashboard/children" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to children
            </Link>
          </div>
          <h1 className="text-2xl font-bold">{child.name}</h1>
          <p className="text-muted-foreground">Age {child.age} • {child.schoolLevel}</p>
        </div>
      </div>

      {child.interests.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {child.interests.map((interest: string) => (
              <span key={interest} className="rounded-full bg-muted px-3 py-1 text-sm">{interest}</span>
            ))}
          </div>
        </div>
      )}

      {child.strengths.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-2">Strengths</h3>
          <div className="flex flex-wrap gap-2">
            {child.strengths.map((strength: string) => (
              <span key={strength} className="rounded-full bg-growth/10 text-growth px-3 py-1 text-sm">{strength}</span>
            ))}
          </div>
        </div>
      )}

      {child.areasForSupport.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-2">Areas for Support</h3>
          <div className="flex flex-wrap gap-2">
            {child.areasForSupport.map((area: string) => (
              <span key={area} className="rounded-full bg-accent/10 text-accent-foreground px-3 py-1 text-sm">{area}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title mb-4">Development Assessment</h2>
          {assessments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No assessment completed yet.</p>
          ) : (
            <div className="space-y-3">
              {primaryPillars.map((pillar) => {
                const assessment = assessments.find((a) => a.pillar === pillar.value);
                const level = assessment?.level || "BEGINNING";
                const levelIndex = DEVELOPMENT_LEVELS.findIndex((l) => l.value === level);
                return (
                  <div key={pillar.value} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{pillar.label}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.max(((levelIndex + 1) / 5) * 100, 8)}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-24 text-right">{level.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/dashboard/assess" className="btn-outline w-full mt-4 justify-center">
            {assessments.length === 0 ? "Complete Assessment" : "Update Assessment"}
          </Link>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">Active Goals</h2>
          {activeGoals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active goals yet.</p>
          ) : (
            <div className="space-y-3">
              {activeGoals.slice(0, 5).map((goal) => (
                <div key={goal.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">{goal.pillar.replace(/_/g, " ")}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${GOAL_STATUSES.find((s) => s.value === goal.status)?.color || "bg-gray-100"}`}>
                      {GOAL_STATUSES.find((s) => s.value === goal.status)?.label || goal.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{goal.goalText}</p>
                  <p className="text-xs text-muted-foreground mt-1">{goal.behaviour}</p>
                </div>
              ))}
            </div>
          )}
          <Link href="/dashboard/goals" className="btn-outline w-full mt-4 justify-center">
            Manage Goals
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Recent Reflections</h2>
        {recentReflections.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reflections yet.</p>
        ) : (
          <div className="space-y-3">
            {recentReflections.map((reflection) => (
              <div key={reflection.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">{reflection.type === "childVoice" ? "Child Voice" : "Parent Review"}</span>
                  <span className="text-xs text-muted-foreground">{new Date(reflection.date).toLocaleDateString()}</span>
                </div>
                {Object.entries(reflection.answers).slice(0, 2).map(([q, a]) => (
                  <div key={q} className="text-sm mb-1">
                    <span className="font-medium">{q}:</span> {a as string}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <Link href="/dashboard/reflections" className="btn-outline w-full mt-4 justify-center">
          View Reflections
        </Link>
      </div>
    </div>
  );
}
