# Phase 1 Plan: Foundation Stabilization

## Objective
Fix critical auth, session, and server-store issues before implementing UX enhancements.

---

## 1.1 Unify Session Mechanism

### Current Problem
- `lib/auth.ts` uses API routes that set an httpOnly cookie named `session`
- `lib/store.ts` has legacy `getSession()` that reads a different cookie `tcd_session` from localStorage
- This dual mechanism causes auth inconsistency

### Changes
- In `lib/auth.ts`:
  - Update `getSession()` to read from the same `session` cookie as the API routes
  - Actually, `getSession()` is exported but not used by API routes. The API routes use server-side cookie parsing.
  - The client-side `getSession()` in `store.ts` is used by `requireAuth()` and some components.
  - Best approach: Keep `getSession()` in `store.ts` but make it read the `session` cookie (not `tcd_session`), matching the API route cookie name.

### Files to Modify
- `lib/store.ts` — Change `getSession()` to read `session` cookie instead of `tcd_session`
- `lib/store.ts` — Update `createSession()` and `deleteSession()` to use `session` cookie name consistently
- `lib/auth.ts` — Ensure `requireAuth()` works with the unified session

---

## 1.2 Stabilize Server Store

### Current Problem
- `lib/server-store.ts` uses in-memory global arrays (`global.serverParents`, `global.serverSessions`)
- All data is lost on server restart
- After restart, existing users cannot sign in

### Changes
- Add file-based persistence to `lib/server-store.ts`
- Use a `.local/server-store.json` file in the project root
- On each write, persist to file
- On startup, load from file if it exists
- Fall back to in-memory if file read fails

### Files to Modify
- `lib/server-store.ts` — Add file persistence layer

---

## 1.3 Fix Admin Setup Route

### Current Problem
- `app/api/admin/setup/route.ts` uses `getParentByEmail()` and `setParentRole()` from `lib/store.ts`
- These are client-side functions that read/write localStorage
- Server-side code cannot access localStorage

### Changes
- Replace `getParentByEmail` with `getServerParentByEmail` from `lib/server-store.ts`
- Replace `setParentRole` with a new `updateServerParent` function in `lib/server-store.ts`
- Ensure the route works server-side

### Files to Modify
- `app/api/admin/setup/route.ts` — Use server-side store functions
- `lib/server-store.ts` — Add `updateServerParent` function

---

## 1.4 Fix Forgot Password Security

### Current Problem
- `app/api/auth/forgot-password/route.ts` returns the temporary password in the JSON response
- This exposes the password in network logs, browser history, etc.

### Changes
- Store the temporary password server-side (in the parent record or a separate reset token store)
- Return a generic success message: "If an account exists, a temporary password has been sent."
- The client can then show a message directing the user to sign in with the temp password

### Files to Modify
- `app/api/auth/forgot-password/route.ts` — Do not return temp password
- `app/forgot-password/page.tsx` — Update messaging

---

## Validation
After all changes:
1. Run `npm run build` and ensure no TypeScript errors
2. Manually test:
   - Sign up → sign out → sign in (persists across server restart if possible)
   - Admin setup route works
   - Forgot password flow works without exposing temp password
