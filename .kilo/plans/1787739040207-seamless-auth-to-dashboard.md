# Auth Modal, Landing Page Refresh, Onboarding Email, PDF Reports, and Brand Assets

## Goal
1. Remove standalone sign-in/sign-up/login pages and replace with an auth modal on the landing page
2. Link "Start My Child's Development Plan" CTA to the onboarding dashboard
3. Add email field to onboarding profile (manual entry)
4. Add a relatable mobile-friendly image with brand text/logo to the landing page
5. Add a favicon
6. Enable PDF download/printing of reports with full biodata

## Design Decisions (Resolved)
- **Auth**: Modal on landing page replaces `/signin`, `/signup`, `/login`. `/forgot-password` remains standalone.
- **Brand assets**: Text-based brand mark ("Total Child") + stock family photo from Unsplash. No external logo files.
- **PDF**: Client-side using `jspdf` + `jspdf-autotable`.
- **Onboarding email**: Manual entry field in profile step.

## Tasks

### 1. Remove standalone auth pages
Delete:
- `app/signin/page.tsx`
- `app/signup/page.tsx`
- `app/login/page.tsx`

Keep `app/forgot-password/page.tsx` (linked from auth modal).

### 2. Create auth modal component
Create `components/AuthModal.tsx`:
- Controlled modal with `isOpen` prop and `onClose` callback
- Tabs: "Sign In" | "Sign Up"
- Fields: email, password, name (sign-up only)
- Validation: required fields, email format, password min 6 chars
- Uses `signIn` and `signUp` from `@/lib/auth`
- On success:
  - New user: `router.push("/onboarding/welcome")`
  - Returning user: `router.push("/dashboard")`
- "Forgot password?" link → `/forgot-password`
- Close via X button, overlay click, or Escape key

### 3. Update landing page (`app/page.tsx`)
The landing page is currently a **server component** using `getSession()`. To add an auth modal, convert it to a **client component** or use a hybrid approach:

**Option A (recommended)**: Convert `app/page.tsx` to a client component:
- Move `getSession()` call into `useEffect`
- Add `useState` for session and auth modal open state
- Add "Sign In" / "Start My Child's Development Plan" buttons
- Replace `FamilyIllustration` SVG with a mobile-friendly image:

```tsx
<div className="relative w-full max-w-4xl mx-auto mb-8">
  <img
    src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=600&fit=crop"
    alt="Family working together"
    className="w-full h-64 sm:h-96 object-cover rounded-2xl shadow-lg"
    loading="eager"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl" />
  <div className="absolute bottom-6 left-6 right-6 text-white">
    <h2 className="text-2xl sm:text-3xl font-bold mb-2">Total Child</h2>
    <p className="text-sm sm:text-base text-white/90">Raise a child who can learn, live, lead, earn and serve.</p>
  </div>
</div>
```

**Button logic**:
```tsx
const handleStartClick = () => {
  if (!session) {
    setAuthModalOpen(true);
  } else {
    const kids = getChildren(session.id);
    if (kids.length === 0) {
      router.push("/onboarding/welcome");
    } else {
      router.push("/dashboard");
    }
  }
};
```

### 4. Add favicon
- Create `public/favicon.ico` (16x16, 32x32) — placeholder or text-based generated file
- Create `public/apple-touch-icon.png` (180x180) — placeholder
- Update `app/layout.tsx` metadata:
```tsx
export const metadata: Metadata = {
  title: "Total Child Development Planner",
  description: "...",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
```

### 5. Add email field to onboarding profile
Update `app/onboarding/profile/page.tsx`:
- Add `email` field to `ProfileFormData` type
- Add email input in Step 1 ("Strengths & Growth") or as a new Step 0
- Validation: required, email format
- No auto-fill from auth (manual entry per design decision)

### 6. Implement PDF report generation
Update `app/dashboard/reports/[id]/page.tsx`:
- Add `jspdf` and `jspdf-autotable` imports (dynamic import to avoid SSR issues)
- Add "Download PDF" button alongside "Print / Save PDF"
- PDF content:
  - Header: "Total Child Development Report"
  - Parent biodata: name, email
  - For each child:
    - Name, age, school level
    - Pillar overview table
    - Goals achieved / in progress
    - Evidence highlights
    - Child voice excerpts
    - Parent review key points
    - Next steps
- Use `jspdf-autotable` for tabular data
- Include page numbers and branding footer

### 7. Update redirects across the app
Search for and update all references to old auth routes:
- `app/components/AppShell.tsx`: Change redirect from `/signin` to `/`
- `app/dashboard/reports/[id]/page.tsx`: Change redirect from `/signin` to `/`
- Any other pages with `/signin`, `/signup`, `/login` redirects → change to `/`

### 8. Update AppShell auth guards
In `components/AppShell.tsx`:
- Change unauthenticated redirect from `/signin` to `/`
- This ensures unauthenticated users land on the landing page with auth modal

## Files to Create
- `components/AuthModal.tsx`
- `public/favicon.ico` (placeholder)
- `public/apple-touch-icon.png` (placeholder)

## Files to Modify
- `app/page.tsx` (landing page — convert to client component, add image, auth modal triggers)
- `app/onboarding/profile/page.tsx` (add email field)
- `app/dashboard/reports/[id]/page.tsx` (add PDF download)
- `app/layout.tsx` (add favicon metadata)
- `components/AppShell.tsx` (update auth guard redirect)

## Files to Delete
- `app/signin/page.tsx`
- `app/signup/page.tsx`
- `app/login/page.tsx`

## Dependencies to Add
```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2"
}
```

## Validation Plan
1. Run `npm run build` — must pass with no TypeScript errors
2. Verify no references to deleted auth pages remain (`grep -r "/signin" app/`)
3. Manual test:
   - Visit `/` as unauthenticated user → see landing page with photo, brand text, auth modal triggers
   - Click "Start My Child's Development Plan" → auth modal opens
   - Sign up in modal → redirects to `/onboarding/welcome`
   - Complete onboarding → reaches `/dashboard`
   - Sign out → back to landing page
   - Click "Sign In" → auth modal opens
   - Sign in as returning user → redirects to `/dashboard`
   - Generate a report → "Download PDF" button produces formatted PDF with parent and child biodata

## Out of Scope
- Designing/creating actual brand logo assets (using placeholders)
- Advanced PDF styling (basic formatting only)
- Password reset flow improvements
- Social auth (Google, Apple, etc.)
- Removing `/forgot-password` page
