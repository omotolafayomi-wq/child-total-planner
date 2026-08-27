# Phase 3 Plan: Dashboard & Smart Navigation

## Objective
Enhance dashboard with smart next-step system, back navigation, breadcrumbs, and mobile optimization.

---

## 3.1 Smart Next-Step Card

### File: `app/dashboard/page.tsx`
Enhance `renderNextStepCard()` with these states in order:
1. No child → "Add Your First Child" → `/onboarding/child`
2. Child exists, no assessment → "Create Development Profile" → `/onboarding/profile`
3. Profile exists, no plan → "Start Plan" → `/onboarding/plan`
4. Plan exists, no assessment → "Assess Child" → `/dashboard/assess`
5. Assessment exists, no goals → "Set Goals" → `/dashboard/goals`
6. Goals exist, no activities → "Discover Activities" → `/dashboard/activities`
7. Activities selected, no plan → "Build Plan" → `/dashboard/plan/weekly`
8. Plan active → "View Today's Plan" → `/dashboard/plan/weekly`
9. Activities completed → "Add Evidence" → `/dashboard/evidence`
10. Evidence added → "Reflect" → `/dashboard/reflections/parent-review`
11. Reflection complete → "Review" → `/dashboard/reports`

Update greeting to use actual names:
```tsx
<h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
<p className="text-muted-foreground">Let's keep helping {selectedChild?.name || 'your child'} grow.</p>
```

---

## 3.2 Breadcrumbs Component

### New file: `components/Breadcrumbs.tsx`
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/children": "My Children",
  "/dashboard/assess": "Assessment",
  "/dashboard/goals": "Goals",
  "/dashboard/activities": "Activities",
  "/dashboard/evidence": "Evidence",
  "/dashboard/reports": "Reports",
  "/dashboard/portfolio": "Portfolio",
  "/dashboard/profile": "Profile",
  "/dashboard/plan/weekly": "Weekly Plan",
  "/dashboard/plan/monthly": "Monthly Plan",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  
  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = breadcrumbMap[href] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { href, label };
  });

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      <Link href="/dashboard" className="hover:text-foreground transition-colors" aria-label="Dashboard">
        <Home className="w-4 h-4" />
      </Link>
      {crumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center gap-2">
          <ChevronRight className="w-3 h-3" />
          {index === crumbs.length - 1 ? (
            <span className="text-foreground font-medium" aria-current="page">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
```

---

## 3.3 Add Breadcrumbs to Dashboard Pages

### Files to modify:
- `app/dashboard/assess/page.tsx` — Import and add `<Breadcrumbs />` near top
- `app/dashboard/goals/page.tsx` — Import and add `<Breadcrumbs />` near top
- `app/dashboard/activities/page.tsx` — Import and add `<Breadcrumbs />` near top
- `app/dashboard/evidence/page.tsx` — Import and add `<Breadcrumbs />` near top
- `app/dashboard/reports/page.tsx` — Import and add `<Breadcrumbs />` near top
- `app/dashboard/portfolio/page.tsx` — Import and add `<Breadcrumbs />` near top
- `app/dashboard/plan/weekly/page.tsx` — Import and add `<Breadcrumbs />` near top
- `app/dashboard/plan/monthly/page.tsx` — Import and add `<Breadcrumbs />` near top

---

## 3.4 Mobile Navigation Optimization

### File: `components/AppShell.tsx`
- Review mobile bottom nav items. Keep only high-priority: Home, Children, Today (dashboard), Plan, Progress (goals/evidence)
- Move secondary items (Assess, Reports, Profile) into hamburger menu
- Ensure bottom nav has safe-area padding: `pb-[env(safe-area-inset-bottom)]`
- Ensure all nav items have `min-h-[44px] min-w-[56px]` for touch targets

---

## Validation
Run `npm run build` and verify dashboard loads with contextual next-step card and breadcrumbs.
