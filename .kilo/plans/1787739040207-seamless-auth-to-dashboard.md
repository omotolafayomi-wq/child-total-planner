# Fix Activity Module 404s: Create Missing Modules + URL Mapping

## Goal
Fix the "Explore Module" buttons on activity cards that currently lead to 404 errors by:
1. Creating 5 missing module pages for core pillars (Learn, Live, Lead, Earn, Serve)
2. Fixing the URL slug mapping in the activities page to match existing folder structure

## Current State
- **Activities page** (`app/dashboard/activities/page.tsx` line 248): Generates module URLs using formula `/dashboard/modules/${activity.pillar.toLowerCase().replace(/_/g, "-")}`
- **5 missing module pages**: `learn`, `live`, `lead`, `earn`, `serve`
- **3 mismatched slugs**: `holiday-growth` vs `holiday`, `child-development-tracker` vs `tracker`, `school-term-development` vs `school-term`
- **Existing module pattern** (`app/dashboard/modules/creative-explorer/page.tsx`): Uses PILLAR constant, MODULE_DESCRIPTION, GUIDANCE array, filters ACTIVITY_LIBRARY
- **Existing exams folder**: `app/dashboard/modules/exams/page.tsx` already exists and will be used for EXAM_PREPARATION

## Target State
- All "Explore Module" buttons link to valid module pages
- New module pages follow the same pattern as existing ones
- Content is engaging, practical, and culturally relevant for Nigerian/African families

## Files to Change

### 1. Fix URL Mapping in `app/dashboard/activities/page.tsx`

**Line 248**: Replace formula-based URL generation with a mapping function:

```tsx
const MODULE_SLUG_MAP: Record<string, string> = {
  LEARN: "learn",
  LIVE: "live",
  LEAD: "lead",
  EARN: "earn",
  SERVE: "serve",
  DIGITAL_BUILDER: "digital-builder",
  LIFE_SKILLS: "life-skills",
  YOUNG_ENTREPRENEUR: "young-entrepreneur",
  CREATIVE_EXPLORER: "creative-explorer",
  FUTURE_READY: "future-ready",
  HEALTH_WELLBEING: "health-wellbeing",
  CHARACTER_VALUES: "character-values",
  FAMILY_GROWTH: "family-growth",
  EXPLORATION: "exploration",
  EXAM_PREPARATION: "exams",
  CHILD_DEVELOPMENT_TRACKER: "tracker",
  HOLIDAY_GROWTH: "holiday",
  SCHOOL_TERM_DEVELOPMENT: "school-term",
};

const moduleHref = `/dashboard/modules/${MODULE_SLUG_MAP[activity.pillar] || activity.pillar.toLowerCase().replace(/_/g, "-")}`;
```

### 2. Create `app/dashboard/modules/learn/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, ACTIVITY_LIBRARY, PILLARS } from "@/lib/store";

const PILLAR = "LEARN";
const MODULE_DESCRIPTION = "Build knowledge, literacy, research, critical thinking and communication skills.";
const GUIDANCE = [
  "Create a daily reading routine — even 15 minutes matters.",
  "Ask open-ended questions that encourage thinking, not just answers.",
  "Connect learning to real life: market maths, cooking fractions, family budgeting.",
  "Celebrate effort and progress, not just grades.",
  "Visit libraries, museums, and educational sites together.",
  "Encourage curiosity — when you don't know something, research together.",
];

export default function LearnModulePage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const router = useRouter();

  const activities = ACTIVITY_LIBRARY.filter((a) => a.pillar === PILLAR);
  const pillarInfo = PILLARS.find((p) => p.value === PILLAR);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) { router.push("/signin"); return; }
      setUser(u);
      const kids = getChildren(u.id);
      setChildren(kids);
      if (kids.length > 0) {
        const saved = localStorage.getItem("selectedChildId");
        setSelectedChildId(saved || kids[0].id);
      }
    });
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{pillarInfo?.label || "Learn"}</h1>
          <p className="text-muted-foreground">{MODULE_DESCRIPTION}</p>
        </div>
        {children.length > 1 && (
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

      <div className="card">
        <h2 className="section-title mb-3">Parent Guidance</h2>
        <ul className="space-y-2">
          {GUIDANCE.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="section-title mb-3">Suggested Activities</h2>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No specific activities yet. Check the Activities page for ideas.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-lg border border-border p-3">
                <h3 className="font-semibold">{activity.title}</h3>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. Create `app/dashboard/modules/live/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, ACTIVITY_LIBRARY, PILLARS } from "@/lib/store";

const PILLAR = "LIVE";
const MODULE_DESCRIPTION = "Develop practical independence, household skills, health, safety and everyday competence.";
const GUIDANCE = [
  "Assign age-appropriate chores: sweeping, washing dishes, cooking simple meals.",
  "Teach money management through pocket money and saving goals.",
  "Practice safety skills: road crossing, emergency numbers, stranger awareness.",
  "Encourage self-care: dressing, hygiene, organising personal items.",
  "Involve children in family decisions that affect daily life.",
  "Celebrate practical achievements as much as academic ones.",
];

export default function LiveModulePage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const router = useRouter();

  const activities = ACTIVITY_LIBRARY.filter((a) => a.pillar === PILLAR);
  const pillarInfo = PILLARS.find((p) => p.value === PILLAR);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) { router.push("/signin"); return; }
      setUser(u);
      const kids = getChildren(u.id);
      setChildren(kids);
      if (kids.length > 0) {
        const saved = localStorage.getItem("selectedChildId");
        setSelectedChildId(saved || kids[0].id);
      }
    });
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{pillarInfo?.label || "Live"}</h1>
          <p className="text-muted-foreground">{MODULE_DESCRIPTION}</p>
        </div>
        {children.length > 1 && (
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

      <div className="card">
        <h2 className="section-title mb-3">Parent Guidance</h2>
        <ul className="space-y-2">
          {GUIDANCE.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="section-title mb-3">Suggested Activities</h2>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No specific activities yet. Check the Activities page for ideas.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-lg border border-border p-3">
                <h3 className="font-semibold">{activity.title}</h3>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. Create `app/dashboard/modules/lead/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, ACTIVITY_LIBRARY, PILLARS } from "@/lib/store";

const PILLAR = "LEAD";
const MODULE_DESCRIPTION = "Build communication, decision-making, teamwork, responsibility and mentoring skills.";
const GUIDANCE = [
  "Give children leadership roles at home: planning meals, organising family events.",
  "Encourage them to teach younger siblings or peers.",
  "Support group projects at school and community activities.",
  "Model good leadership: listening, fairness, taking responsibility for mistakes.",
  "Discuss real leaders in your community and what makes them effective.",
  "Allow them to make decisions and learn from the consequences.",
];

export default function LeadModulePage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const router = useRouter();

  const activities = ACTIVITY_LIBRARY.filter((a) => a.pillar === PILLAR);
  const pillarInfo = PILLARS.find((p) => p.value === PILLAR);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) { router.push("/signin"); return; }
      setUser(u);
      const kids = getChildren(u.id);
      setChildren(kids);
      if (kids.length > 0) {
        const saved = localStorage.getItem("selectedChildId");
        setSelectedChildId(saved || kids[0].id);
      }
    });
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{pillarInfo?.label || "Lead"}</h1>
          <p className="text-muted-foreground">{MODULE_DESCRIPTION}</p>
        </div>
        {children.length > 1 && (
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

      <div className="card">
        <h2 className="section-title mb-3">Parent Guidance</h2>
        <ul className="space-y-2">
          {GUIDANCE.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="section-title mb-3">Suggested Activities</h2>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No specific activities yet. Check the Activities page for ideas.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-lg border border-border p-3">
                <h3 className="font-semibold">{activity.title}</h3>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5. Create `app/dashboard/modules/earn/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, ACTIVITY_LIBRARY, PILLARS } from "@/lib/store";

const PILLAR = "EARN";
const MODULE_DESCRIPTION = "Foster entrepreneurship, value creation, financial skills and vocational exposure.";
const GUIDANCE = [
  "Encourage small ventures: selling crafts, helping at market, lemonade stand.",
  "Teach the difference between earning, spending, saving and giving.",
  "Discuss different careers and the skills they require.",
  "Let them earn through extra responsibilities beyond normal chores.",
  "Introduce basic business concepts: cost, profit, customer service.",
  "Celebrate creative ideas for making money through honest work.",
];

export default function EarnModulePage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const router = useRouter();

  const activities = ACTIVITY_LIBRARY.filter((a) => a.pillar === PILLAR);
  const pillarInfo = PILLARS.find((p) => p.value === PILLAR);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) { router.push("/signin"); return; }
      setUser(u);
      const kids = getChildren(u.id);
      setChildren(kids);
      if (kids.length > 0) {
        const saved = localStorage.getItem("selectedChildId");
        setSelectedChildId(saved || kids[0].id);
      }
    });
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{pillarInfo?.label || "Earn"}</h1>
          <p className="text-muted-foreground">{MODULE_DESCRIPTION}</p>
        </div>
        {children.length > 1 && (
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

      <div className="card">
        <h2 className="section-title mb-3">Parent Guidance</h2>
        <ul className="space-y-2">
          {GUIDANCE.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="section-title mb-3">Suggested Activities</h2>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No specific activities yet. Check the Activities page for ideas.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-lg border border-border p-3">
                <h3 className="font-semibold">{activity.title}</h3>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 6. Create `app/dashboard/modules/serve/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChildren, ACTIVITY_LIBRARY, PILLARS } from "@/lib/store";

const PILLAR = "SERVE";
const MODULE_DESCRIPTION = "Cultivate community participation, environmental responsibility and civic contribution.";
const GUIDANCE = [
  "Participate together in community clean-ups or neighbour help.",
  "Visit elderly relatives and community members regularly.",
  "Discuss local issues and how families can contribute positively.",
  "Practice environmental care: recycling, planting trees, reducing waste.",
  "Volunteer as a family at church, mosque, or community events.",
  "Teach that serving others builds character and community.",
];

export default function ServeModulePage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const router = useRouter();

  const activities = ACTIVITY_LIBRARY.filter((a) => a.pillar === PILLAR);
  const pillarInfo = PILLARS.find((p) => p.value === PILLAR);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) { router.push("/signin"); return; }
      setUser(u);
      const kids = getChildren(u.id);
      setChildren(kids);
      if (kids.length > 0) {
        const saved = localStorage.getItem("selectedChildId");
        setSelectedChildId(saved || kids[0].id);
      }
    });
  }, [router]);

  function handleChildChange(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("selectedChildId", childId);
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{pillarInfo?.label || "Serve"}</h1>
          <p className="text-muted-foreground">{MODULE_DESCRIPTION}</p>
        </div>
        {children.length > 1 && (
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

      <div className="card">
        <h2 className="section-title mb-3">Parent Guidance</h2>
        <ul className="space-y-2">
          {GUIDANCE.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="section-title mb-3">Suggested Activities</h2>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No specific activities yet. Check the Activities page for ideas.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-lg border border-border p-3">
                <h3 className="font-semibold">{activity.title}</h3>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Validation Plan
1. Run `npm run build` — must pass with no TypeScript errors
2. Verify all module routes exist in build output (learn, live, lead, earn, serve, exams)
3. Manual test flow:
   - Navigate to `/dashboard/activities`
   - Expand each activity card
   - Click "Explore Module" for each activity
   - Verify no 404 errors — all should load their respective module pages

## Out of Scope
- Changes to existing module pages (creative-explorer, digital-builder, exams, etc.)
- Adding new activities to ACTIVITY_LIBRARY
- Changes to the activities page layout or styling beyond URL mapping
- Content for `parent-guidance` module (already exists)
