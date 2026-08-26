# Plan: Connect Onboarding Flow & Navigation

## Current State
- Onboarding routes exist: `/onboarding/welcome`, `/onboarding/child`, `/onboarding/profile`, `/onboarding/plan`, `/onboarding/complete`
- Empty-state CTAs already fixed to point to `/onboarding/child`
- "Total Child" brand link points to `/dashboard`
- Profile icon in header goes to `/dashboard/profile`
- AppShell renders no nav/header on onboarding routes

## Target State
1. Onboarding steps are fully connected with proper navigation between them
2. "Total Child" brand icon links to public landing page (`/`)
3. Parent name/profile icon links to dashboard (`/dashboard`)
4. Every page has meaningful CTAs — no empty shells

## Implementation Tasks

### Task 1: Connect Onboarding Navigation
**Files:** `app/onboarding/welcome/page.tsx`, `app/onboarding/child/page.tsx`, `app/onboarding/profile/page.tsx`, `app/onboarding/plan/page.tsx`, `app/onboarding/complete/page.tsx`

- Add explicit back/next navigation between steps:
  - Welcome → Child: "Add My Child" button (primary), "Explore First" → `/dashboard` (secondary)
  - Child → Profile: "Save & Continue" button, "Save & Finish Later" → `/dashboard`
  - Profile → Plan: "Save & Continue" button, "Save & Finish Later" → `/dashboard`
  - Plan → Complete: "Continue" button, "Skip for Now" → `/dashboard`
  - Complete → Dashboard: "Go to Dashboard" button, "Explore Activities" → `/dashboard/activities`
- Ensure progress indicator updates correctly at each step
- Validate that `saveOnboardingState` is called after each step with updated `step` value

### Task 2: Fix Brand/Logo Navigation
**File:** `components/AppShell.tsx`

- Change `<Link href="/dashboard">` to `<Link href="/">` for the "Total Child" brand text
- Keep the link accessible and styled consistently

### Task 3: Fix Parent Profile Icon Navigation
**File:** `components/AppShell.tsx`

- Change parent profile avatar/link `href` from `/dashboard/profile` to `/dashboard`
- Add `aria-label="Dashboard"` for accessibility

### Task 4: Add CTA to Dashboard Empty State
**File:** `app/dashboard/page.tsx`

- When no child is selected, the empty state already has "Add Your First Child" → `/onboarding/child`
- Add a secondary CTA "Explore Activities" → `/dashboard/activities` for users who want to browse first

### Task 5: Ensure Onboarding Complete Redirects Properly
**File:** `app/onboarding/complete/page.tsx`

- After onboarding completion, clear onboarding state
- Redirect to `/dashboard` with `router.refresh()`
- Show success message briefly before redirect

### Task 6: Add Missing Next-Step Links in Module Pages
**Files:** `app/dashboard/plan/weekly/page.tsx`, `app/dashboard/plan/monthly/page.tsx`, `app/dashboard/portfolio/page.tsx`, `app/dashboard/reports/page.tsx`, `app/dashboard/achievements/page.tsx`

- Add contextual next-step CTA at bottom of each page:
  - Weekly Plan → "Add Evidence" → `/dashboard/evidence`
  - Monthly Plan → "Add Evidence" → `/dashboard/evidence`
  - Portfolio → "Write Reflection" → `/dashboard/reflections/parent-review`
  - Reports → "View Activities" → `/dashboard/activities`
  - Achievements → "Continue Journey" → `/dashboard`

### Task 7: Verify No Empty Shells
- Audit all routes to ensure every page has:
  - A clear page title
  - At least one primary CTA or meaningful content
  - Back navigation where appropriate
  - No dead links or `href="#"`

## Open Questions
1. Should the "Total Child" brand link on onboarding pages also go to `/` or stay as `/dashboard`? **Recommendation: Keep `/dashboard` during onboarding, use `/` only in AppShell header for authenticated users.**
2. Should onboarding have a "Skip" button on every step? **Recommendation: Yes, already implemented as "Save & Finish Later" → `/dashboard`.**

## Validation Steps
1. Create new account → verify redirect to `/onboarding/welcome`
2. Click through each onboarding step → verify navigation and data persistence
3. Complete onboarding → verify redirect to `/dashboard` with child selected
4. Click "Total Child" brand → verify redirect to `/` (landing)
5. Click parent name/avatar → verify redirect to `/dashboard`
6. Verify all dashboard module pages have next-step CTAs
7. Test at mobile breakpoints (320px, 375px, 768px)
