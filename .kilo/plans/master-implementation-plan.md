# Master Implementation Plan: Total Child Development Planner UX Enhancement

## Overview
Enhance the existing Total Child Development Planner into a cohesive, polished product without rebuilding or removing existing functionality. All changes are additive and connect existing components.

---

## Phase 1: Foundation Stabilization

### 1.1 Fix Session & Auth Consistency
**Files to modify:**
- `lib/auth.ts` — Unify dual session mechanism. `getSession()` should read the httpOnly cookie `session` (same as API routes) instead of separate `tcd_session` localStorage cookie.
- `lib/store.ts` — Remove legacy `createSession`, `getSession`, `deleteSession`, `signOut` client-side functions that use `tcd_session` cookie. Rely solely on `lib/auth.ts` for session management.
- `app/api/auth/signin/route.ts` — Ensure consistent cookie naming (`session`).
- `app/api/auth/signup/route.ts` — Ensure consistent cookie naming (`session`).
- `app/api/auth/session/route.ts` — Ensure consistent cookie naming (`session`).

**Why:** Currently there are two separate session mechanisms (`session` httpOnly cookie from API routes, and `tcd_session` localStorage cookie from client store). This causes auth inconsistency.

### 1.2 Stabilize Server Store
**Files to modify:**
- `lib/server-store.ts` — Add file-based persistence fallback so data survives server restarts. Use a JSON file in `/tmp` or `.local` directory for development.

**Why:** All parent/session data is lost on server restart. This breaks existing user sign-ins after a dev restart.

### 1.3 Fix Admin Setup Route
**Files to modify:**
- `app/api/admin/setup/route.ts` — Replace client-side `getParentByEmail`/`setParentRole` with server-side `getServerParentByEmail`/`updateServerParent`.

**Why:** This route crashes in production because it tries to read localStorage on the server.

---

## Phase 2: Onboarding State & Navigation

### 2.1 Unified Onboarding State Manager
**New file:** `lib/onboarding.ts`
- Centralize onboarding state logic
- Export: `getOnboardingState()`, `saveOnboardingState()`, `clearOnboardingState()`, `isOnboardingComplete()`, `getNextOnboardingStep()`
- Persist to `localStorage` key `tcd_onboarding`

### 2.2 Welcome Screen Enhancement
**Files to modify:**
- `app/onboarding/welcome/page.tsx` — Add the exact copy from PRD sections 4, 5. Improve progress indicator. Add "Skip for Now" CTA that goes to `/dashboard`.

### 2.3 Add Child Step Enhancement
**Files to modify:**
- `app/onboarding/child/page.tsx` — Already has Back/Next. Ensure validation is solid. Add "Save & Add Another Child" button alongside "Save & Create Profile".

### 2.4 Profile Step Enhancement
**Files to modify:**
- `app/onboarding/profile/page.tsx` — Already has Back/Next. Ensure validation is solid.

### 2.5 Plan Step Enhancement
**Files to modify:**
- `app/onboarding/plan/page.tsx` — Already has plan type selection. Add "Explore Activities" and "Discover Interests" CTAs as per PRD section 13. Remove `router.refresh()` after navigation.

### 2.6 Auto-Resume Onboarding
**Files to modify:**
- `components/AppShell.tsx` — Already has onboarding guard. Ensure it checks for incomplete onboarding and redirects to the correct step with a "Continue setting up [Child Name]'s development profile" message.
- `app/onboarding/welcome/page.tsx` — Add resume message if onboarding state exists.

---

## Phase 3: Dashboard & Smart Navigation

### 3.1 Smart Next-Step Card
**Files to modify:**
- `app/dashboard/page.tsx` — Enhance the existing `renderNextStepCard()` with more granular states:
  - No child → "Add Your First Child"
  - Child created, no profile → "Create Development Profile"
  - Profile created, no plan → "Start Plan"
  - Plan created, no assessment → "Assess Child"
  - Assessment complete, no goals → "Set Goals"
  - Goals exist, no activities selected → "Discover Activities"
  - Activities selected, no plan built → "Build Plan"
  - Plan active → "View Today's Plan"
  - Activities completed → "Add Evidence"
  - Evidence added → "Reflect"
  - Reflection complete → "Review"
- Add personalized greeting: "Welcome back, [Parent Name]. Let's keep helping [Child Name] grow."

### 3.2 Back Navigation & Breadcrumbs
**New component:** `components/Breadcrumbs.tsx`
- Desktop: show full breadcrumb trail
- Mobile: show only current page + back button
- Integration: Add to dashboard pages, assessment, goals, activities, evidence, reports, portfolio

**Files to modify:**
- `app/dashboard/assess/page.tsx` — Add BackButton + Breadcrumbs
- `app/dashboard/goals/page.tsx` — Add BackButton + Breadcrumbs
- `app/dashboard/activities/page.tsx` — Add BackButton + Breadcrumbs
- `app/dashboard/evidence/page.tsx` — Add BackButton + Breadcrumbs
- `app/dashboard/reports/page.tsx` — Add BackButton + Breadcrumbs
- `app/dashboard/portfolio/page.tsx` — Add BackButton + Breadcrumbs
- `app/dashboard/plan/weekly/page.tsx` — Add BackButton + Breadcrumbs
- `app/dashboard/plan/monthly/page.tsx` — Add BackButton + Breadcrumbs

### 3.3 Mobile Navigation Optimization
**Files to modify:**
- `components/AppShell.tsx` — Review mobile bottom nav. Ensure high-priority destinations only: Home, Children, Today, Plan, Progress. Move secondary destinations to hamburger menu.

---

## Phase 4: Pillar & Activity Experience

### 4.1 Pillar Detail Pages
**New files:**
- `app/learn/page.tsx` — Real pillar experience page (not redirect)
- `app/live/page.tsx` — Real pillar experience page
- `app/lead/page.tsx` — Real pillar experience page
- `app/earn/page.tsx` — Real pillar experience page
- `app/serve/page.tsx` — Real pillar experience page

Each pillar page should include:
- Hero section with pillar description
- Why it matters
- What children develop
- Related growth areas
- Featured activities (filtered from ACTIVITY_LIBRARY)
- Age/cost/resource filters
- Add to Plan CTA
- Auth-aware: redirect to signin if not authenticated

### 4.2 Activity Detail Pages
**New file:** `app/activities/[id]/page.tsx`
- Full activity detail view
- Skills developed, safety, evidence suggestions
- Add to Plan, Save, Add to Bucket List actions

### 4.3 Growth Area Cards
**Files to modify:**
- `app/dashboard/activities/page.tsx` — Already enhanced. Ensure growth area cards show: name, icon, description, pillar, recommended age, activity count, cost level, safety indicator.

---

## Phase 5: Data Flow & Persistence

### 5.1 Onboarding → Database Flow
**Files to modify:**
- `app/onboarding/child/page.tsx` — Ensure `createChild()` is called and persists correctly.
- `app/onboarding/profile/page.tsx` — Ensure `createAssessment()` is called with profile data.
- `app/onboarding/plan/page.tsx` — Ensure plan selection is saved and flows into planning workflow.

### 5.2 Child Switcher Stability
**Files to modify:**
- `components/AppShell.tsx` — Ensure child switcher works across all pages. Add `useEffect` to sync `selectedChildId` when children list changes.

### 5.3 Dashboard Auto-Selection
**Files to modify:**
- `app/dashboard/page.tsx` — Already fixed in previous session. Ensure fallback child selection works.

---

## Phase 6: Visual Polish & Interaction

### 6.1 Interactive States
**Files to modify:**
- `app/globals.css` — Add hover, focus, active, loading, success states for cards, buttons, icons.
- All component files — Ensure `hover:shadow-md`, `hover:-translate-y-0.5`, `focus-visible:ring-2`, `active:scale-[0.98]` where appropriate.
- Add `@media (prefers-reduced-motion: reduce)` support.

### 6.2 Loading States
**Files to modify:**
- All dashboard pages — Replace "Loading..." text with skeleton loaders or spinner components.
- `app/onboarding/complete/page.tsx` — Already has redirect. Ensure loading state is visible.

### 6.3 Error Recovery
**Files to modify:**
- All forms — Ensure error messages are preserved. Add "Go to Dashboard" action on critical errors.
- `lib/store.ts` — Wrap all localStorage calls in try/catch with fallbacks.

---

## Phase 7: Accessibility & Responsive Testing

### 7.1 Accessibility Audit
**Files to modify:**
- All interactive components — Ensure `aria-label`, `aria-current`, semantic HTML (`<button>` for actions, `<a>` for navigation).
- Forms — Ensure labels, error messages, and required field indicators are accessible.
- Charts/progress bars — Add `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.

### 7.2 Responsive Testing
**Files to modify:**
- `app/dashboard/page.tsx` — Ensure no horizontal overflow at 320px-1920px.
- `app/onboarding/child/page.tsx` — Already responsive. Verify.
- `app/onboarding/profile/page.tsx` — Already responsive. Verify.
- `app/dashboard/activities/page.tsx` — Already responsive. Verify.
- `components/AppShell.tsx` — Verify mobile drawer and bottom nav.

---

## Phase 8: Security Hardening

### 8.1 Server-Side Validation
**Files to modify:**
- All `app/api/` routes — Add input validation, sanitization, and ownership checks.
- `app/api/auth/forgot-password/route.ts` — Do not return temporary password in JSON. Store it server-side and show a generic success message.

### 8.2 Child Ownership Verification
**Files to modify:**
- `lib/store.ts` — Add `assertChildOwnership(parentId, childId)` helper.
- All dashboard pages — Verify `child.parentId === user.id` before rendering child-specific data.

---

## Phase 9: Final Integration & Testing

### 9.1 Acceptance Tests
Run through PRD sections 53-59 manually:
1. New account flow: signup → welcome → add child → profile → start plan → assess → discover → recommend → select → goals → plan
2. Existing user flow: signin → dashboard → select child → view existing plan → continue
3. Multiple children: create 3 children, switch between them, verify data isolation
4. Pillars: unauthenticated click → signin; authenticated click → pillar experience
5. Navigation: every page has Home, Dashboard, Current Child, Back
6. Mobile: test full flow at 320px, 375px, 768px

### 9.2 Build Verification
Run:
```bash
npm run build
```
Fix all TypeScript and build errors.

---

## Implementation Order
1. Phase 1 (Foundation) — Must be done first
2. Phase 2 (Onboarding) — Core user journey
3. Phase 3 (Dashboard) — Most visible improvement
4. Phase 4 (Pillars/Activities) — Content experience
5. Phase 5 (Data Flow) — Reliability
6. Phase 6 (Polish) — Visual/UX
7. Phase 7 (Accessibility) — Compliance
8. Phase 8 (Security) — Hardening
9. Phase 9 (Testing) — Verification

Each phase will be implemented as a separate plan file and executed sequentially.
