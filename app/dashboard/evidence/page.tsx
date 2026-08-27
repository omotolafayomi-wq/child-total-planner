"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, getEvidence, createEvidence, deleteEvidence, getGoals, PILLARS } from "@/lib/store";
import BackButton from "@/components/BackButton";

const EVIDENCE_TYPES = [
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "document", label: "Document" },
  { value: "observation", label: "Observation" },
  { value: "mentor_note", label: "Mentor Note" },
];

export default function EvidencePage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [evidence, setEvidence] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "text",
    description: "",
    date: new Date().toISOString().split("T")[0],
    reflection: "",
    pillar: "LEARN",
    area: "",
    goalId: "",
  });
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
        loadData(child.id);
      }
    });
  }, [router]);

  function loadData(childId: string) {
    setEvidence(getEvidence(childId));
    setGoals(getGoals(childId));
  }

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    loadData(childId);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChildId || !form.description) return;
    createEvidence({
      childId: selectedChildId,
      goalId: form.goalId || undefined,
      pillar: form.pillar,
      area: form.area || "General",
      type: form.type as any,
      description: form.description,
      date: form.date,
      reflection: form.reflection,
    });
    setForm({ type: "text", description: "", date: new Date().toISOString().split("T")[0], reflection: "", pillar: "LEARN", area: "", goalId: "" });
    setShowForm(false);
    loadData(selectedChildId);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this evidence?")) {
      deleteEvidence(id);
      loadData(selectedChildId);
    }
  }

  const evidenceByType = EVIDENCE_TYPES.map((t) => ({
    ...t,
    count: evidence.filter((e) => e.type === t.value).length,
  }));

  if (!user) return null;

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Evidence & Tracker</h1>
          <p className="text-muted-foreground">Record observations, work samples, and progress evidence</p>
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
          <p className="text-muted-foreground">Select a child to view evidence.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {evidenceByType.map((type) => (
              <div key={type.value} className="card text-center">
                <div className="text-2xl font-bold">{type.count}</div>
                <div className="text-xs text-muted-foreground">{type.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="section-title">Evidence Records</h2>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              {showForm ? "Cancel" : "+ Add Evidence"}
            </button>
          </div>

          {showForm && (
            <div className="card">
              <h3 className="font-semibold mb-4">Add Evidence</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                      {EVIDENCE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label">Pillar</label>
                    <select value={form.pillar} onChange={(e) => setForm({ ...form, pillar: e.target.value })} className="input">
                      {PILLARS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Area</label>
                    <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input" placeholder="e.g. Reading, Cooking" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Link to Goal (optional)</label>
                    <select value={form.goalId} onChange={(e) => setForm({ ...form, goalId: e.target.value })} className="input">
                      <option value="">No goal linked</option>
                      {goals.map((g) => (
                        <option key={g.id} value={g.id}>{g.goalText}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[80px]" placeholder="Describe what you observed..." required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Reflection (optional)</label>
                    <textarea value={form.reflection} onChange={(e) => setForm({ ...form, reflection: e.target.value })} className="input min-h-[60px]" placeholder="What does this evidence show about progress?" />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={!form.description}>Save Evidence</button>
              </form>
            </div>
          )}

          {evidence.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No evidence yet</h2>
              <p className="text-muted-foreground mb-6">Start recording observations, work samples, and progress evidence.</p>
              <button onClick={() => setShowForm(true)} className="btn-primary">Add First Evidence</button>
            </div>
          ) : (
            <div className="space-y-3">
              {[...evidence].reverse().map((item) => (
                <div key={item.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase">{item.type.replace(/_/g, " ")}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PILLARS.find((p) => p.value === item.pillar)?.color || "bg-gray-100"}`}>
                          {item.pillar.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-medium">{item.description}</p>
                      {item.reflection && <p className="text-sm text-muted-foreground mt-1 italic">"{item.reflection}"</p>}
                      {item.area && <p className="text-xs text-muted-foreground mt-1">Area: {item.area}</p>}
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <div className="card">
        <p className="text-sm text-muted-foreground mb-3">Next step: Reflect on what the child learned.</p>
        <div className="flex gap-2">
          <Link href="/dashboard/reflections/child-voice" className="btn-outline">Child Reflection</Link>
          <Link href="/dashboard/reflections/parent-review" className="btn-primary">Parent Review</Link>
        </div>
      </div>
    </div>
  );
}
