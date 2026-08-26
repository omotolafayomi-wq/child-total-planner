"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, getPlans, createPlan, updatePlan, ACTIVITY_LIBRARY, PILLARS } from "@/lib/store";

const PRIMARY_DOMAINS = ["LEARN", "LIVE", "LEAD", "EARN", "SERVE"];
const SUPPORTING_DOMAINS = ["Digital Builder", "Creative/Exploration", "Health & Wellbeing", "Character/Family", "Future Ready"];

interface MonthlyRow {
  id: string;
  domain: string;
  goal: string;
  evidence: string;
  levelNow: string;
  nextStep: string;
}

export default function MonthlyPlanPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [rows, setRows] = useState<MonthlyRow[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MonthlyRow>({ id: "", domain: "", goal: "", evidence: "", levelNow: "", nextStep: "" });
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRow, setNewRow] = useState<MonthlyRow>({ id: "", domain: PRIMARY_DOMAINS[0], goal: "", evidence: "", levelNow: "", nextStep: "" });
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
      loadMonthlyData(child.id);
    }
  }, [router]);

  function loadMonthlyData(childId: string) {
    const plans = getPlans(childId);
    const monthly = plans.filter((p: any) => p.type === "monthly");
    if (monthly.length > 0) {
      const latest = monthly[monthly.length - 1];
      if (latest.entries && latest.entries.length > 0) {
        setRows(latest.entries.map((e: any) => ({
          id: e.id,
          domain: e.title || "",
          goal: e.description || "",
          evidence: e.completed ? "Yes" : "In progress",
          levelNow: "",
          nextStep: "",
        })));
      }
    }
  }

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    loadMonthlyData(childId);
  }

  function handleAddRow() {
    if (!selectedChildId || !newRow.domain) return;
    const row: MonthlyRow = { ...newRow, id: crypto.randomUUID() };
    setRows((prev) => [...prev, row]);
    setNewRow({ id: "", domain: PRIMARY_DOMAINS[0], goal: "", evidence: "", levelNow: "", nextStep: "" });
    setShowAddRow(false);
    saveMonthlyPlan([...rows, row]);
  }

  function handleEditRow(row: MonthlyRow) {
    setEditingRow(row.id);
    setEditForm(row);
  }

  function handleSaveEdit() {
    if (!editingRow) return;
    const updated = rows.map((r) => (r.id === editingRow ? editForm : r));
    setRows(updated);
    setEditingRow(null);
    saveMonthlyPlan(updated);
  }

  function handleDeleteRow(id: string) {
    const updated = rows.filter((r) => r.id !== id);
    setRows(updated);
    saveMonthlyPlan(updated);
  }

  function saveMonthlyPlan(data: MonthlyRow[]) {
    if (!selectedChildId) return;
    const plans = getPlans(selectedChildId);
    const monthly = plans.filter((p: any) => p.type === "monthly");
    const startDate = new Date().toISOString().split("T")[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const entries = data.map((r) => ({
      id: r.id,
      planId: "",
      title: r.domain,
      description: r.goal,
      date: startDate,
      completed: r.evidence === "Yes",
    }));

    if (monthly.length > 0) {
      updatePlan(monthly[monthly.length - 1].id, { entries });
    } else {
      createPlan({
        childId: selectedChildId,
        type: "monthly",
        startDate,
        endDate,
        entries,
      });
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Monthly Development Dashboard</h1>
          <p className="text-muted-foreground">Track development across all domains</p>
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
          <p className="text-muted-foreground">Select a child to view the monthly dashboard.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Development Domains</h2>
              <button onClick={() => setShowAddRow(!showAddRow)} className="btn-primary text-sm">
                {showAddRow ? "Cancel" : "+ Add Domain"}
              </button>
            </div>

            {showAddRow && (
              <div className="mb-4 rounded-lg border border-border p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Domain</label>
                    <select value={newRow.domain} onChange={(e) => setNewRow({ ...newRow, domain: e.target.value })} className="input">
                      {[...PRIMARY_DOMAINS, ...SUPPORTING_DOMAINS].map((d) => (
                        <option key={d} value={d}>{d.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">This Month&apos;s Goal</label>
                    <input type="text" value={newRow.goal} onChange={(e) => setNewRow({ ...newRow, goal: e.target.value })} className="input" placeholder="Optional goal" />
                  </div>
                  <div>
                    <label className="label">Evidence</label>
                    <input type="text" value={newRow.evidence} onChange={(e) => setNewRow({ ...newRow, evidence: e.target.value })} className="input" placeholder="What have you observed?" />
                  </div>
                  <div>
                    <label className="label">Level Now</label>
                    <input type="text" value={newRow.levelNow} onChange={(e) => setNewRow({ ...newRow, levelNow: e.target.value })} className="input" placeholder="e.g. Developing" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Next Step</label>
                    <input type="text" value={newRow.nextStep} onChange={(e) => setNewRow({ ...newRow, nextStep: e.target.value })} className="input" placeholder="What to focus on next" />
                  </div>
                </div>
                <button onClick={handleAddRow} className="btn-primary" disabled={!newRow.domain}>Add Row</button>
              </div>
            )}

            {rows.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No domains added yet. Add a domain to start tracking monthly development.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-medium">Domain</th>
                      <th className="text-left py-2 px-2 font-medium">This Month&apos;s Goal</th>
                      <th className="text-left py-2 px-2 font-medium">Evidence</th>
                      <th className="text-left py-2 px-2 font-medium">Level Now</th>
                      <th className="text-left py-2 px-2 font-medium">Next Step</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-border/50">
                        {editingRow === row.id ? (
                          <>
                            <td className="py-2 px-2">{row.domain}</td>
                            <td className="py-2 px-2"><input value={editForm.goal} onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })} className="input text-xs" /></td>
                            <td className="py-2 px-2"><input value={editForm.evidence} onChange={(e) => setEditForm({ ...editForm, evidence: e.target.value })} className="input text-xs" /></td>
                            <td className="py-2 px-2"><input value={editForm.levelNow} onChange={(e) => setEditForm({ ...editForm, levelNow: e.target.value })} className="input text-xs" /></td>
                            <td className="py-2 px-2"><input value={editForm.nextStep} onChange={(e) => setEditForm({ ...editForm, nextStep: e.target.value })} className="input text-xs" /></td>
                            <td className="py-2 px-2">
                              <button onClick={handleSaveEdit} className="text-xs text-primary hover:underline mr-2">Save</button>
                              <button onClick={() => setEditingRow(null)} className="text-xs text-muted-foreground">Cancel</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-2 font-medium">{row.domain}</td>
                            <td className="py-2 px-2">{row.goal || "—"}</td>
                            <td className="py-2 px-2">{row.evidence || "—"}</td>
                            <td className="py-2 px-2">{row.levelNow || "—"}</td>
                            <td className="py-2 px-2">{row.nextStep || "—"}</td>
                            <td className="py-2 px-2">
                              <button onClick={() => handleEditRow(row)} className="text-xs text-primary hover:underline mr-2">Edit</button>
                              <button onClick={() => handleDeleteRow(row.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">Primary Domains</h3>
            <div className="flex flex-wrap gap-2">
              {PRIMARY_DOMAINS.map((d) => (
                <span key={d} className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${PILLARS.find((p) => p.value === d)?.color || "bg-gray-100"}`}>
                  {d}
                </span>
              ))}
            </div>
            <h3 className="font-semibold mb-3 mt-4">Supporting Domains</h3>
            <div className="flex flex-wrap gap-2">
              {SUPPORTING_DOMAINS.map((d) => (
                <span key={d} className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
