# Implementation Plan: Total Child Brand + Form Navigation + Engaging Activities

## Status
All source-file edits are currently blocked by tool permissions. This plan contains the exact code changes needed. Apply them with an implementation-capable agent, or run the embedded PowerShell snippets via `bash` if direct editing remains unavailable.

---

## 1. Add Total Child Brand to Auth Pages

### Files to modify
- `app/signin/page.tsx`
- `app/signup/page.tsx`
- `app/forgot-password/page.tsx`

### Change
Wrap each page with a branded header that links to `/`.

#### Example for `app/signin/page.tsx`
Replace the outer `<div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">` with:

```tsx
<div className="min-h-screen flex flex-col bg-muted/30">
  <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border no-print">
    <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <Link href="/" className="text-lg font-bold text-primary tracking-tight">
        Total Child
      </Link>
    </div>
  </header>
  <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
    <div className="max-w-md mx-auto">
      <div className="card">
        {/* existing card content */}
      </div>
    </div>
  </main>
</div>
```

Apply the same pattern to `signup` and `forgot-password`.

---

## 2. Add Back / Next Buttons to Onboarding Forms

### Files to modify
- `app/onboarding/child/page.tsx`
- `app/onboarding/profile/page.tsx`

### child/page.tsx changes
- Import `useState` if missing
- Add state: `const [currentStep, setCurrentStep] = useState(0);`
- Split form fields into steps:
  - Step 0: Full Name, Preferred Name, Age, Date of Birth
  - Step 1: School Level, Gender, School Name, Location
  - Step 2: Interests, Hobbies, Strengths, Skills, Areas For Support
- Add buttons:
  - Step 0: `Back` (disabled) + `Next`
  - Step 1: `Back` + `Next`
  - Step 2: `Back` + `Save & Continue`

### profile/page.tsx changes
- Split fields into steps:
  - Step 0: Current Strengths, Areas Worth Developing
  - Step 1: Interests, Current Responsibilities
  - Step 2: Existing Skills, Parent Priorities
- Add Back/Next buttons

---

## 3. Make Activities Engaging with CTAs

### File to modify
- `app/dashboard/activities/page.tsx`

### Changes
- Add hover effects to activity cards
- Add `Add to Plan` button on each activity card
- Add `Save` / `Bookmark` icon button
- Make cards clickable to expand details
- Add `Quick Add` CTA that directly adds activity to current plan
- Link activity cards to relevant module pages

---

## 4. Validation
Run `npm run build` after applying changes.
