# Plan: Fix Sign-In Glitch + Stabilize Redirects

## Goal
1. Fix the visual glitch on `/signin` caused by a mismatched `Suspense` fallback.
2. Stabilize post-sign-in navigation so it consistently leads to the dashboard (or onboarding when applicable).
3. Ensure the **Total Child** brand link on auth pages always points to `/` (landing page).

---

## Current state
- `app/signin/page.tsx` wraps `SignInForm` in `<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-muted/30" />}>`.
- `SignInForm` now returns a layout with a sticky `<header>` containing the `Total Child` link and a `<main>` content area.
- The `fallback` has **no header** and uses `items-center justify-center`, while the resolved component uses `flex flex-col` with a header. This causes a visible layout shift when `useSearchParams()` resolves.
- Post-sign-in, `handleSubmit` calls `router.push(...)` then `router.refresh()`. The refresh after navigation is unnecessary and can cause flicker or double-navigation behavior.
- There is no explicit loading/redirect state while the auth check runs; the form appears immediately even if the user is already logged in and about to be redirected.

---

## Required changes

### 1. Fix `app/signin/page.tsx`
- Update the `Suspense` fallback to match the header layout so there is no CLS/layout shift:
  ```tsx
  <Suspense fallback={
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border no-print">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-primary tracking-tight">Total Child</span>
        </div>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="card">
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          </div>
        </div>
      </main>
    </div>
  }>
  ```
- Add a `redirecting` state in `SignInForm`:
  ```tsx
  const [redirecting, setRedirecting] = useState(false);
  ```
- In the `useEffect` that checks `getCurrentUser()`, set `redirecting = true` before `router.push(...)`.
- Render a redirect overlay or replace the form body when `redirecting` is true:
  ```tsx
  {redirecting && (
    <div className="text-center py-12 text-muted-foreground">Redirecting...</div>
  )}
  ```
- Remove the unnecessary `router.refresh()` after `router.push(...)` in `handleSubmit`.
- Ensure the `Total Child` link in the header uses `href="/"`.

### 2. Verify `/login` page consistency
- Check `app/login/page.tsx` for the same fallback mismatch. Apply the same pattern if found.

### 3. Validation
- Run `npm run build`.
- Manual checks:
  - Load `/signin` fresh — no layout shift should occur.
  - Sign in with valid credentials — consistent redirect to `/dashboard` (or `/onboarding/...` if incomplete).
  - Click `Total Child` on `/signin` — goes to `/`.

---

## Open questions
- None. The fix is straightforward and fully scoped to `app/signin/page.tsx` and potentially `app/login/page.tsx`.
