"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, getAchievements, createAchievement } from "@/lib/store";

const BADGES = [
  { id: "learner", label: "Learner", icon: "📚", description: "Completed learning activities across multiple areas" },
  { id: "independence", label: "Independence Builder", icon: "🏠", description: "Developed life skills and self-care abilities" },
  { id: "digital", label: "Digital Builder", icon: "💻", description: "Built digital literacy and online safety awareness" },
  { id: "creative", label: "Creative Explorer", icon: "🎨", description: "Engaged in creative expression and artistic activities" },
  { id: "entrepreneur", label: "Young Entrepreneur", icon: "💡", description: "Showed entrepreneurial thinking and initiative" },
  { id: "community", label: "Community Contributor", icon: "🤝", description: "Contributed to community and helped others" },
  { id: "family", label: "Family Contributor", icon: "👨‍👩‍👧‍👦", description: "Strengthened family bonds and traditions" },
  { id: "leader", label: "Young Leader", icon: "⭐", description: "Demonstrated leadership and initiative" },
  { id: "problem-solver", label: "Problem Solver", icon: "🧩", description: "Solved problems creatively and independently" },
  { id: "future-ready", label: "Future Ready", icon: "🚀", description: "Prepared for future opportunities and challenges" },
];

export default function AchievementsPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [achievements, setAchievements] = useState<any[]>([]);
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
        setAchievements(getAchievements(child.id));
      }
    });
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    setAchievements(getAchievements(childId));
  }

  function awardBadge(badgeId: string) {
    if (!selectedChildId) return;
    const existing = achievements.find((a) => a.badge === badgeId);
    if (existing) return;
    createAchievement({
      childId: selectedChildId,
      badge: badgeId,
    });
    setAchievements(getAchievements(selectedChildId));
  }

  const earnedBadges = achievements.map((a) => a.badge);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">Celebrate your child&apos;s development milestones</p>
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
          <p className="text-muted-foreground">Select a child to view achievements.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="section-title mb-4">Badges</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Award badges to recognise your child&apos;s achievements. Click &quot;Award&quot; when your child demonstrates the skill or quality.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BADGES.map((badge) => {
                const earned = earnedBadges.includes(badge.id);
                const earnedDate = earned ? achievements.find((a) => a.badge === badge.id)?.date : null;
                return (
                  <div key={badge.id} className={`pillar-card ${earned ? "border-growth/30 bg-growth/5" : ""}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{badge.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{badge.label}</h3>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        {earned ? (
                          <div className="mt-2 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-growth"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <span className="text-xs text-growth font-medium">
                              Earned {earnedDate ? new Date(earnedDate).toLocaleDateString() : ""}
                            </span>
                          </div>
                        ) : (
                          <button onClick={() => awardBadge(badge.id)} className="btn-outline text-xs mt-2">
                            Award Badge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card bg-muted/50">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Note:</span> This is a private record for your family. There are no public leaderboards or comparisons.
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-muted-foreground mb-3">Continue the development journey.</p>
            <Link href="/dashboard" className="btn-primary">Continue Journey</Link>
          </div>
        </>
      )}
    </div>
  );
}

