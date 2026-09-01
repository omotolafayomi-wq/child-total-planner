# Seamless Auth → Dashboard Flow

## Goal
After sign-up or sign-in, users land on `/dashboard` with a clear CTA to start onboarding — instead of being forced through onboarding steps.

## Current Behavior
- **Sign-up** → redirects to `/onboarding/welcome` (forces onboarding)
- **Sign-in** → checks onboarding state, redirects to incomplete step or `/dashboard`
- **Sign-in** → supports `?redirect=/path` for deep linking
- **AppShell** (lines 188-191) → redirects to onboarding step if state is incomplete, overriding dashboard redirect

## Target Behavior
- **Sign-up** → redirects to `/dashboard?welcome=1` (shows welcome banner with onboarding CTA)
- **Sign-in** → always redirects to `/dashboard` (ignores incomplete onboarding and `?redirect` param)
- **AppShell** → stop redirecting to onboarding; let dashboard handle onboarding CTAs
- **Welcome banner** → auto-clears `?welcome=1` from URL after display using `router.replace`

## Files to Change

### 1. `app/signup/page.tsx`
**Line 46**: Change redirect destination
```tsx
// Before:
router.push("/onboarding/welcome");

// After:
router.push("/dashboard?welcome=1");
```

### 2. `app/signin/page.tsx`
**Lines 17-18**: Remove redirect param logic
```tsx
// Before:
const rawRedirect = searchParams.get("redirect") || "/dashboard";
const redirectTo = rawRedirect.startsWith("/") ? rawRedirect : "/dashboard";

// After:
const redirectTo = "/dashboard";
```

**Lines 43-48**: Remove onboarding state check, always go to dashboard
```tsx
// Before:
const onboarding = getStoreOnboardingState();
if (onboarding && onboarding.step !== "complete") {
  router.push(`/onboarding/${onboarding.step}`);
} else {
  router.push(redirectTo);
}

// After:
router.push(redirectTo);
```

**Remove unused imports**:
- Line 7: `import { getOnboardingState as getStoreOnboardingState } from "@/lib/store";`
- Line 5: `useSearchParams` (no longer needed)

### 3. `components/AppShell.tsx`
**Lines 188-191**: Remove the onboarding redirect logic that forces users away from dashboard
```tsx
// Before:
const onboarding = getOnboardingState();
if (onboarding && onboarding.parentId === session.parentId && onboarding.step !== "complete") {
  router.push(`/onboarding/${onboarding.step}`);
}

// After:
// Remove this block entirely. Dashboard now handles onboarding CTAs.
```

Also remove the now-unused `getOnboardingState` import on line 7 if no longer used elsewhere in the file.

### 4. `app/dashboard/page.tsx`
Add welcome banner that appears when `?welcome=1` is in URL, then auto-clears the param.

**Add import** at top:
```tsx
import { useSearchParams } from "next/navigation";
```

**Add after line 19** (after `const router = useRouter();`):
```tsx
const searchParams = useSearchParams();
const isNewUser = searchParams.get("welcome") === "1";
```

**Add effect to clear URL param** (after the `isNewUser` declaration):
```tsx
useEffect(() => {
  if (isNewUser) {
    router.replace("/dashboard", { scroll: false });
  }
}, [isNewUser, router]);
```

**Add welcome banner** after the greeting section (after line 210), before the `!selectedChild` conditional. This shows alongside the existing "No children added yet" card:
```tsx
{isNewUser && (
  <div className="card border-l-4 border-l-primary bg-primary/5">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-primary">Welcome to Total Child!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Get started by adding your child and building their development profile.
        </p>
      </div>
      <div className="flex gap-2">
        <Link href="/onboarding/child" className="btn-primary whitespace-nowrap">
          Add Your Child
        </Link>
        <Link href="/dashboard/activities" className="btn-outline whitespace-nowrap">
          Explore First
        </Link>
      </div>
    </div>
  </div>
)}
```

## Validation Plan
1. Run `npm run build` — must pass with no TypeScript errors
2. Manual test flow:
   - Sign up new account → should land on `/dashboard?welcome=1` with welcome banner visible, then URL should auto-clean to `/dashboard`
   - Click "Add Your Child" → should go to `/onboarding/child`
   - Sign out, sign back in → should land on `/dashboard` (no welcome banner, no redirect to onboarding)
   - Existing users with incomplete onboarding → should land on `/dashboard` (not redirected to onboarding step)
   - Sign in with `?redirect=/dashboard/activities` → should still land on `/dashboard` (redirect param ignored)

## Out of Scope
- Visual redesign of sign-up/sign-in pages
- Removing onboarding pages (they remain accessible via CTAs)
- Persisting "welcome" dismissal across sessions (banner shows once per sign-up via URL param)
