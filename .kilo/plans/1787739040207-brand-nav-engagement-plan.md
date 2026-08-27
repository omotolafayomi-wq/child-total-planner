# Plan: Total Child Brand, Form Navigation, and Activity Engagement

## Goal
1. Make the **Total Child** brand link/button visible and clickable on every page, including auth pages, and ensure it always routes to the landing page (`/`).
2. Add **Back / Next** step navigation to long onboarding forms so users can move through sections without losing progress.
3. Make the **Activities** experience more engaging by connecting activities to plans/goals with clear CTAs.

---

## 1. Total Child Brand Everywhere

### Current state
- `components/AppShell.tsx` already shows `Total Child` in the header and links to `/`.
- Auth pages (`app/signin/page.tsx`, `app/signup/page.tsx`, `app/forgot-password/page.tsx`) render full-screen centered cards with **no header**.
- Some onboarding pages have the brand header; others do not.

### Required changes
For every page that currently renders a bare full-screen layout without the branded header, wrap the content with the same header pattern used in `app/onboarding/welcome/page.tsx`:

```tsx
<header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border no-print">
  <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
    <Link href="/" className="text-lg font-bold text-primary tracking-tight">
      Total Child
    </Link>
  </div>
</header>
<main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
  {/* existing page content */}
</main>
```

### Files to update
- `app/signin/page.tsx`
- `app/signup/page.tsx`
- `app/forgot-password/page.tsx`
- `app/login/page.tsx` (if it exists and lacks the header)
- `app/onboarding/plan/page.tsx` (verify it has the header)

### Rule
The `Total Child` link **must** point to `/` (landing page). Never point it to `/dashboard` or any authenticated route, because unauthenticated users also need to reach the landing page.

---

## 2. Back / Next Buttons on Onboarding Forms

### Current state
- `app/onboarding/child/page.tsx` has a single long form with ~12 fields.
- `app/onboarding/profile/page.tsx` has a single long form with 6 textareas.
- Both forms only have a single submit button and a "Save & Finish Later" link.

### Required pattern
Split each form into logical steps and add Back/Next navigation at the bottom.

#### Step design for `child/page.tsx`
- **Step 0 — Basics**: Full Name, Preferred Name, Age, Date of Birth
- **Step 1 — School**: School Level, Gender, School Name, Location
- **Step 2 — More**: Interests, Hobbies, Strengths, Skills, Areas For Support

#### Step design for `profile/page.tsx`
- **Step 0 — Strengths**: Current Strengths, Areas Worth Developing
- **Step 1 — Interests**: Interests, Current Responsibilities
- **Step 2 — Skills**: Existing Skills, Parent Priorities

#### Button behavior
- First step: **Next** only (Back disabled)
- Middle steps: **Back** + **Next**
- Last step: **Back** + **Save & Continue** (submit)
- Show a progress indicator (e.g., "Step 2 of 3") above the form.

### Implementation notes
- Keep the existing `handleSubmit` / save logic intact on the final step.
- Do **not** auto-advance on Next; validate required fields for the current step before advancing. If validation fails, show inline errors.
- Preserve the `ProgressIndicator` component already present in onboarding pages.

---

## 3. Make Activities Engaging with CTAs

### Current state
- `app/dashboard/activities/page.tsx` shows a search/filter bar, a plan-creation form, existing plans, and a grid of activity cards.
- Activity cards are mostly informational (title, description, pillar, cost).
- The only CTA is a generic "Build Plan" card at the bottom.

### Required changes
1. **Add hover lift and shadow** to activity cards so they feel interactive.
2. **Add per-card CTAs**:
   - Primary button: **"Add to Plan"** — adds the activity to the current plan (or opens the plan-creation form pre-selected with that activity).
   - Secondary button: **"View Details"** — opens an inline expandable section or modal with full description, safety notes, and cost alternatives.
   - Tertiary: **"Save"** bookmark icon toggles a saved state (use `localStorage` key `savedActivities`).
3. **Connect activities to goals/modules**:
   - If an activity matches a pillar with an active goal, show a small badge: *"Linked to Goal: [goal text]"* with a link to `/dashboard/goals`.
   - If the activity belongs to a module (e.g., `life-skills`, `digital-builder`), show a link: *"Explore module"* pointing to that module page.
4. **Empty state CTA**: When no activities match the filter, show a friendly message with a button to **"Reset filters"** or **"Browse all activities"**.
5. **"Quick Add" bar**: Add a sticky bar at the top of the activities list that shows how many activities are currently selected (when the plan-creation form is open) with a single **"Create Plan from Selected"** button.

### Files to update
- `app/dashboard/activities/page.tsx`
- Consider extracting a reusable `ActivityCard` component in `components/ActivityCard.tsx` if one does not exist.

---

## 4. Validation & Rollout

1. Run `npm run build` after changes.
2. Manually verify:
   - `/`, `/signin`, `/signup`, `/forgot-password`, `/dashboard`, `/onboarding/child`, `/onboarding/profile` all show the `Total Child` header linking to `/`.
   - Onboarding child and profile forms allow forward/backward navigation without losing entered data.
   - Activities page cards have hover effects, per-card CTAs, and module/goal links where applicable.
3. No database or API changes are required; all state remains client-side / localStorage.

---

## 5. Open Questions
- Should the `Total Child` header also appear on `/login` if that route exists separately from `/signin`? **Recommended**: yes, treat it the same as signin.
- Should saved/bookmarked activities persist across devices? **Recommended**: keep localStorage for now; cross-device sync is out of scope for this task.
