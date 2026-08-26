"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { getChildren, getGoals, getPlans, getEvidence, getReflections, getAchievements, getAssessments, PILLARS, DEVELOPMENT_LEVELS, GOAL_STATUSES } from "@/lib/store";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.push("/signin");
      return;
    }
    setUser(u);
    const kids = getChildren(u.id);
    setChildren(kids);
    if (kids.length > 0) {
      const saved = localStorage.getItem("selectedChildId");
      const child = kids.find((c) => c.id === saved) || kids[0];
      setSelectedChild(child);
      loadChildData(child.id);
    }
  }, [router]);

  function loadChildData(childId: string) {
    setGoals(getGoals(childId));
    setPlans(getPlans(childId));
    setEvidence(getEvidence(childId));
    setReflections(getReflections(childId));
    setAchievements(getAchievements(childId));
    setAssessments(getAssessments(childId));
  }

  function handleChildChange(childId: string) {
    localStorage.setItem("selectedChildId", childId);
    const child = children.find((c) => c.id === childId);
    setSelectedChild(child);
    loadChildData(childId);
  }

  const activeGoals = goals.filter((g) => g.status === "IN_PROGRESS" || g.status === "NOT_STARTED");
  const recentEvidence = evidence.slice(-3).reverse();
  const pillarAssessments = PILLARS.slice(0, 5).map((p) => {
    const assessment = assessments.find((a) => a.pillar === p.value);
    const levelIndex = assessment ? DEVELOPMENT_LEVELS.findIndex((l) => l.value === assessment.level) : -1;
    return { ...p, level: assessment?.level || "BEGINNING", levelIndex };
  });

  function renderNextStepCard() {
    if (!selectedChild) return null;
    if (assessments.length === 0) {
      return (
        <div className="card border-l-4 border-l-primary">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Next step: Complete your child&apos;s development assessment</h3>
              <p className="text-sm text-muted-foreground mt-1">Understand current capabilities across all development domains.</p>
            </div>
            <Link href="/dashboard/assess" className="btn-primary whitespace-nowrap">Complete Assessment</Link>
          </div>
        </div>
      );
    }
    if (activeGoals.length === 0) {
      return (
        <div className="card border-l-4 border-l-growth-600">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Next step: Choose three priority goals</h3>
              <p className="text-sm text-muted-foreground mt-1">Turn your assessment into focused, achievable goals.</p>
            </div>
            <Link href="/dashboard/goals" className="btn-primary whitespace-nowrap">Set Goals</Link>
          </div>
        </div>
      );
    }
    if (plans.length === 0) {
      return (
        <div className="card border-l-4 border-l-gold-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Next step: Build your first plan</h3>
              <p className="text-sm text-muted-foreground mt-1">Organise activities into a weekly or monthly timetable.</p>
            </div>
            <Link href="/dashboard/plan/weekly" className="btn-primary whitespace-nowrap">Build Plan</Link>
          </div>
        </div>
      );
    }
    if (evidence.length === 0) {
      return (
        <div className="card border-l-4 border-l-purple-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Next step: Add evidence of growth</h3>
              <p className="text-sm text-muted-foreground mt-1">Document what your child has accomplished.</p>
            </div>
            <Link href="/dashboard/evidence" className="btn-primary whitespace-nowrap">Add Evidence</Link>
          </div>
        </div>
      );
    }
    return (
      <div className="card border-l-4 border-l-emerald-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Keep the momentum going</h3>
            <p className="text-sm text-muted-foreground mt-1">Review progress, add new evidence or explore activities.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/activities" className="btn-outline whitespace-nowrap">Explore Activities</Link>
            <Link href="/dashboard/reflections/parent-review" className="btn-primary whitespace-nowrap">Weekly Review</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">Track your family&apos;s development journey</p>
        </div>
        {children.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="label mb-0">Child:</label>
            <select
              value={selectedChild?.id || ""}
              onChange={(e) => handleChildChange(e.target.value)}
              className="input w-auto"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} — Age {child.age}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!selectedChild ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No children added yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add your first child to start tracking their development journey across LEARN, LIVE, LEAD, EARN and SERVE.
          </p>
          <Link href="/dashboard/children" className="btn-primary">
            Add Your First Child
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {renderNextStepCard()}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pillarAssessments.map((pillar) => (
              <div key={pillar.value} className="pillar-card">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{pillar.label}</div>
                <div className="text-sm font-semibold">{pillar.level.replace(/_/g, " ")}</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.max(((pillar.levelIndex + 1) / 5) * 100, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title">Active Goals</h2>
                  <Link href="/dashboard/goals" className="text-sm text-primary hover:underline font-medium">
                    View all
                  </Link>
                </div>
                {activeGoals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active goals yet.</p>
                    <Link href="/dashboard/assess" className="text-primary hover:underline text-sm mt-1 inline-block">
                      Complete assessment and set goals
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeGoals.slice(0, 5).map((goal) => (
                      <div key={goal.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">{getPillarLabel(goal.pillar)}</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${GOAL_STATUSES.find((s) => s.value === goal.status)?.color || "bg-gray-100"}`}>
                              {GOAL_STATUSES.find((s) => s.value === goal.status)?.label || goal.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">{goal.goalText}</p>
                          <p className="text-xs text-muted-foreground mt-1">{goal.behaviour}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title">Recent Evidence</h2>
                  <Link href="/dashboard/evidence" className="text-sm text-primary hover:underline font-medium">
                    View all
                  </Link>
                </div>
                {recentEvidence.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground text-sm">No evidence recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentEvidence.map((item) => (
                      <div key={item.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">{item.type}</span>
                          <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm">{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h2 className="section-title mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Link href="/dashboard/assess" className="btn-outline w-full justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16v-3"/><path d="M11 16V8"/><path d="M15 16v-5"/><path d="M19 16v-9"/></svg>
                    Assess Development
                  </Link>
                  <Link href="/dashboard/goals" className="btn-outline w-full justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    Set Goals
                  </Link>
                  <Link href="/dashboard/activities" className="btn-outline w-full justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Plan Activities
                  </Link>
                  <Link href="/dashboard/evidence" className="btn-outline w-full justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Add Evidence
                  </Link>
                  <Link href="/dashboard/reports" className="btn-outline w-full justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    Generate Report
                  </Link>
                </div>
              </div>

              <div className="card">
                <h2 className="section-title mb-3">Development Cycle</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                  {["ASSESS", "PLAN", "ACT", "TRACK", "REVIEW", "IMPROVE", "CONTINUE"].map((step, idx) => (
                    <span key={step} className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 text-primary px-2 py-1">{step}</span>
                      {idx < 6 && <span className="text-muted-foreground">→</span>}
                    </span>
                  ))}
                </div>
              </div>

              {achievements.length > 0 && (
                <div className="card">
                  <h2 className="section-title mb-3">Achievements</h2>
                  <div className="flex flex-wrap gap-2">
                    {achievements.map((a) => (
                      <span key={a.id} className="safety-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                        {a.badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPillarLabel(pillar: string): string {
  const found = PILLARS.find((p) => p.value === pillar);
  return found?.label || pillar;
}
