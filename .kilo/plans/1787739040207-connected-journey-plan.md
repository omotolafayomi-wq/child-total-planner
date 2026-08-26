# Plan: Connected Product Journey & Onboarding

## Current State
- Signup redirects directly to `/dashboard/children`
- No onboarding wizard exists
- Dashboard shows static content regardless of user progress
- No progressive "next step" guidance
- Navigation exists but lacks contextual back/home controls on inner pages
- All building blocks exist (child, assess, goals, plan, activities, evidence, reflections, reports) but are disconnected

## Target State
- Signup → Welcome → Add Child → Development Profile → Start Plan → Dashboard
- Dashboard shows personalized "next step" based on user progress
- Every module links to the next logical step
- Back/Dashboard/Home controls on all protected pages
- Progressive disclosure: don't overwhelm new users

## Implementation Plan

### Phase 1: Onboarding Routes & State
1. Create `/app/onboarding/welcome/page.tsx` — Welcome screen with progress indicator
2. Create `/app/onboarding/child/page.tsx` — Add child form (extends existing fields)
3. Create `/app/onboarding/profile/page.tsx` — Development profile collection
4. Create `/app/onboarding/plan/page.tsx` — Plan type selection + summary
5. Create `/app/onboarding/complete/page.tsx` — Success + redirect to dashboard
6. Add onboarding state tracking: store current step in `localStorage` key `tcd_onboarding_state`

### Phase 2: Auth Flow Updates
1. Update `/app/signup/page.tsx` — redirect to `/onboarding/welcome` after signup
2. Update `/app/signin/page.tsx` — preserve redirect but default to `/dashboard`
3. Add onboarding resume check: if `tcd_onboarding_state` exists, offer "Continue where you left off"

### Phase 3: Dashboard Personalization
1. Update `/app/dashboard/page.tsx` — add "Next Step" card at top
2. Implement progress detection logic:
   - No children → "Add your first child"
   - Child exists, no assessment → "Complete development assessment"
   - Assessment done, no goals → "Set priority goals"
   - Goals exist, no plan → "Build your first plan"
   - Plan exists → "View today's activities"
3. Add contextual CTAs that change based on state

### Phase 4: Navigation & Navigation Aids
1. Add `BackButton` component to `components/` with context-aware destinations
2. Add breadcrumb component for desktop
3. Ensure all dashboard pages have `← Dashboard` and `⌂ Home` controls
4. Add sticky bottom CTA on mobile for primary actions

### Phase 5: Pillar Experience Enhancement
1. Update pillar pages (`/learn`, `/live`, etc.) to show:
   - Why it matters
   - Related growth areas from ACTIVITY_LIBRARY
   - Suggested activities with age/cost/safety metadata
   - "Add to Plan" CTA where authenticated
2. Create shared `PillarLayout` component for consistent pillar experience

### Phase 6: Module Connectivity
1. Add "Next Step" links at bottom of each major module:
   - Assessment → Goals
   - Goals → Activities
   - Activities → Plan
   - Plan → Evidence
   - Evidence → Reflection
   - Reflection → Portfolio
   - Portfolio → Report
2. Add contextual success messages after each action

### Phase 7: Plan Creation Wizard
1. Create `/app/dashboard/plan/create/page.tsx` — multi-step wizard
2. Steps: Type → Dates → Time → Priorities → Review → Generate
3. Persist wizard state to localStorage during creation
4. Generate realistic plan based on child profile data

### Phase 8: Data Persistence & Recovery
1. Ensure all onboarding steps call `createChild`, etc. immediately
2. Add error recovery UI with "Your information hasn't been lost" messaging
3. Auto-save form drafts to localStorage during onboarding

### Phase 9: Visual Polish
1. Add progress indicator component (step 1 of 4, etc.)
2. Ensure mobile-first responsive design for all new pages
3. Add professional SVG illustrations to onboarding steps
4. Ensure consistent icon family across all new components

### Phase 10: Testing & Validation
1. Test complete new-user journey end-to-end
2. Test multi-child switching
3. Test onboarding resume after mid-flow exit
4. Test all redirects and auth guards
5. Test mobile at 320px, 375px, 768px, 1024px
6. Verify existing functionality remains intact

## Open Questions
1. Should onboarding state be stored per-user in localStorage, or in the parent record? **Recommendation: localStorage keyed by parent ID for simplicity, since this is a client-side store app.**
2. Should there be a way to restart onboarding from the dashboard? **Recommendation: Yes, a small "Restart setup" link in profile settings.**
3. Should the development profile during onboarding create actual `Assessment` records, or just store raw text in the child record? **Recommendation: Store as assessment records so they appear in the existing assessment flow.**
4. Should `/login` and `/signin` be consolidated? **Recommendation: Keep both for now to avoid breaking links; make them functionally identical.**

## Risks & Mitigations
- **Risk:** Onboarding adds many new routes and could break existing navigation
- **Mitigation:** Keep onboarding routes under `/onboarding/*` separate from dashboard; AppShell already excludes auth/landing/legal pages
- **Risk:** Existing users see onboarding
- **Mitigation:** Only show onboarding to users created after this update, or users with no children
- **Risk:** Plan wizard duplicates existing weekly/monthly plan pages
- **Mitigation:** Wizard outputs to existing plan pages; don't replace them

## Open Issue: Broken Empty-State CTA

### Problem
Two "Add Your First Child" buttons still point to the old `/dashboard/children` page instead of the new guided onboarding flow:

1. `app/dashboard/page.tsx` line 168 — dashboard empty state when `!selectedChild`
2. `components/AppShell.tsx` line 307 — AppShell empty state when no child selected

When a new user clicks either button, they land on the old child-management page rather than entering the `/onboarding/child` → `/onboarding/profile` → `/onboarding/plan` flow.

### Root Cause
The onboarding routes and empty-state CTAs were updated independently. The dashboard and AppShell empty states were never changed from `/dashboard/children` to `/onboarding/child`.

### Fix
Change both empty-state CTA links from `/dashboard/children` to `/onboarding/child`:

- `app/dashboard/page.tsx:168` — `<Link href="/dashboard/children"` → `<Link href="/onboarding/child"`
- `components/AppShell.tsx:307` — `<Link href="/dashboard/children"` → `<Link href="/onboarding/child"`

### Validation
1. Create new account → should land on `/onboarding/welcome`
2. Click through onboarding → should reach `/dashboard` with child selected
3. Sign out, sign in with account that has no children → should be redirected to `/onboarding/welcome` by AppShell guard
4. If onboarding state is cleared but session remains, empty-state "Add Your First Child" should go to `/onboarding/child`

### Notes
- `/dashboard/children` remains functional for users who want to manage children directly
- The onboarding flow creates real child records via `createChild()` — no data duplication
- AppShell already guards: if onboarding is incomplete, users are redirected away from dashboard before seeing the empty state
