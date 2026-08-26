"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChild, PILLARS, getPillarLabel } from "@/lib/store";

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [child, setChild] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.push("/signin");
      return;
    }
    setUser(u);
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const reports = JSON.parse(localStorage.getItem("tcd_reports") || "[]");
    const found = reports.find((r: any) => r.id === params.id);
    if (found && found.childId) {
      const c = getChild(found.childId);
      if (c && c.parentId === user.id) {
        setReport(found);
        setChild(c);
      } else {
        router.push("/dashboard/reports");
      }
    } else {
      router.push("/dashboard/reports");
    }
  }, [params.id, user, router]);

  function handlePrint() {
    window.print();
  }

  if (!report || !child) return null;

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between no-print">
        <button onClick={() => router.push("/dashboard/reports")} className="btn-outline">
          ← Back to Reports
        </button>
        <button onClick={handlePrint} className="btn-primary">
          Print / Save PDF
        </button>
      </div>

      <div className="card print:shadow-none print:border-none">
        <div className="text-center mb-6 print:mb-4">
          <h1 className="text-2xl font-bold">Development Report</h1>
          <p className="text-lg font-semibold text-primary">{child.name}</p>
          <p className="text-sm text-muted-foreground">Age {child.age} • {child.schoolLevel}</p>
          <p className="text-xs text-muted-foreground mt-1">Generated: {new Date(report.generatedAt).toLocaleDateString()}</p>
        </div>

        {child.interests?.length > 0 && (
          <div className="mb-4 print:mb-2">
            <h3 className="font-semibold text-sm mb-1">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {child.interests.map((i: string) => (
                <span key={i} className="rounded-full bg-muted px-3 py-1 text-xs">{i}</span>
              ))}
            </div>
          </div>
        )}

        {child.strengths?.length > 0 && (
          <div className="mb-4 print:mb-2">
            <h3 className="font-semibold text-sm mb-1">Strengths</h3>
            <div className="flex flex-wrap gap-2">
              {child.strengths.map((s: string) => (
                <span key={s} className="rounded-full bg-growth/10 text-growth px-3 py-1 text-xs">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 print:mb-4">
          <h2 className="section-title mb-3">5-Pillar Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PILLARS.slice(0, 5).map((pillar) => (
              <div key={pillar.value} className="text-center rounded-lg border border-border p-3">
                <div className="text-xs font-medium text-muted-foreground uppercase">{pillar.label}</div>
                <div className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pillar.color}`}>
                  Active
                </div>
              </div>
            ))}
          </div>
        </div>

        {report.goalsCompleted?.length > 0 && (
          <div className="mb-4 print:mb-2">
            <h3 className="font-semibold text-sm mb-2 text-growth">Goals Achieved</h3>
            <ul className="list-disc list-inside space-y-1">
              {report.goalsCompleted.map((g: string, i: number) => (
                <li key={i} className="text-sm">{g}</li>
              ))}
            </ul>
          </div>
        )}

        {report.goalsDeveloping?.length > 0 && (
          <div className="mb-4 print:mb-2">
            <h3 className="font-semibold text-sm mb-2 text-blue-600">Goals In Progress</h3>
            <ul className="list-disc list-inside space-y-1">
              {report.goalsDeveloping.map((g: string, i: number) => (
                <li key={i} className="text-sm">{g}</li>
              ))}
            </ul>
          </div>
        )}

        {report.evidenceHighlights?.length > 0 && (
          <div className="mb-4 print:mb-2">
            <h3 className="font-semibold text-sm mb-2">Evidence Highlights</h3>
            <ul className="list-disc list-inside space-y-1">
              {report.evidenceHighlights.map((e: string, i: number) => (
                <li key={i} className="text-sm">{e}</li>
              ))}
            </ul>
          </div>
        )}

        {report.childVoiceExcerpts?.length > 0 && (
          <div className="mb-4 print:mb-2">
            <h3 className="font-semibold text-sm mb-2">Child Voice</h3>
            <div className="space-y-2">
              {report.childVoiceExcerpts.map((e: string, i: number) => (
                <p key={i} className="text-sm italic border-l-2 border-primary/30 pl-3">&ldquo;{e}&rdquo;</p>
              ))}
            </div>
          </div>
        )}

        {report.parentReviewKeyPoints?.length > 0 && (
          <div className="mb-4 print:mb-2">
            <h3 className="font-semibold text-sm mb-2">Parent Review Key Points</h3>
            <ul className="list-disc list-inside space-y-1">
              {report.parentReviewKeyPoints.map((p: string, i: number) => (
                <li key={i} className="text-sm">{p}</li>
              ))}
            </ul>
          </div>
        )}

        {report.nextSteps?.length > 0 && (
          <div className="mb-4 print:mb-2">
            <h3 className="font-semibold text-sm mb-2">Next Steps</h3>
            <ul className="list-decimal list-inside space-y-1">
              {report.nextSteps.map((s: string, i: number) => (
                <li key={i} className="text-sm">{s}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border text-center print:mt-4">
          <p className="text-xs text-muted-foreground">Total Child Development Planner</p>
          <p className="text-xs text-muted-foreground">This report reflects real observations and evidence, not numerical scores.</p>
        </div>
      </div>
    </div>
  );
}
