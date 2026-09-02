"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, getPlans, createPlan, updatePlan, ACTIVITY_LIBRARY, PILLARS, SAFETY_LEVELS } from "@/lib/store";
import BackButton from "@/components/BackButton";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ActivitiesPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [filterPillar, setFilterPillar] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planType, setPlanType] = useState<"weekly" | "monthly">("weekly");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [savedActivities, setSavedActivities] = useState<string[]>([]);
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
        const saved = localStorage.getItem("selectedChildId");
        const child = kids.find((c) => c.id === saved) || kids[0];
        setSelectedChildId(child.id);
        setPlans(getPlans(child.id));
      }
    });
  }, [router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedActivities");
      if (raw) setSavedActivities(JSON.parse(raw));
    } catch {
      setSavedActivities([]);
    }
  }, []);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    setPlans(getPlans(childId));
  }

  function toggleSave(activityId: string) {
    setSavedActivities((prev) => {
      const next = prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId];
      localStorage.setItem("savedActivities", JSON.stringify(next));
      return next;
    });
  }

  const filteredActivities = ACTIVITY_LIBRARY.filter((act) => {
    const matchesPillar = filterPillar === "ALL" || act.pillar === filterPillar;
    const matchesSearch = !searchQuery || act.title.toLowerCase().includes(searchQuery.toLowerCase()) || act.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPillar && matchesSearch;
  });

  function toggleActivity(activityId: string) {
    setSelectedActivities((prev) => (prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId]));
  }

  function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedChildId || selectedActivities.length === 0) return;
    const activities = ACTIVITY_LIBRARY.filter((a) => selectedActivities.includes(a.id));
    const startDate = new Date().toISOString().split("T")[0];
    const endDate = new Date(Date.now() + (planType === "weekly" ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const plan = createPlan({
      childId: selectedChildId,
      type: planType,
      startDate,
      endDate,
      entries: activities.map((act) => ({
        id: crypto.randomUUID(),
        planId: "",
        activityId: act.id,
        title: act.title,
        description: act.description,
        date: startDate,
        completed: false,
      })),
    });
    setPlans((prev) => [...prev, plan]);
    setSelectedActivities([]);
    setShowPlanForm(false);
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <BackButton />
      <Breadcrumbs />
          <h1 className="text-2xl font-bold">Activities</h1>
          <p className="text-muted-foreground">Discover development activities aligned to LEARN, LIVE, LEAD, EARN, SERVE and more</p>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input sm:max-w-xs"
        />
        <select value={filterPillar} onChange={(e) => setFilterPillar(e.target.value)} className="input sm:max-w-xs">
          <option value="ALL">All Pillars</option>
          {PILLARS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <button onClick={() => setShowPlanForm(!showPlanForm)} className="btn-primary whitespace-nowrap">
          {showPlanForm ? "Cancel" : "+ Create Plan"}
        </button>
      </div>

      {showPlanForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Create {planType === "weekly" ? "Weekly" : "Monthly"} Plan</h2>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div>
              <label className="label">Plan Type</label>
              <select value={planType} onChange={(e) => setPlanType(e.target.value as "weekly" | "monthly")} className="input">
                <option value="weekly">Weekly Plan</option>
                <option value="monthly">Monthly Plan</option>
              </select>
            </div>
            <div>
              <label className="label">Select Activities ({selectedActivities.length} selected)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-border rounded-lg p-3">
                {ACTIVITY_LIBRARY.map((act) => (
                  <label key={act.id} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${selectedActivities.includes(act.id) ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
                    <input
                      type="checkbox"
                      checked={selectedActivities.includes(act.id)}
                      onChange={() => toggleActivity(act.id)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-sm">{act.title}</div>
                      <div className="text-xs text-muted-foreground">{act.pillar.replace(/_/g, " ")} • {act.timeEstimate}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={selectedActivities.length === 0}>
              Create Plan
            </button>
          </form>
        </div>
      )}

      {selectedActivities.length > 0 && !showPlanForm && (
        <div className="card border-l-4 border-l-primary">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Quick Add</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedActivities.length} activity selected — create a plan or add to an existing one.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowPlanForm(true)} className="btn-primary whitespace-nowrap">
                Create Plan
              </button>
              <button onClick={() => setSelectedActivities([])} className="btn-outline whitespace-nowrap">
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {plans.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-4">Your Plans</h2>
          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase">{plan.type} Plan</span>
                    <p className="text-sm font-medium">{new Date(plan.startDate).toLocaleDateString()} — {new Date(plan.endDate).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{plan.entries.length} activities</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {plan.entries.map((entry: any) => (
                    <span key={entry.id} className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${entry.completed ? "bg-growth/10 text-growth" : "bg-muted text-muted-foreground"}`}>
                      {entry.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredActivities.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No activities found</h3>
          <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filter to find what you&apos;re looking for.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => { setSearchQuery(""); setFilterPillar("ALL"); }} className="btn-primary">Reset filters</button>
            <Link href="/dashboard/activities" className="btn-outline">Browse all activities</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((activity) => {
            const isExpanded = expandedActivity === activity.id;
            const isSaved = savedActivities.includes(activity.id);
            const isSelected = selectedActivities.includes(activity.id);
            const pillarLabel = PILLARS.find((p) => p.value === activity.pillar)?.label || activity.pillar.replace(/_/g, " ");
            const pillarColor = PILLARS.find((p) => p.value === activity.pillar)?.color || "bg-gray-100";
            const MODULE_SLUG_MAP: Record<string, string> = {
              LEARN: "learn",
              LIVE: "live",
              LEAD: "lead",
              EARN: "earn",
              SERVE: "serve",
              DIGITAL_BUILDER: "digital-builder",
              LIFE_SKILLS: "life-skills",
              YOUNG_ENTREPRENEUR: "young-entrepreneur",
              CREATIVE_EXPLORER: "creative-explorer",
              FUTURE_READY: "future-ready",
              HEALTH_WELLBEING: "health-wellbeing",
              CHARACTER_VALUES: "character-values",
              FAMILY_GROWTH: "family-growth",
              EXPLORATION: "exploration",
              EXAM_PREPARATION: "exams",
              CHILD_DEVELOPMENT_TRACKER: "tracker",
              HOLIDAY_GROWTH: "holiday",
              SCHOOL_TERM_DEVELOPMENT: "school-term",
            };
            const moduleHref = `/dashboard/modules/${MODULE_SLUG_MAP[activity.pillar] || activity.pillar.toLowerCase().replace(/_/g, "-")}`;

            return (
              <div key={activity.id} className={`card-interactive rounded-xl border border-border bg-white transition-all ${isExpanded ? "shadow-lg" : "shadow-sm hover:shadow-md hover:-translate-y-0.5"}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-sm leading-tight">{activity.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.timeEstimate}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${pillarColor}`}>
                      {pillarLabel}
                    </span>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                      {activity.safetyLevel.replace(/_/g, " ")}
                    </span>
                  </div>
                  {activity.estimatedCost !== "Free" && (
                    <p className="text-xs text-muted-foreground">Cost: {activity.estimatedCost}</p>
                  )}
                  {activity.lowCostAlternative && (
                    <p className="text-xs text-muted-foreground mt-1 italic">Low-cost: {activity.lowCostAlternative}</p>
                  )}

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">About this activity</h4>
                        <p className="text-sm text-foreground leading-relaxed">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">Pillar: {pillarLabel} • Safety: {activity.safetyLevel.replace(/_/g, " ")} • Time: {activity.timeEstimate}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => toggleActivity(activity.id)} className={`btn-primary text-xs px-3 py-2 ${isSelected ? "bg-growth hover:bg-growth/90" : ""}`}>
                          {isSelected ? "Selected ✓" : "Add to Plan"}
                        </button>
                        <Link href={moduleHref} className="btn-outline text-xs px-3 py-2">
                          Explore Module
                        </Link>
                        <button onClick={() => toggleSave(activity.id)} className={`btn-outline text-xs px-3 py-2 ${isSaved ? "border-primary text-primary" : ""}`}>
                          {isSaved ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={() => setExpandedActivity(isExpanded ? null : activity.id)} className="btn-outline text-xs px-3 py-2 flex-1">
                      {isExpanded ? "Hide Details" : "View Details"}
                    </button>
                    <button onClick={() => toggleSave(activity.id)} className={`icon-btn p-2 rounded-lg border border-border ${isSaved ? "text-primary border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`} aria-label={isSaved ? "Unsave activity" : "Save activity"}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        <p className="text-sm text-muted-foreground mb-3">Next step: Add selected activities to a plan.</p>
        <Link href="/dashboard/plan/weekly" className="btn-primary">Build Plan</Link>
      </div>
    </div>
  );
}

