"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, getEvidence, PILLARS } from "@/lib/store";

const PORTFOLIO_SECTIONS = [
  { key: "projects", label: "Projects", types: ["text", "document"] },
  { key: "skills", label: "Skills", types: ["observation"] },
  { key: "creative", label: "Creative Work", types: ["image", "video"] },
  { key: "digital", label: "Digital Work", types: ["document", "image"] },
  { key: "reading", label: "Reading", types: ["text", "observation"] },
  { key: "enterprise", label: "Enterprise", types: ["text", "document"] },
  { key: "community", label: "Community Service", types: ["text", "observation"] },
  { key: "career", label: "Career Exploration", types: ["text", "observation"] },
  { key: "certificates", label: "Certificates", types: ["document"] },
  { key: "reflections", label: "Reflections", types: ["mentor_note", "text"] },
];

export default function PortfolioPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [evidence, setEvidence] = useState<any[]>([]);
  const [filterPillar, setFilterPillar] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");
  const [activeSection, setActiveSection] = useState("all");
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
      setEvidence(getEvidence(child.id));
    }
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
    setEvidence(getEvidence(childId));
  }

  const filteredEvidence = evidence.filter((e) => {
    const matchesPillar = filterPillar === "ALL" || e.pillar === filterPillar;
    const matchesType = filterType === "ALL" || e.type === filterType;
    const matchesDate = !filterDate || e.date === filterDate;
    const matchesSection = activeSection === "all" || PORTFOLIO_SECTIONS.find((s) => s.key === activeSection)?.types.includes(e.type);
    return matchesPillar && matchesType && matchesDate && matchesSection;
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Curate and showcase your child&apos;s development journey</p>
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
          <p className="text-muted-foreground">Select a child to view their portfolio.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="section-title mb-4">Filter & Browse</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="label">Pillar</label>
                <select value={filterPillar} onChange={(e) => setFilterPillar(e.target.value)} className="input">
                  <option value="ALL">All Pillars</option>
                  {PILLARS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Evidence Type</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input">
                  <option value="ALL">All Types</option>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="observation">Observation</option>
                  <option value="mentor_note">Mentor Note</option>
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="input" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveSection("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${activeSection === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                All
              </button>
              {PORTFOLIO_SECTIONS.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${activeSection === section.key ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {filteredEvidence.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No portfolio items yet</h2>
              <p className="text-muted-foreground">Add evidence from the Evidence page to build your child&apos;s portfolio.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{filteredEvidence.length} item(s)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvidence.map((item) => (
                  <div key={item.id} className="pillar-card">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PILLARS.find((p) => p.value === item.pillar)?.color || "bg-gray-100"}`}>
                        {item.pillar.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">{item.type.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-sm font-medium line-clamp-3">{item.description}</p>
                    {item.reflection && (
                      <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">&ldquo;{item.reflection}&rdquo;</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
