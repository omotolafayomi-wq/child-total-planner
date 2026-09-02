"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOnboardingState } from "@/lib/store";
import { getChildren, getChild, getReports, createReport, getGoals, getEvidence, getReflections, PILLARS, getPillarLabel } from "@/lib/store";

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onboarding = getOnboardingState();
      if (!onboarding) {
        router.replace("/onboarding/welcome");
        return;
      }
      setUser({ id: onboarding.parentId });
      const kids = getChildren(onboarding.parentId);
      setChildren(kids);
      if (kids.length > 0) {
        const saved = localStorage.getItem("selectedChildId");
        const child = kids.find((c) => c.id === saved) || kids[0];
        setSelectedChildId(child.id);
        setReports(getReports(child.id));
      }
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    setReports(getReports(childId));
  }

  function handleGenerateReport() {
    if (!selectedChildId) return;
    setGenerating(true);

    const child = getChild(selectedChildId);
    const goals = getGoals(selectedChildId);
    const evidence = getEvidence(selectedChildId);
    const reflections = getReflections(selectedChildId);

    const goalsCompleted = goals.filter((g) => g.status === "ACHIEVED").map((g) => g.goalText);
    const goalsDeveloping = goals.filter((g) => g.status === "IN_PROGRESS" || g.status === "CONSISTENT").map((g) => g.goalText);
    const evidenceHighlights = evidence.slice(-5).map((e) => `${e.type}: ${e.description}`);

    const childVoiceEntries = reflections.filter((r) => r.type === "childVoice");
    const childVoiceExcerpts = childVoiceEntries.slice(-3).flatMap((r) =>
      Object.values(r.answers).filter((v) => (v as string).trim()).slice(0, 2)
    );

    const parentReviewEntries = reflections.filter((r) => r.type === "parentReview");
    const parentReviewKeyPoints = parentReviewEntries.slice(-3).flatMap((r) =>
      Object.values(r.answers).filter((v) => (v as string).trim()).slice(0, 2)
    );

    const pillarOverview = PILLARS.map((p) => {
      const pillarEvidence = evidence.filter((e) => e.pillar === p.value);
      const pillarGoals = goals.filter((g) => g.pillar === p.value);
      return `${p.label}: ${pillarGoals.length} goals, ${pillarEvidence.length} evidence items`;
    });

    const summary = `${child?.name || "Child"} development report covering ${PILLARS.length} pillars.`;

    const report = createReport({
      childId: selectedChildId,
      period: new Date().toLocaleDateString(),
      summary,
      goalsCompleted,
      goalsDeveloping,
      evidenceHighlights,
      childVoiceExcerpts,
      parentReviewKeyPoints,
      nextSteps: [
        "Continue current activities that show progress",
        "Review goals marked as developing",
        "Add more evidence for areas with fewer records",
      ],
    });

    setReports((prev) => [...prev, report]);
    setGenerating(false);
    router.push(`/dashboard/reports/${report.id}`);
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Development reports for your child</p>
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
          <p className="text-muted-foreground">Select a child to view reports.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Generate New Report</h2>
                <p className="text-sm text-muted-foreground">Create a development report from existing data</p>
              </div>
              <button onClick={handleGenerateReport} className="btn-primary" disabled={generating}>
                {generating ? "Generating..." : "+ Generate Report"}
              </button>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No reports yet</h2>
              <p className="text-muted-foreground mb-6">Generate your first development report.</p>
              <button onClick={handleGenerateReport} className="btn-primary">Generate Report</button>
            </div>
          ) : (
            <div className="space-y-3">
              {[...reports].reverse().map((report) => (
                <div key={report.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">{report.period}</span>
                      </div>
                      <p className="text-sm font-medium">{report.summary}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {report.goalsCompleted.length > 0 && (
                          <span className="inline-flex items-center rounded-full bg-growth/10 text-growth px-2 py-0.5 text-xs font-medium">
                            {report.goalsCompleted.length} achieved
                          </span>
                        )}
                        {report.goalsDeveloping.length > 0 && (
                          <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium">
                            {report.goalsDeveloping.length} developing
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                      className="btn-outline text-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <div className="card">
        <p className="text-sm text-muted-foreground mb-3">Next step: Discover new activities for your child.</p>
        <Link href="/dashboard/activities" className="btn-primary">View Activities</Link>
      </div>
    </div>
  );
}

