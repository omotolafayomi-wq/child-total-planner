# Seamless Workflow Navigation Plan

## Goal
Make every button, icon, and link follow the ASSESS → PLAN → ACT → TRACK → REVIEW → IMPROVE → CONTINUE workflow without ever sending the user back to the landing page. Add a conspicuous confidentiality notice and a contextual pop-up guide.

## Current State
- 30+ dashboard/module pages redirect to `/` when onboarding state is missing.
- `AppShell.tsx` nav includes `Home → /`, logo links to `/`, and sign-out pushes `/`.
- Onboarding pages (welcome, child, profile, plan, complete) have header logos linking to `/`.
- Privacy messaging exists but is small/low-contrast on the landing page and only appears at the end of the welcome wizard.
- Dashboard already has a floating “What’s next” popup (`app/dashboard/page.tsx:508`).

## Target State
- No page redirects to `/` from onboarding, dashboard, or module routes.
- App shell treats `/dashboard` as the home for users with onboarding state.
- All CTAs advance the workflow or open the correct functional page.
- Confidentiality notice is visible on onboarding and dashboard.
- A contextual guide popup appears on first visit to key pages.

## Tasks

### 1. Replace all auth-guard redirects to landing page
**Files:** all `app/dashboard/**/page.tsx`, `app/dashboard/modules/**/page.tsx`, `app/[pillar]/page.tsx`, `app/admin/signups/page.tsx`

Change:
```tsx
if (!u) { router.push("/"); return; }
```
To:
```tsx
const onboarding = getStoreOnboardingState();
if (!onboarding) {
  router.replace("/onboarding/welcome");
  return;
}
```

Also remove `getCurrentUser()` imports/calls where they only guard routes.

### 2. Update AppShell routing
**File:** `components/AppShell.tsx`

- Change `navItems[0]` from `href: "/"` to `href: "/dashboard"`.
- Change header logo `Link href="/"` to `Link href="/dashboard"`.
- Change sign-out `router.push("/")` to `router.push("/onboarding/welcome")` (or `/dashboard` if you prefer returning to dashboard without state).
- Update `visibleNav` filter: keep all items visible when a child is selected; when no child, show only `/dashboard/children`, `/dashboard/assess`, and `/dashboard/activities`.

### 3. Update onboarding page logos/back links
**Files:** `app/onboarding/welcome/page.tsx`, `app/onboarding/child/page.tsx`, `app/onboarding/profile/page.tsx`, `app/onboarding/plan/page.tsx`, `app/onboarding/complete/page.tsx`

Change header logo links from `/` to `/dashboard` (or `/onboarding/welcome` if no state exists yet).

### 4. Synchronize “Create Development Profile” with Dashboard
**File:** `app/onboarding/profile/page.tsx`

On successful profile save, set onboarding step to `"complete"` and redirect to `/dashboard?welcome=1`. Currently it redirects to `/onboarding/plan`. This keeps the user in the dashboard and triggers the welcome banner + next-step card.

### 5. Ensure workflow CTAs advance correctly
**File:** `app/dashboard/page.tsx`

Keep the existing `renderNextStepCard()` and `getNextStepRecommendation()` logic. Verify links:
- Add child → `/onboarding/child`
- Assess → `/dashboard/assess`
- Plan → `/onboarding/plan`
- Goals → `/dashboard/goals`
- Evidence → `/dashboard/evidence`
- Keep going → `/dashboard/activities`

### 6. Add conspicuous confidentiality message
**Files:** `app/onboarding/welcome/page.tsx`, `app/dashboard/page.tsx`, `components/AppShell.tsx`

Add a persistent but unobtrusive trust badge:
```tsx
<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border">
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  <span>Your data stays on this device. Nothing is uploaded or shared.</span>
</div>
```
Place it:
- Onboarding welcome: just below the page title.
- Dashboard: just below the greeting section, before the next-step card.
- AppShell footer: as a permanent trust line.

### 7. Add pop-up guide (first-visit coach)
**File:** `app/dashboard/page.tsx`

Extend the existing floating FAB into a contextual coach:
- On first render, if `!sessionStorage.getItem("tour_seen")`, auto-open the popup after 1s.
- Popup content: “Welcome! Your next step is to {nextStep.title}. {nextStep.buttonText} to begin.”
- Add a “Don’t show again” checkbox that sets `sessionStorage.setItem("tour_seen", "true")`.
- Close button already exists.

### 8. Performance / speed polish
- Ensure `AppShell` children rendering uses `children` directly (it already does).
- Add `loading="lazy"` to any below-the-fold images if present.
- No additional heavy dependencies; keep using existing Tailwind classes.

## Validation Plan
1. Run `npm run build` — must pass with no TypeScript errors.
2. Manual walkthrough:
   - Visit `/` → click “Start My Child's Development Plan” → `/onboarding/welcome` → complete biodata → `/onboarding/child` → add child → `/onboarding/profile` → save → redirects to `/dashboard?welcome=1`.
   - From dashboard, click Assess → `/dashboard/assess`; Goals → `/dashboard/goals`; etc. None return to `/`.
   - Sign out → returns to `/onboarding/welcome` (or `/dashboard` if chosen).
   - While on any dashboard page, refresh — stays on same page, no redirect to `/`.
   - Confidentiality badge visible on onboarding and dashboard.
   - Popup guide appears on first dashboard visit.

## Out of Scope
- Backend auth/session removal (API routes kept).
- Multi-device sync.
- Detailed per-step workflow pages.
