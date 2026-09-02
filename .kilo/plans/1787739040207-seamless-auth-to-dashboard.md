# No-Auth Public Onboarding: Biodata Collection + Icon Landing Page

## Goal
1. Remove all authentication (no sign-in, sign-up, sessions, cookies)
2. Replace first onboarding step with parent biodata collection form (Next/Back/Submit)
3. Remove all auth redirects across the app
4. Pillar Explore buttons → `/activities` after onboarding, `/dashboard` before onboarding
5. Landing page: welcoming icon-based overview instead of stock photo
6. Add privacy caveat and required agreement checkbox before onboarding submission

## Design Decisions (Resolved)
- **No auth**: No server-side sessions, no cookies, no `/api/auth/signin` or `/api/auth/signup` calls from onboarding
- **User identification**: LocalStorage-only via onboarding state (`/onboarding/welcome` creates a local parent profile)
- **Onboarding**: Multi-step biodata form with Next/Back/Submit buttons
- **Conditional routing**: Check onboarding completion status for Explore buttons
- **Landing page**: Icon grid explaining the 5 pillars and features, no external image
- **Privacy**: Show privacy caveat and require agreement checkbox before final submission

## Tasks

### 1. Update `app/onboarding/welcome/page.tsx` — Privacy caveat and agreement checkbox

**Add to `app/onboarding/welcome/page.tsx`:**

1. Add state after `currentStep`:
```tsx
const [agreed, setAgreed] = useState(false);
```

2. Add check at top of `handleSubmit`:
```tsx
if (!agreed) {
  setError("Please agree to the privacy statement before continuing.");
  return;
}
```

3. Replace final submit button JSX with:
```tsx
<div className="rounded-lg border border-border bg-muted/30 p-4">
  <p className="text-xs text-muted-foreground leading-relaxed">
    <span className="font-semibold text-foreground">Privacy note:</span>{" "}
    The information you provide here is stored only in your browser and is used solely for your personal planning experience.
    It is not shared with third parties, and you remain in control of your data throughout.
  </p>
</div>
<label className="flex items-start gap-3 rounded-lg border border-border bg-white p-4 cursor-pointer">
  <input
    type="checkbox"
    checked={agreed}
    onChange={(e) => setAgreed(e.target.checked)}
    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
  />
  <span className="text-sm text-muted-foreground">
    I have read the privacy note and agree that my data will be used only for my personal planning experience.
  </span>
</label>
<button
  type="submit"
  className="btn-primary w-full"
  disabled={loading || saved || !agreed}
>
  {loading ? "Saving..." : saved ? "Saved" : "Add My Child"}
</button>
{!agreed && (
  <p className="text-xs text-red-600 mt-2">You must agree to the privacy statement before continuing.</p>
)}
```

### 2. Rewrite `app/onboarding/welcome/page.tsx` — Parent biodata form

**Current state**: Collects name, email, password and calls `signUp()`.

**New state**: Collect parent biodata, no auth call.

**Form fields** (multi-step with Next/Back/Submit):
- Step 1: Parent full name, email, phone number
- Step 2: Family location (state/city), number of children
- Submit: saves to localStorage onboarding state, redirects to `/onboarding/child`

**Remove**:
- `signUp` import and call
- `getCurrentUser` check
- Password fields
- Account creation logic

**Keep**:
- Progress indicator
- Redirect to `/onboarding/child` after completion

### 2. Update all onboarding pages — Remove auth guards

**Pages to update**:
- `app/onboarding/welcome/page.tsx` — done above
- `app/onboarding/child/page.tsx` — remove `getCurrentUser()`, redirect to `/onboarding/welcome` if no state
- `app/onboarding/profile/page.tsx` — remove `getCurrentUser()`, redirect to `/onboarding/welcome` if no state
- `app/onboarding/plan/page.tsx` — remove `getCurrentUser()`, redirect to `/onboarding/welcome` if no state
- `app/onboarding/complete/page.tsx` — remove `getCurrentUser()`, redirect to `/onboarding/welcome` if no state

**Pattern for each page**:
```tsx
// Remove auth check
// Replace with:
const onboarding = getStoreOnboardingState();
if (!onboarding) {
  router.push("/onboarding/welcome");
}
```

### 3. Update `app/page.tsx` — Icon-based landing page

**Remove**:
- Stock photo (`<img>` from Unsplash)
- Brand text overlay on image
- Session-dependent conditional rendering
- Auth modal references

**Add**:
- Welcoming hero section with icon grid
- 5 pillar icons with descriptions
- Feature cards: Assess, Goals, Activities, Evidence, Reports
- Clear value proposition text
- "Start My Child's Development Plan" button → `/onboarding/welcome`
- "I already have an account / Sign In" button → `/dashboard` (for returning users)

**Layout**:
```
Header: Total Child logo/text
Hero: "Raise a child who can learn, live, lead, earn and serve"
Subtitle: Brief explanation
Icon Grid: 5 pillars + key features
CTA: Start My Child's Development Plan
Secondary CTA: I have a profile / Sign In
Footer: Links
```

### 4. Update pillar Explore buttons — Conditional routing

**Current**: All pillar icons → `/dashboard`

**New logic**:
```tsx
const isOnboardingComplete = /* check onboarding state */;

const handlePillarClick = (slug: string) => {
  if (isOnboardingComplete) {
    router.push(`/dashboard/activities?pillar=${slug}`);
  } else {
    router.push("/dashboard");
  }
};
```

**Update pages**:
- `app/page.tsx` — landing page pillar icons
- `app/[pillar]/page.tsx` — if accessed directly, check onboarding state

### 5. Update `components/AppShell.tsx` — Remove auth guards

**Current**: Redirects unauthenticated users to `/signin`.

**Changes**:
- Remove `getCurrentUser()` check
- Remove session-dependent redirects
- Allow all pages to render without auth
- Dashboard should still work with localStorage data only

**Alternative**: If auth is completely removed, consider removing `AppShell` auth wrapper entirely and let each page handle its own state.

### 6. Remove auth redirects across all pages

Search and update all `router.push("/signin")`, `router.push("/signup")`, `router.push("/login")` to either:
- `/onboarding/welcome` (if user needs to start onboarding)
- `/dashboard` (if they should go to dashboard)
- `/` (landing page)

**Pages to check**:
- All `app/dashboard/**/page.tsx`
- All `app/onboarding/**/page.tsx`
- `app/[pillar]/page.tsx`
- `app/activities/page.tsx`
- `app/reports/**`

### 7. Update dashboard pages to work without auth

**Current**: Dashboard pages call `getCurrentUser()` and redirect if null.

**New approach**:
- Dashboard pages should check for onboarding state in localStorage
- If onboarding state exists, render dashboard with stored parentId
- If no onboarding state, redirect to `/onboarding/welcome`

### 8. Clean up auth-related code

- Remove unused imports: `getCurrentUser`, `signIn`, `signUp`, `signOut` from pages that don't need them
- Consider keeping API routes for future use, but remove client-side calls
- Update `lib/auth.ts` exports if needed

## Files to Modify
- `app/onboarding/welcome/page.tsx` — biodata form, no auth
- `app/onboarding/child/page.tsx` — remove auth guard
- `app/onboarding/profile/page.tsx` — remove auth guard
- `app/onboarding/plan/page.tsx` — remove auth guard
- `app/onboarding/complete/page.tsx` — remove auth guard
- `app/page.tsx` — icon-based landing page
- `components/AppShell.tsx` — remove auth guards
- `app/[pillar]/page.tsx` — conditional routing
- `app/dashboard/page.tsx` — work without auth
- All other dashboard pages — remove auth redirects

## Validation Plan
1. Run `npm run build` — must pass with no TypeScript errors
2. Manual test:
   - Visit `/` → see icon-based landing page
   - Click "Start My Child's Development Plan" → `/onboarding/welcome`
   - Fill biodata form with Next/Back → complete → `/onboarding/child`
   - Complete full onboarding → `/dashboard`
   - Click pillar icons before onboarding → `/dashboard`
   - Click pillar icons after onboarding → `/dashboard/activities?pillar=...`
   - Refresh during onboarding → state preserved, stays on current step
   - No auth prompts anywhere

## Out of Scope
- Backend auth removal (API routes kept for potential future use)
- Data migration for existing users
- Password reset or account recovery
- Multi-device sync without auth
