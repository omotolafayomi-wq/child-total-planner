"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, getPlans, createPlan, updatePlan, ACTIVITY_LIBRARY, PILLARS } from "@/lib/store";
import BackButton from "@/components/BackButton";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDates(): { day: string; date: string; dayNum: number }[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  return DAYS.map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      day,
      date: d.toISOString().split("T")[0],
      dayNum: d.getDate(),
    };
  });
}

export default function WeeklyPlanPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [weekDates] = useState(getWeekDates());
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState({ title: "", description: "", activityId: "" });
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
      loadPlans(child.id);
    }
  }, [router]);

  function loadPlans(childId: string) {
    const allPlans = getPlans(childId);
    setPlans(allPlans);
    const weekly = allPlans.filter((p: any) => p.type === "weekly");
    setActivePlan(weekly.length > 0 ? weekly[weekly.length - 1] : null);
  }

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    loadPlans(childId);
  }

  function handleCreatePlan() {
    if (!selectedChildId) return;
    const startDate = weekDates[0].date;
    const endDate = weekDates[6].date;
    const plan = createPlan({
      childId: selectedChildId,
      type: "weekly",
      startDate,
      endDate,
      entries: [],
    });
    setActivePlan(plan);
    setPlans((prev) => [...prev, plan]);
  }

  function handleAddActivity(dayDate: string) {
    if (!activePlan || !newActivity.title) return;
    const entry = {
      id: crypto.randomUUID(),
      planId: activePlan.id,
      activityId: newActivity.activityId || undefined,
      title: newActivity.title,
      description: newActivity.description,
      date: dayDate,
      completed: false,
    };
    const updatedPlan = {
      ...activePlan,
      entries: [...activePlan.entries, entry],
    };
    updatePlan(activePlan.id, { entries: updatedPlan.entries });
    setActivePlan(updatedPlan);
    setPlans((prev) => prev.map((p) => (p.id === activePlan.id ? updatedPlan : p)));
    setNewActivity({ title: "", description: "", activityId: "" });
    setShowAddForm(null);
  }

  function toggleEntry(entryId: string) {
    if (!activePlan) return;
    const updatedEntries = activePlan.entries.map((e: any) =>
      e.id === entryId ? { ...e, completed: !e.completed } : e
    );
    updatePlan(activePlan.id, { entries: updatedEntries });
    setActivePlan({ ...activePlan, entries: updatedEntries });
    setPlans((prev) => prev.map((p) => (p.id === activePlan.id ? { ...activePlan, entries: updatedEntries } : p)));
  }

  function removeEntry(entryId: string) {
    if (!activePlan) return;
    const updatedEntries = activePlan.entries.filter((e: any) => e.id !== entryId);
    updatePlan(activePlan.id, { entries: updatedEntries });
    setActivePlan({ ...activePlan, entries: updatedEntries });
    setPlans((prev) => prev.map((p) => (p.id === activePlan.id ? { ...activePlan, entries: updatedEntries } : p)));
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-2xl font-bold">Weekly Plan</h1>
          <p className="text-muted-foreground">Plan activities for each day of the week</p>
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
          <p className="text-muted-foreground">Select a child to view the weekly plan.</p>
        </div>
      ) : (
        <>
          {!activePlan ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No weekly plan yet</h2>
              <p className="text-muted-foreground mb-6">Create a weekly plan to organise activities day by day.</p>
              <button onClick={handleCreatePlan} className="btn-primary">Create Weekly Plan</button>
            </div>
          ) : (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date(activePlan.startDate).toLocaleDateString()} — {new Date(activePlan.endDate).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-muted-foreground">{activePlan.entries.length} activities</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                {weekDates.map((wd) => {
                  const dayEntries = activePlan.entries.filter((e: any) => e.date === wd.date);
                  return (
                    <div key={wd.date} className="card min-h-[160px]">
                      <div className="text-center mb-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase">{wd.day}</div>
                        <div className="text-lg font-bold">{wd.dayNum}</div>
                      </div>
                      <div className="space-y-2 mb-3">
                        {dayEntries.map((entry: any) => (
                          <div key={entry.id} className="flex items-start gap-1.5">
                            <input
                              type="checkbox"
                              checked={entry.completed}
                              onChange={() => toggleEntry(entry.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium ${entry.completed ? "line-through text-muted-foreground" : ""}`}>
                                {entry.title}
                              </p>
                            </div>
                            <button onClick={() => removeEntry(entry.id)} className="text-muted-foreground hover:text-red-500">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      {showAddForm === wd.date ? (
                        <div className="space-y-2 pt-2 border-t border-border">
                          <input
                            type="text"
                            value={newActivity.title}
                            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                            className="input text-xs"
                            placeholder="Activity title"
                          />
                          <select
                            value={newActivity.activityId}
                            onChange={(e) => setNewActivity({ ...newActivity, activityId: e.target.value, title: ACTIVITY_LIBRARY.find((a) => a.id === e.target.value)?.title || newActivity.title })}
                            className="input text-xs"
                          >
                            <option value="">Custom activity</option>
                            {ACTIVITY_LIBRARY.map((a) => (
                              <option key={a.id} value={a.id}>{a.title}</option>
                            ))}
                          </select>
                          <div className="flex gap-1">
                            <button onClick={() => handleAddActivity(wd.date)} className="btn-primary text-xs flex-1" disabled={!newActivity.title}>Add</button>
                            <button onClick={() => setShowAddForm(null)} className="btn-outline text-xs">×</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowAddForm(wd.date)} className="text-xs text-primary hover:underline w-full text-center pt-2 border-t border-border">
                          + Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {plans.filter((p: any) => p.type === "weekly").length > 1 && (
                <div className="card">
                  <h3 className="font-semibold mb-3">Previous Weekly Plans</h3>
                  <div className="space-y-2">
                    {plans.filter((p: any) => p.type === "weekly").slice(0, -1).reverse().map((plan: any) => (
                      <div key={plan.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <span className="text-sm">
                          {new Date(plan.startDate).toLocaleDateString()} — {new Date(plan.endDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">{plan.entries.length} activities</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
