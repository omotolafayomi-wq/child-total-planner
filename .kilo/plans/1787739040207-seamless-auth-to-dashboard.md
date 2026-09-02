# Seamless Sign-in → Onboarding → Dashboard Flow

## Goal
Fix the sign-in flow so that:
1. New users always start at onboarding/welcome after sign-in
2. Returning users (with children) skip onboarding and go to dashboard
3. Full onboarding flow (welcome → child → profile → plan → complete) works without glitches
4. Dashboard is the final destination after onboarding completion

## Current Issues
- `app/signin/page.tsx` redirects to `/dashboard` instead of `/onboarding/welcome`
- `app/onboarding/welcome/page.tsx` doesn't check if user has children (should skip to dashboard for returning users)
- `app/onboarding/complete/page.tsx` auto-redirects to dashboard after 4 seconds but may have timing issues
- No clear "onboarding completed" flag to prevent returning users from seeing onboarding again

## Target Flow
```
Sign-in → Check children count
  ├── No children → /onboarding/welcome → child → profile → plan → complete → /dashboard
  └── Has children → /dashboard
```

## Files to Change

### 1. `app/signin/page.tsx` — Redirect to onboarding after sign-in

**Line 39**: Change redirect destination and add children check

```tsx
// Before:
router.push("/dashboard");

// After:
const kids = getChildren(u.id);
if (kids.length === 0) {
  router.push("/onboarding/welcome");
} else {
  router.push("/dashboard");
}
```

**Add import** at top:
```tsx
import { signIn, getCurrentUser } from "@/lib/auth";
import { getChildren } from "@/lib/store";
```

**Update handleSubmit** to use async/await properly and check children:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    await signIn(email, password);
    setEmail("");
    setPassword("");
    const u = await getCurrentUser();
    if (u) {
      const kids = getChildren(u.id);
      if (kids.length === 0) {
        router.push("/onboarding/welcome");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  } catch (err) {
    setError((err as Error)?.message || "Failed to sign in.");
  } finally {
    setLoading(false);
  }
};
```

### 2. `app/signup/page.tsx` — Redirect to onboarding after sign-up

**Line 46**: Change redirect destination

```tsx
// Before:
router.push("/dashboard?welcome=1");

// After:
router.push("/onboarding/welcome");
```

### 3. `app/onboarding/welcome/page.tsx` — Skip to dashboard for returning users

**Add children check** in the second useEffect (after line 54):

```tsx
useEffect(() => {
  if (!user) {
    router.push("/signin");
    return;
  }
  // Skip to dashboard if user already has children
  const kids = getChildren(user.id);
  if (kids.length > 0) {
    router.push("/dashboard");
    return;
  }
  const existing = getStoreOnboardingState(user.id);
  if (existing && existing.step !== "welcome") {
    router.push(`/onboarding/${existing.step}`);
    return;
  }
  const state = {
    step: "welcome" as const,
    parentId: user.id,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveStoreOnboardingState(state);
}, [user, router]);
```

**Add import**:
```tsx
import { getCurrentUser } from "@/lib/auth";
import { getChildren, getOnboardingState as getStoreOnboardingState, saveOnboardingState as saveStoreOnboardingState } from "@/lib/store";
```

### 4. `app/onboarding/child/page.tsx` — Ensure smooth redirect to profile

**Line 195**: Keep existing redirect to `/onboarding/profile` after child creation

The current flow already redirects to `/onboarding/profile` after saving. No changes needed here.

### 5. `app/onboarding/profile/page.tsx` — Ensure smooth redirect to plan

Verify the profile page redirects to `/onboarding/plan` after completion.

### 6. `app/onboarding/plan/page.tsx` — Ensure smooth redirect to complete

Verify the plan page redirects to `/onboarding/complete` after completion.

### 7. `app/onboarding/complete/page.tsx` — Smooth redirect to dashboard

**Current behavior**: Auto-redirects to `/dashboard` after 4 seconds

**Improvement**: Add a "Go to Dashboard" button for immediate navigation and ensure the auto-reload is reliable:

```tsx
useEffect(() => {
  if (user && existing?.childId) {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 4000);
    return () => clearTimeout(timer);
  }
}, [user, existing, router]);
```

The current implementation already has this. Ensure the button is clearly visible.

### 8. `components/AppShell.tsx` — Remove onboarding redirect logic

The AppShell should NOT redirect to onboarding. The sign-in page handles this decision. Remove any remaining onboarding redirect logic in AppShell if present.

## Validation Plan
1. Run `npm run build` — must pass with no TypeScript errors
2. Manual test flow:
   - **New user sign-up**: Create account → should land on `/onboarding/welcome`
   - **Complete onboarding**: Fill child form → profile → plan → complete → should land on `/dashboard`
   - **Returning user sign-in**: Sign out → sign in again → should land directly on `/dashboard` (skip onboarding)
   - **Direct sign-in as new user**: Sign in with account that has no children → should land on `/onboarding/welcome`

## Out of Scope
- Changes to onboarding form fields or validation
- Changes to dashboard content or layout
- Changes to sign-up form fields
- Adding new onboarding steps
