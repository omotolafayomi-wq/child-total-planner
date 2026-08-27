# Phase 5 Plan: Data Flow & Persistence

## Objective
Ensure onboarding flows into database correctly, child switcher works everywhere, and dashboard auto-selects first child.

---

## 5.1 Onboarding → Database Flow

### Files to verify/enhance:
- `app/onboarding/child/page.tsx` — Ensure `createChild()` creates real Child record, childId saved to onboarding state
- `app/onboarding/profile/page.tsx` — Ensure `createAssessment()` creates real Assessment linked to childId
- `app/onboarding/plan/page.tsx` — Ensure plan selection saved and transitions to planning workflow

### No major rewrites needed — flow already exists. Just verify data persistence.

---

## 5.2 Child Switcher Stability

### File: `components/AppShell.tsx`
Add useEffects to ensure child switcher stays in sync:

```tsx
useEffect(() => {
  if (!session) return;
  const kids = getChildren(session.parentId);
  setChildrenList(kids);
  if (kids.length > 0 && !selectedChildId) {
    const saved = localStorage.getItem("selectedChildId");
    const child = kids.find((c: any) => c.id === saved) || kids[0];
    setSelectedChildId(child.id);
    localStorage.setItem("selectedChildId", child.id);
  }
}, [pathname, session, selectedChildId]);
```

---

## 5.3 Dashboard Auto-Selection

### File: `app/dashboard/page.tsx`
Already fixed in previous session. Verify fallback child selection works when `selectedChild` is null but children exist:

```tsx
useEffect(() => {
  if (!selectedChild && children.length > 0) {
    const child = children[0];
    setSelectedChild(child);
    localStorage.setItem("selectedChildId", child.id);
    loadChildData(child.id);
  }
}, [children, selectedChild]);
```

---

## Validation
Run `npm run build` and verify no errors.
