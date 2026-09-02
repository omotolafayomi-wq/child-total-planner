# Public Onboarding Flow: Remove Auth Modal, Collect Credentials at Onboarding Start

## Goal
1. Remove AuthModal completely
2. Make onboarding fully public — no authentication required to start
3. Collect parent email/password at `/onboarding/welcome` and create account immediately
4. New user flow: `/onboarding/welcome` → child → profile → plan → complete → `/dashboard`
5. Returning users: go directly to `/dashboard`
6. Pillar icons on landing page → `/dashboard`

## Design Decisions (Resolved)
- **Auth timing**: Account created at onboarding start (`/onboarding/welcome` collects email/password)
- **Public onboarding**: No `getCurrentUser()` checks in onboarding pages
- **No auth modal**: Landing page CTA goes directly to `/onboarding/welcome`
- **Returning users**: Landing page detects session; if exists → `/dashboard`

## Tasks

### 1. Update `app/onboarding/welcome/page.tsx` — Add account creation

**Current state**: Checks for user, redirects to `/signin` if not authenticated.

**Changes needed**:
- Remove `getCurrentUser()` auth check
- Add email and password fields to the welcome step
- On "Add My Child" button click:
  1. Validate email and password
  2. Call `signUp(email, name, password)` to create account
  3. Save onboarding state with new parentId
  4. Redirect to `/onboarding/child`
- If user refreshes page and onboarding state exists with a valid session, continue from current step
- Store name from form (not just child name)

**New form fields on welcome page**:
- Parent full name
- Email address
- Password (min 6 chars)
- Keep existing "Add My Child" and "Explore First" buttons

### 2. Remove auth guards from all onboarding pages

Update these pages to remove `getCurrentUser()` checks and `/signin` redirects:
- `app/onboarding/welcome/page.tsx` — handled above
- `app/onboarding/child/page.tsx` — remove `router.push("/signin")`
- `app/onboarding/profile/page.tsx` — remove `router.push("/")`
- `app/onboarding/plan/page.tsx` — remove `router.push("/signin")`
- `app/onboarding/complete/page.tsx` — remove `router.push("/signin")`

Each page should:
- Load onboarding state from localStorage
- If no onboarding state exists, redirect to `/onboarding/welcome`
- If onboarding state exists but no session, use the stored parentId for data operations
- Continue the flow without requiring authentication

### 3. Update `components/AppShell.tsx` — Allow public onboarding access

**Current state**: AppShell redirects unauthenticated users away from `/onboarding` pages.

**Changes needed**:
- Keep the auth guard for dashboard pages
- Allow `/onboarding` pages to render without session
- The onboarding pages themselves will handle state management

### 4. Update `app/page.tsx` — Remove auth modal, simplify CTAs

**Changes needed**:
- Remove `AuthModal` component and all related state (`authModalOpen`, `authModalTab`)
- Remove `useRouter` import if no longer needed
- "Start My Child's Development Plan" button → always goes to `/onboarding/welcome`
- Pillar icon buttons → go to `/dashboard` (requires auth, AppShell will handle redirect)
- Remove conditional rendering based on `session`
- Keep the image, brand text, and all other landing page content

### 5. Update redirect targets across the app

Since `/signin`, `/signup`, `/login` are deleted, ensure no remaining references exist:
- Search for any `router.push("/signin")`, `router.push("/signup")`, `router.push("/login")`
- Replace with appropriate redirects (`/` or `/onboarding/welcome`)

### 6. Update onboarding state management

The onboarding state currently stores `parentId`. After public onboarding:
- When account is created at `/onboarding/welcome`, store the new parentId in onboarding state
- Subsequent onboarding pages use this parentId for `createChild`, `saveOnboardingState`, etc.
- On completion, the user has a valid session and can access `/dashboard`

## Files to Modify
- `app/onboarding/welcome/page.tsx` — add account creation form
- `app/onboarding/child/page.tsx` — remove auth guard
- `app/onboarding/profile/page.tsx` — remove auth guard
- `app/onboarding/plan/page.tsx` — remove auth guard
- `app/onboarding/complete/page.tsx` — remove auth guard
- `app/page.tsx` — remove AuthModal, simplify CTAs
- `components/AppShell.tsx` — allow public onboarding
- Any other pages with old auth redirects

## Files to Delete
- `components/AuthModal.tsx`

## Dependencies
- No new dependencies required

## Validation Plan
1. Run `npm run build` — must pass with no TypeScript errors
2. Manual test flow:
   - Visit `/` as unauthenticated user → see landing page with photo, brand text, CTA button
   - Click "Start My Child's Development Plan" → go to `/onboarding/welcome`
   - Fill in parent name, email, password → click "Add My Child" → account created → redirect to `/onboarding/child`
   - Complete child form → `/onboarding/profile`
   - Complete profile form → `/onboarding/plan`
   - Complete plan → `/onboarding/complete`
   - Auto-redirect to `/dashboard` → see dashboard with new child
   - Sign out → back to landing page
   - Click pillar icons → redirect to `/dashboard` (requires sign in)
   - Sign in with created account → go to `/dashboard`

## Out of Scope
- Password reset flow improvements
- Social auth (Google, Apple, etc.)
- Remembering partially completed onboarding across sessions
- Email verification
