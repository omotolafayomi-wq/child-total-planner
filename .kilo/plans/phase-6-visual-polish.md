# Phase 6 Plan: Visual Polish & Interaction

## Objective
Add hover, focus, active, loading, and success states across the application.

---

## 6.1 Interactive States in globals.css

### File: `app/globals.css`
Add these CSS rules if not already present:

```css
/* Interactive card states */
.card-interactive {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -6px rgba(0, 0, 0, 0.05);
}
.card-interactive:active {
  transform: translateY(0);
}

/* Button states */
.btn-primary, .btn-outline {
  transition: all 0.2s ease;
}
.btn-primary:active {
  transform: scale(0.98);
}
.btn-outline:active {
  transform: scale(0.98);
}

/* Focus visible */
*:focus-visible {
  outline: 2px solid #3FA36B;
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6.2 Loading States

### Files to modify:
- All dashboard pages — Replace "Loading..." text with spinner or skeleton
- `app/onboarding/complete/page.tsx` — Already has redirect timer
- `components/AppShell.tsx` — Already has "Loading..." state

### Add a Spinner component if needed:
```tsx
// components/Spinner.tsx
export default function Spinner() {
  return (
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  );
}
```

---

## 6.3 Error Recovery

### Pattern to apply across all forms:
```tsx
{error && (
  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
    {error}
    <button onClick={() => setError("")} className="float-right text-red-600 hover:text-red-800">×</button>
  </div>
)}
```

Add "Go to Dashboard" action on critical errors:
```tsx
{criticalError && (
  <Link href="/dashboard" className="btn-primary mt-4">Go to Dashboard</Link>
)}
```

---

## Validation
Run `npm run build` and verify no CSS or TypeScript errors.
