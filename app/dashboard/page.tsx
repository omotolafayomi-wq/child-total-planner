"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getOnboardingState as getStoreOnboardingState } from "@/lib/store";
import { getChildren, getGoals, getPlans, getEvidence, getReflections, getAchievements, getAssessments, PILLARS, DEVELOPMENT_LEVELS, GOAL_STATUSES, WORKFLOW_STEPS } from "@/lib/store";

export default function DashboardPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState<typeof WORKFLOW_STEPS[number]>("ASSESS");
  const [showNextStepPopup, setShowNextStepPopup] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("welcome") === "1";

  useEffect(() => {
    if (isNewUser) {
      router.replace("/dashboard", { scroll: false });
    }
  }, [isNewUser, router]);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("tour_seen")) {
      const timer = setTimeout(() => {
        setShowNextStepPopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const onboarding = getStoreOnboardingState();
    if (!onboarding) {
      setLoading(false);
      return;
    }
    const kids = getChildren(onboarding.parentId);
    setChildren(kids);
    if (kids.length > 0) {
      const saved = localStorage.getItem("selectedChildId");
      const child = kids.find((c) => c.id === saved) || kids[0];
      setSelectedChild(child);
      loadChildData(child.id);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!selectedChild && children.length > 0) {
      const child = children[0];
      setSelectedChild(child);
      localStorage.setItem("selectedChildId", child.id);
      loadChildData(child.id);
    }
  }, [children, selectedChild]);

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

  function getNextStepRecommendation() {
    if (!selectedChild) {
      return {
        title: "Add Your Child",
        description: "Start by adding your child's profile",
        link: "/onboarding/child",
        buttonText: "Add Child"
      };
    }

    const hasAssessment = assessments.some(a => PILLARS.slice(0,5).some(p => p.value === a.pillar));
    if (!hasAssessment) {
      return {
        title: "Start Assessment",
        description: "Assess your child's current capabilities",
        link: "/dashboard/assess",
        buttonText: "Assess Now"
      };
    }

    const hasPlan = plans.length > 0;
    if (!hasPlan) {
      return {
        title: "Create Plan",
        description: "Turn assessment into a development plan",
        link: "/onboarding/plan",
        buttonText: "Create Plan"
      };
    }

    const hasGoals = activeGoals.length > 0;
    if (!hasGoals) {
      return {
        title: "Set Goals",
        description: "Set development goals for your child",
        link: "/dashboard/goals",
        buttonText: "Set Goals"
      };
    }

    const hasEvidence = evidence.length > 0;
    if (!hasEvidence) {
      return {
        title: "Add Evidence",
        description: "Document your child's progress",
        link: "/dashboard/evidence",
        buttonText: "Add Evidence"
      };
    }

    return {
      title: "Keep Going",
      description: "Continue the development cycle",
      link: "/dashboard/activities",
      buttonText: "Explore Activities"
    };
  }

  const nextStep = getNextStepRecommendation();

  const activeGoals = goals.filter((g) => g.status === "IN_PROGRESS" || g.status === "NOT_STARTED");
  const recentEvidence = evidence.slice(-3).reverse();
  const pillarAssessments = PILLARS.slice(0, 5).map((p) => {
    const assessment = assessments.find((a) => a.pillar === p.value);
    const levelIndex = assessment ? DEVELOPMENT_LEVELS.findIndex((l) => l.value === assessment.level) : -1;
    return { ...p, level: assessment?.level || "BEGINNING", levelIndex };
  });

  useEffect(() => {
    if (!selectedChild) {
      setCurrentWorkflowStep("ASSESS");
      return;
    }
    const hasAssessment = assessments.some(a => PILLARS.slice(0,5).some(p => p.value === a.pillar));
    const hasPlan = plans.length > 0;
    const hasGoals = activeGoals.length > 0;
    const hasEvidence = evidence.length > 0;
    const hasReflection = reflections.length > 0;

    if (!hasAssessment) {
      setCurrentWorkflowStep("ASSESS");
    } else if (!hasPlan) {
      setCurrentWorkflowStep("PLAN");
    } else if (!hasGoals) {
      setCurrentWorkflowStep("ACT");
    } else if (!hasEvidence) {
      setCurrentWorkflowStep("TRACK");
    } else if (!hasReflection) {
      setCurrentWorkflowStep("REVIEW");
    } else {
      setCurrentWorkflowStep("IMPROVE");
    }
  }, [selectedChild, assessments, plans, activeGoals, evidence, reflections]);

  function renderNextStepCard() {
    if (!selectedChild) {
      return (
        <div className="card border-l-4 border-l-primary">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Your next step is to add your first child.</h3>
              <p className="text-sm text-muted-foreground mt-1">Start by adding a child profile to begin their development journey.</p>
            </div>
            <Link href="/onboarding/child" className="btn-primary whitespace-nowrap">Add Your First Child</Link>
          </div>
        </div>
      );
    }

    switch (currentWorkflowStep) {
      case "ASSESS":
        return (
          <div className="card border-l-4 border-l-primary">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Start Assessment</h3>
                <p className="text-sm text-muted-foreground mt-1">Assess your child's current capabilities across all development domains.</p>
              </div>
              <Link href="/dashboard/assess" className="btn-primary whitespace-nowrap">Assess Now</Link>
            </div>
          </div>
        );
      case "PLAN":
        return (
          <div className="card border-l-4 border-l-gold-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Create Development Plan</h3>
                <p className="text-sm text-muted-foreground mt-1">Turn your assessment into a structured development plan.</p>
              </div>
              <Link href="/onboarding/plan" className="btn-primary whitespace-nowrap">Create Plan</Link>
            </div>
          </div>
        );
      case "ACT":
        return (
          <div className="card border-l-4 border-l-growth-600">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Set Development Goals</h3>
                <p className="text-sm text-muted-foreground mt-1">Set clear development goals for your child based on the plan.</p>
              </div>
              <Link href="/dashboard/goals" className="btn-primary whitespace-nowrap">Set Goals</Link>
            </div>
          </div>
        );
      case "TRACK":
        return (
          <div className="card border-l-4 border-l-purple-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Add Evidence</h3>
                <p className="text-sm text-muted-foreground mt-1">Document your child's progress with photos, videos, or notes.</p>
              </div>
              <Link href="/dashboard/evidence" className="btn-primary whitespace-nowrap">Add Evidence</Link>
            </div>
          </div>
        );
      case "REVIEW":
        return (
          <div className="card border-l-4 border-l-emerald-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Weekly Review</h3>
                <p className="text-sm text-muted-foreground mt-1">Reflect on the week's progress and plan adjustments.</p>
              </div>
              <Link href="/dashboard/reflections/parent-review" className="btn-primary whitespace-nowrap">Review Progress</Link>
            </div>
          </div>
        );
      case "IMPROVE":
      case "CONTINUE":
        return (
          <div className="card border-l-4 border-l-blue-500">
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
      default:
        return null;
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{selectedChild ? `Viewing ${selectedChild.name}'s progress` : 'Add a child to get started'}</p>
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

      {isNewUser && (
        <div className="card border-l-4 border-l-primary bg-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-primary">Welcome to Total Child!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Get started by adding your child and building their development profile.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/onboarding/child" className="btn-primary whitespace-nowrap">
                Add Your Child
              </Link>
              <Link href="/dashboard/activities" className="btn-outline whitespace-nowrap">
                Explore First
              </Link>
            </div>
          </div>
        </div>
      )}

      {!selectedChild ? (
        <div className="card text-center py-8 sm:py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No children added yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto px-4">
            Add your first child to start tracking their development journey across LEARN, LIVE, LEAD, EARN and SERVE.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
            <Link href="/onboarding/child" className="btn-primary w-full sm:w-auto">
              Add Your First Child
            </Link>
            <Link href="/dashboard/activities" className="btn-outline w-full sm:w-auto">
              Explore Activities
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {(() => {
            const onboarding = getStoreOnboardingState();
            const isOnboardingComplete = onboarding?.step === "complete";
            return isOnboardingComplete && selectedChild ? (
              <div className="card border-l-4 border-l-primary bg-primary/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-primary">Start My Child's Developmental Plan</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Begin with an assessment to understand your child's current capabilities.
                    </p>
                  </div>
                  <Link href="/dashboard/assess" className="btn-primary whitespace-nowrap">
                    Start Assessment
                  </Link>
                </div>
              </div>
            ) : null;
          })()}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Your data stays on this device. Nothing is uploaded or shared.</span>
          </div>
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
                <h2 className="section-title mb-4">Development Cycle</h2>
                <div className="flex items-center justify-between overflow-x-auto pb-2">
                  {WORKFLOW_STEPS.map((step, idx) => {
                    const isActive = currentWorkflowStep === step;
                    const isCompleted = WORKFLOW_STEPS.indexOf(currentWorkflowStep) > idx;
                    return (
                      <div key={step} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                            isCompleted ? "bg-growth-600 border-growth-600 text-white" :
                            isActive ? "bg-primary border-primary text-white" :
                            "bg-white border-border text-muted-foreground"
                          }`}>
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          <span className={`text-xs mt-1 font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                            {step}
                          </span>
                        </div>
                        {idx < 6 && (
                          <div className={`w-8 h-0.5 mx-1 ${isCompleted ? "bg-growth-600" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
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
      <div className="fixed right-4 bottom-20 z-40">
        <button
          onClick={() => setShowNextStepPopup(!showNextStepPopup)}
          className="w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
          aria-label="What's next"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        </button>

        {showNextStepPopup && (
          <div className="absolute right-16 bottom-16 w-72 bg-white rounded-lg shadow-xl border border-border p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm">Welcome! Your next step:</h4>
              <button
                onClick={() => setShowNextStepPopup(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="text-sm font-medium text-primary mb-1">{nextStep.title}</p>
            <p className="text-xs text-muted-foreground mb-3">{nextStep.description}</p>
            <Link href={nextStep.link} className="btn-primary w-full text-center text-sm mb-3">
              {nextStep.buttonText}
            </Link>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={typeof window !== "undefined" && sessionStorage.getItem("tour_seen") === "true"}
                onChange={(e) => {
                  if (e.target.checked) {
                    sessionStorage.setItem("tour_seen", "true");
                  } else {
                    sessionStorage.removeItem("tour_seen");
                  }
                }}
                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
              />
              Don&apos;t show this guide again
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function getPillarLabel(pillar: string): string {
  const found = PILLARS.find((p) => p.value === pillar);
  return found?.label || pillar;
}

