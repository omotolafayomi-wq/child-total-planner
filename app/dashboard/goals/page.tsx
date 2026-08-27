"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, getGoals, createGoal, updateGoal, deleteGoal, PILLARS, DEVELOPMENT_LEVELS, GOAL_STATUSES } from "@/lib/store";
import BackButton from "@/components/BackButton";
import Breadcrumbs from "@/components/Breadcrumbs";

const CHILD_VOICE_QUESTIONS = [
  "What are you proud of this month?",
  "What was difficult?",
  "What do you want to learn next?",
  "Where do you want more help?",
  "What responsibility are you ready to take on?",
];

const PARENT_REVIEW_QUESTIONS = [
  "What did we over-schedule?",
  "What should we stop, start or continue?",
  "Which responsibility can move from adult to child?",
  "What safety or wellbeing issue needs attention?",
  "What opportunity should we explore next month?",
];

export default function GoalsPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [goals, setGoals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showChildVoice, setShowChildVoice] = useState(false);
  const [showParentReview, setShowParentReview] = useState(false);
  const [formData, setFormData] = useState({
    pillar: "LEARN",
    area: "",
    goalText: "",
    behaviour: "",
    currentLevel: "BEGINNING",
    targetLevel: "INDEPENDENT",
    evidence: "",
    targetDate: "",
    nextStep: "",
  });
  const [childVoice, setChildVoice] = useState<Record<string, string>>({});
  const [parentReview, setParentReview] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then((u) => {
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
        setGoals(getGoals(child.id));
      }
    });
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    setGoals(getGoals(childId));
  }

  function resetForm() {
    setFormData({ pillar: "LEARN", area: "", goalText: "", behaviour: "", currentLevel: "BEGINNING", targetLevel: "INDEPENDENT", evidence: "", targetDate: "", nextStep: "" });
    setShowForm(false);
    setEditingId(null);
  }

  function handleEdit(goal: any) {
    setFormData({
      pillar: goal.pillar,
      area: goal.area,
      goalText: goal.goalText,
      behaviour: goal.behaviour,
      currentLevel: goal.currentLevel,
      targetLevel: goal.targetLevel,
      evidence: goal.evidence,
      targetDate: goal.targetDate,
      nextStep: goal.nextStep,
    });
    setEditingId(goal.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedChildId) return;
    const data = {
      childId: selectedChildId,
      pillar: formData.pillar,
      area: formData.area,
      goalText: formData.goalText,
      behaviour: formData.behaviour,
      currentLevel: formData.currentLevel as any,
      targetLevel: formData.targetLevel as any,
      evidence: formData.evidence,
      targetDate: formData.targetDate,
      status: "NOT_STARTED" as any,
      nextStep: formData.nextStep,
    };
    if (editingId) {
      updateGoal(editingId, data);
    } else {
      createGoal(data);
    }
    setGoals(getGoals(selectedChildId));
    resetForm();
  }

  function handleStatusChange(goalId: string, status: any) {
    updateGoal(goalId, { status });
    setGoals(getGoals(selectedChildId));
  }

  function handleDelete(goalId: string) {
    if (!confirm("Delete this goal?")) return;
    deleteGoal(goalId);
    setGoals(getGoals(selectedChildId));
  }

  function saveChildVoice() {
    const { createReflection } = require("@/lib/store");
    createReflection({
      childId: selectedChildId,
      type: "childVoice",
      answers: childVoice,
      date: new Date().toISOString(),
    });
    setShowChildVoice(false);
    setChildVoice({});
  }

  function saveParentReview() {
    const { createReflection } = require("@/lib/store");
    createReflection({
      childId: selectedChildId,
      type: "parentReview",
      answers: parentReview,
      date: new Date().toISOString(),
    });
    setShowParentReview(false);
    setParentReview({});
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <BackButton />
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-muted-foreground">Set and track development goals with observable behaviours</p>
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

      {children.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted-foreground mb-4">Add a child first to set goals.</p>
          <Link href="/dashboard/children" className="btn-primary">Add Child</Link>
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary">
              {showForm ? "Cancel" : "+ New Goal"}
            </button>
            <button onClick={() => setShowChildVoice(!showChildVoice)} className="btn-outline">
              {showChildVoice ? "Hide" : "Child Voice"}
            </button>
            <button onClick={() => setShowParentReview(!showParentReview)} className="btn-outline">
              {showParentReview ? "Hide" : "Parent Review"}
            </button>
          </div>

          {showForm && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Goal" : "New Development Goal"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Pillar</label>
                    <select value={formData.pillar} onChange={(e) => setFormData({ ...formData, pillar: e.target.value })} className="input">
                      {PILLARS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Growth Area</label>
                    <input className="input" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} required placeholder="e.g. Cooking, Reading" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Goal</label>
                    <input className="input" value={formData.goalText} onChange={(e) => setFormData({ ...formData, goalText: e.target.value })} required placeholder="e.g. Prepare a simple family meal independently" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Observable Behaviour</label>
                    <textarea className="input min-h-[80px]" value={formData.behaviour} onChange={(e) => setFormData({ ...formData, behaviour: e.target.value })} required placeholder="e.g. Plans, cooks and serves a simple meal with minimal prompting on 4 of 5 attempts" />
                  </div>
                  <div>
                    <label className="label">Current Level</label>
                    <select value={formData.currentLevel} onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })} className="input">
                      {DEVELOPMENT_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Target Level</label>
                    <select value={formData.targetLevel} onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value })} className="input">
                      {DEVELOPMENT_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Target Date</label>
                    <input type="date" className="input" value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Next Step</label>
                    <input className="input" value={formData.nextStep} onChange={(e) => setFormData({ ...formData, nextStep: e.target.value })} placeholder="First action to take" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Evidence Note</label>
                    <textarea className="input min-h-[60px]" value={formData.evidence} onChange={(e) => setFormData({ ...formData, evidence: e.target.value })} placeholder="How will we know this goal has been achieved?" />
                  </div>
                </div>
                <button type="submit" className="btn-primary">{editingId ? "Save Changes" : "Create Goal"}</button>
              </form>
            </div>
          )}

          {showChildVoice && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">My Voice</h2>
              <p className="text-sm text-muted-foreground mb-4">Let the child share their thoughts on their development.</p>
              <div className="space-y-3">
                {CHILD_VOICE_QUESTIONS.map((q) => (
                  <div key={q}>
                    <label className="label">{q}</label>
                    <textarea className="input min-h-[60px]" value={childVoice[q] || ""} onChange={(e) => setChildVoice({ ...childVoice, [q]: e.target.value })} />
                  </div>
                ))}
              </div>
              <button onClick={saveChildVoice} className="btn-primary mt-4">Save Child Voice</button>
            </div>
          )}

          {showParentReview && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Parent Review</h2>
              <p className="text-sm text-muted-foreground mb-4">Reflect on the development journey together.</p>
              <div className="space-y-3">
                {PARENT_REVIEW_QUESTIONS.map((q) => (
                  <div key={q}>
                    <label className="label">{q}</label>
                    <textarea className="input min-h-[60px]" value={parentReview[q] || ""} onChange={(e) => setParentReview({ ...parentReview, [q]: e.target.value })} />
                  </div>
                ))}
              </div>
              <button onClick={saveParentReview} className="btn-primary mt-4">Save Parent Review</button>
            </div>
          )}

          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-muted-foreground mb-2">No goals yet.</p>
                <p className="text-sm text-muted-foreground">Create your first goal to start tracking development.</p>
              </div>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">{goal.pillar.replace(/_/g, " ")} • {goal.area}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${GOAL_STATUSES.find((s) => s.value === goal.status)?.color || "bg-gray-100"}`}>
                          {GOAL_STATUSES.find((s) => s.value === goal.status)?.label || goal.status}
                        </span>
                      </div>
                      <h3 className="font-semibold">{goal.goalText}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{goal.behaviour}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Current: {goal.currentLevel.replace(/_/g, " ")}</span>
                        <span>Target: {goal.targetLevel.replace(/_/g, " ")}</span>
                        <span>By: {goal.targetDate}</span>
                      </div>
                      {goal.nextStep && <p className="text-xs text-muted-foreground mt-1">Next: {goal.nextStep}</p>}
                    </div>
                    <div className="flex gap-2">
                      <select value={goal.status} onChange={(e) => handleStatusChange(goal.id, e.target.value)} className="input w-auto text-xs py-1">
                        {GOAL_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleEdit(goal)} className="btn-outline flex-1 justify-center text-xs py-2">Edit</button>
                    <button onClick={() => handleDelete(goal.id)} className="btn-outline flex-1 justify-center text-xs py-2 text-red-600">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
      <div className="card">
        <p className="text-sm text-muted-foreground mb-3">Next step: Organise activities into a plan.</p>
        <Link href="/dashboard/plan/weekly" className="btn-primary">Build Plan</Link>
      </div>
    </div>
  );
}
