# Onboarding Dashboard: Logged-in Empty State with Modal & Public Preview

## Goal
Replace the current logged-in empty state (in AppShell) with an onboarding dashboard that:
1. Shows "Welcome to Total Child" with description
2. "Add your child" opens a modal with the child form (no page redirect)
3. "Explore Activity" shows a public preview of activities without requiring auth

## Current State
- `AppShell.tsx` lines 404-419: Empty state with "Welcome to Total Child", links to `/onboarding/child` and `/dashboard/activities`
- `app/dashboard/activities/page.tsx`: Requires auth, redirects to `/signin` if no user
- `lib/store.ts` line 321: `createChild` exists, requires `parentId`, `name`, `age`, `schoolLevel`, `interests[]`, `strengths[]`, `areasForSupport[]`
- `AppShell.tsx` `session` object has `{ id, email, name }` where `id` is the parentId

## Target State
- Empty state shows onboarding dashboard with modal-triggering CTA
- Child form opens in a modal overlay, creates child with default empty arrays for interests/strengths/areasForSupport
- Activities page is accessible as a public preview (read-only, no auth required)

## Files to Change

### 1. `components/AppShell.tsx` — Onboarding Dashboard Empty State

**Add state for modal** (near other state declarations around line 153):
```tsx
const [showChildModal, setShowChildModal] = useState(false);
```

**Replace empty state block** (lines 404-419):
```tsx
{!selectedChildId && childrenList.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-8 sm:py-20 text-center">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <ChildrenIcon />
    </div>
    <h1 className="text-2xl font-bold mb-2">Welcome to Total Child</h1>
    <p className="text-muted-foreground mb-6 max-w-md px-4">
      Add your first child to begin their development journey across LEARN, LIVE, LEAD, EARN and SERVE.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 w-full max-w-md">
      <button onClick={() => setShowChildModal(true)} className="btn-primary w-full sm:w-auto">
        Add your child
      </button>
      <Link href="/activities" className="btn-outline w-full sm:w-auto">
        Explore Activity
      </Link>
    </div>
  </div>
) : (
  children
)}
```

**Add modal component** at the end of the return statement (before closing `</div>` of the root element):
```tsx
{showChildModal && (
  <ChildFormModal
    parentId={session?.id || ""}
    onClose={() => setShowChildModal(false)}
    onSave={(child) => {
      setShowChildModal(false);
      if (session) {
        const kids = getChildren(session.id);
        setChildrenList(kids);
        if (kids.length > 0) {
          setSelectedChildId(kids[0].id);
          localStorage.setItem("selectedChildId", kids[0].id);
        }
      }
    }}
  />
)}
```

**Fix existing bug** at line 193: Change `session.parentId` to `session.id`:
```tsx
// Before:
const kids = getChildren(session.parentId);

// After:
const kids = getChildren(session.id);
```

### 2. `components/ChildFormModal.tsx` — New Component

Create a new modal component with the child onboarding form:

```tsx
"use client";

import { useState } from "react";
import { createChild } from "@/lib/store";

interface ChildFormModalProps {
  parentId: string;
  onClose: () => void;
  onSave: (child: any) => void;
}

export default function ChildFormModal({ parentId, onClose, onSave }: ChildFormModalProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !age || !schoolLevel) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const child = createChild({
        parentId,
        name,
        age: parseInt(age, 10),
        schoolLevel,
        interests: [],
        strengths: [],
        areasForSupport: [],
      });
      onSave(child);
    } catch (err) {
      setError((err as Error)?.message || "Failed to create child.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h2 className="text-xl font-bold mb-4">Add Your Child</h2>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="childName">Child&apos;s Name</label>
            <input id="childName" type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="childAge">Age</label>
            <input id="childAge" type="number" className="input" value={age} onChange={(e) => setAge(e.target.value)} min={0} max={18} required />
          </div>
          <div>
            <label className="label" htmlFor="schoolLevel">School Level</label>
            <select id="schoolLevel" className="input" value={schoolLevel} onChange={(e) => setSchoolLevel(e.target.value)} required>
              <option value="">Select level</option>
              <option value="preschool">Preschool</option>
              <option value="primary">Primary</option>
              <option value="junior_secondary">Junior Secondary</option>
              <option value="senior_secondary">Senior Secondary</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? "Saving..." : "Add Child"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 3. `app/activities/page.tsx` — New Public Preview Page

Create a new public page that shows activities without requiring auth. This page should NOT be inside the `/dashboard` folder since it's public:

```tsx
import { ACTIVITY_LIBRARY, PILLARS } from "@/lib/store";
import Link from "next/link";

export default function PublicActivitiesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Activities</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Discover practical activities to support your child&apos;s development across LEARN, LIVE, LEAD, EARN and SERVE.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACTIVITY_LIBRARY.slice(0, 12).map((activity) => (
          <div key={activity.id} className="card">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {PILLARS.find((p) => p.value === activity.pillar)?.label || activity.pillar}
              </span>
            </div>
            <h3 className="font-semibold mb-2">{activity.title}</h3>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-4">
          Want to save activities and create personalized plans?
        </p>
        <Link href="/signup" className="btn-primary">
          Create Free Account
        </Link>
      </div>
    </div>
  );
}
```

## Validation Plan
1. Run `npm run build` — must pass with no TypeScript errors
2. Manual test flow:
   - Sign in with new account (no children) → see onboarding dashboard in main content area
   - Click "Add your child" → modal opens with form
   - Fill form and submit → modal closes, child is selected, dashboard content appears
   - Click "Explore Activity" → goes to `/activities` public preview (no auth required)
   - Public activities page shows grid of activities with sign-up CTA at bottom

## Out of Scope
- Full multi-step onboarding flow in modal (keep it simple: name, age, school level)
- Persisting modal state across page refreshes
- Advanced filtering/search on public activities preview
- Collecting interests/strengths/areasForSupport in the modal (can be added later via onboarding/profile page)
