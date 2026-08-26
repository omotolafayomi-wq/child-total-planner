"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, getPlans, createPlan, updatePlan, ACTIVITY_LIBRARY, PILLARS, SAFETY_LEVELS } from "@/lib/store";
import BackButton from "@/components/BackButton";

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
      setSelectedChildId(child.id);
      setPlans(getPlans(child.id));
    }
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    setPlans(getPlans(childId));
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
          <h1 className="text-2xl font-bold">Activities</h1>
          <p className="text-muted-foreground">Discover development activities aligned to LEARN, LIVE, LEAD, EARN, SERVE and more</p>
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
                <div className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-sm">{activity.title}</h3>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.timeEstimate}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${PILLARS.find((p) => p.value === activity.pillar)?.color || "bg-gray-100"}`}>
                {activity.pillar.replace(/_/g, " ")}
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
          </div>
        ))}
      </div>
      <div className="card">
        <p className="text-sm text-muted-foreground mb-3">Next step: Add selected activities to a plan.</p>
        <Link href="/dashboard/plan/weekly" className="btn-primary">Build Plan</Link>
      </div>
    </div>
  );
}
