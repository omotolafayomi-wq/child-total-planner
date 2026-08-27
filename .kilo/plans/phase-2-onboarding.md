# Phase 2 Plan: Onboarding State & Navigation

## Objective
Enhance onboarding flow with resume capability, better welcome screen, and improved navigation.

---

## 2.1 Unified Onboarding State Manager

### New file: `lib/onboarding.ts`
```ts
export const ONBOARDING_STEPS = ["welcome", "child", "profile", "plan"] as const;
export type OnboardingStep = typeof ONBOARDING_STEPS[number];

const STORAGE_KEY = "tcd_onboarding";

export function getOnboardingState(): { step: OnboardingStep; parentId: string; childId?: string; childData?: any; profileData?: any; planData?: any; startedAt: string; updatedAt: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveOnboardingState(state: { step: OnboardingStep; parentId: string; childId?: string; childData?: any; profileData?: any; planData?: any; startedAt: string; updatedAt: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearOnboardingState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function isOnboardingComplete(): boolean {
  const state = getOnboardingState();
  return state?.step === "complete";
}

export function getNextOnboardingStep(currentStep: OnboardingStep): OnboardingStep | null {
  const idx = ONBOARDING_STEPS.indexOf(currentStep);
  if (idx >= 0 && idx < ONBOARDING_STEPS.length - 1) {
    return ONBOARDING_STEPS[idx + 1];
  }
  return null;
}
```

---

## 2.2 Welcome Screen Enhancement

### File: `app/onboarding/welcome/page.tsx`
- Add PRD copy from sections 4, 5
- Add "Skip for Now" CTA → `/dashboard`
- Improve progress indicator with numbered steps (01, 02, 03, 04)
- Add resume message if state exists: "Welcome back. You were creating a development profile for [Child Name]. [Continue]"

---

## 2.3 Add Child Step Enhancement

### File: `app/onboarding/child/page.tsx`
- Already has 3-step Back/Next
- Add "Save & Add Another Child" button that saves current child and resets form
- Keep "Save & Create Profile" as primary CTA
- Ensure `createChild()` is called and childId is saved to onboarding state

---

## 2.4 Profile Step Enhancement

### File: `app/onboarding/profile/page.tsx`
- Already has 3-step Back/Next
- Add disclaimer notice: "This is a planning and development tool, not a psychological, intelligence or clinical assessment."
- Ensure `createAssessment()` is called with profile data and linked to childId

---

## 2.5 Plan Step Enhancement

### File: `app/onboarding/plan/page.tsx`
- Keep plan type selection (weekly/monthly)
- Add "Explore Activities" and "Discover Interests" CTAs
- Remove `router.refresh()` after navigation
- Save planData to onboarding state before redirecting to complete

---

## 2.6 Auto-Resume Onboarding

### File: `components/AppShell.tsx`
- Enhance onboarding guard to show contextual resume message
- If onboarding step is "child" and childId exists, show "Continue setting up [Child Name]'s development profile"
- If onboarding step is "profile", show "Continue creating development profile"
- If onboarding step is "plan", show "Choose a plan type to finish setup"

---

## Validation
Run `npm run build` and verify onboarding flow works end-to-end.
