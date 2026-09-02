"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ACTIVITY_LIBRARY, PILLARS } from "@/lib/store";

const PILLAR_CONFIG: Record<string, { title: string; description: string; icon: string; color: string; module: string }> = {
  learn: {
    title: "Learn",
    description: "Build knowledge, literacy, thinking, communication and appropriate academic readiness.",
    icon: "📚",
    color: "blue",
    module: "/dashboard/modules/digital-builder",
  },
  live: {
    title: "Live",
    description: "Develop practical independence, healthy routines, financial awareness and everyday competence.",
    icon: "🏠",
    color: "emerald",
    module: "/dashboard/modules/life-skills",
  },
  lead: {
    title: "Lead",
    description: "Build communication, teamwork, decision-making, emotional intelligence and responsibility.",
    icon: "🎯",
    color: "purple",
    module: "/dashboard/modules/parent-guidance",
  },
  earn: {
    title: "Earn",
    description: "Explore entrepreneurship, value creation, vocational skills and responsible financial thinking.",
    icon: "💼",
    color: "amber",
    module: "/dashboard/modules/young-entrepreneur",
  },
  serve: {
    title: "Serve",
    description: "Develop kindness, community contribution, environmental responsibility and civic awareness.",
    icon: "🤝",
    color: "rose",
    module: "/dashboard/modules/family-growth",
  },
};

export default function PillarPage({ params }: { params: { pillar: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) {
        router.push("/");
      } else {
        setUser(u);
        setLoading(false);
      }
    });
  }, [router, params.pillar]);

  const config = PILLAR_CONFIG[params.pillar];
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!config) return <div className="min-h-screen flex items-center justify-center">Pillar not found</div>;

  const pillarKey = params.pillar.toUpperCase();
  const pillarActivities = ACTIVITY_LIBRARY.filter((a) => a.pillar === pillarKey);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-primary tracking-tight">Total Child</Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        <div className={`rounded-xl border p-6 md:p-8 mb-8 ${config.color === 'blue' ? 'bg-blue-50 border-blue-200' : config.color === 'emerald' ? 'bg-emerald-50 border-emerald-200' : config.color === 'purple' ? 'bg-purple-50 border-purple-200' : config.color === 'amber' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`}>
          <div className="flex items-start gap-4">
            <span className="text-4xl">{config.icon}</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{config.title}</h1>
              <p className="text-lg text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={config.module} className="btn-primary">Explore Module</Link>
            <Link href="/dashboard/activities" className="btn-outline">Browse Activities</Link>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">What Children Develop</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillarActivities.slice(0, 6).map((activity) => (
              <div key={activity.id} className="card">
                <h3 className="font-semibold mb-1">{activity.title}</h3>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{activity.timeEstimate}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{activity.safetyLevel.replace(/_/g, " ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Featured Activities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillarActivities.map((activity) => (
              <div key={activity.id} className="card-interactive rounded-xl border border-border bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <h3 className="font-semibold text-sm mb-2">{activity.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${PILLARS.find((p) => p.value === activity.pillar)?.color || "bg-gray-100"}`}>
                    {activity.pillar.replace(/_/g, " ")}
                  </span>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                    {activity.safetyLevel.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard/activities" className="btn-primary text-xs flex-1 text-center">Add to Plan</Link>
                  <button className="btn-outline text-xs">Save</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
