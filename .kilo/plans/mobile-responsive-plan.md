# Plan: Mobile Responsiveness & Interactive Improvements

## Current Issues
1. **AppShell.tsx**: No mobile menu for profile/signout on small screens
2. **Dashboard**: Child selector is cramped on mobile, cards could use better spacing
3. **Onboarding**: Forms are long on mobile, no sticky bottom CTA, progress indicator could be more compact
4. **Module pages**: Tables need better mobile handling, buttons should be full-width on small screens
5. **Bottom nav**: Needs safe-area padding for notched phones

## Implementation Plan

### Task 1: AppShell Mobile Menu
**File:** `components/AppShell.tsx`

Add mobile menu state and hamburger button:
```typescript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
```

Add hamburger icon button (visible only on mobile):
```tsx
<button
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  className="md:hidden icon-btn p-2"
  aria-label="Toggle menu"
  aria-expanded={mobileMenuOpen}
>
  <svg>/* hamburger icon */</svg>
</button>
```

Add mobile slide-out drawer:
```tsx
{mobileMenuOpen && (
  <>
    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
    <div className="fixed right-0 top-0 bottom-0 w-72 bg-white shadow-xl z-50 p-4">
      {/* Profile link */}
      {/* Sign out button */}
      {/* Child switcher */}
    </div>
  </>
)}
```

Hide profile/signout on mobile header (already `hidden md:flex`), show in drawer instead.

### Task 2: Improve Mobile Bottom Navigation
**File:** `components/AppShell.tsx`

Add safe-area padding:
```tsx
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-border no-print pb-safe">
```

Reduce icon size on very small screens:
```tsx
<item.icon className="w-5 h-5" />
```

### Task 3: Dashboard Mobile Improvements
**File:** `app/dashboard/page.tsx`

- Make child selector full-width on mobile with `w-full sm:w-auto`
- Add `text-sm` to card titles for better fit
- Ensure next-step cards stack vertically on mobile (already using `flex-col sm:flex-row`)
- Add `overflow-x-auto` wrapper for any wide content

### Task 4: Onboarding Mobile Improvements
**Files:** `app/onboarding/*/page.tsx`

- Add sticky bottom CTA bar on mobile for forms:
  ```tsx
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 md:hidden">
    <button type="submit" className="btn-primary w-full">Save & Continue</button>
  </div>
  ```
- Add `pb-24` to main content to account for sticky CTA
- Make progress indicator more compact on mobile
- Reduce form spacing on mobile (`space-y-4 sm:space-y-6`)

### Task 5: Module Pages Mobile Fixes
**Files:** Various dashboard pages

- Weekly Plan: Ensure day columns stack or scroll horizontally on mobile
- Monthly Plan: Already has `overflow-x-auto` on table, add `min-w-[640px]` to table
- Activities: Make filter bar stack on mobile
- Goals: Make goal cards full-width on mobile
- Evidence: Make evidence cards stack
- Reports: Make report cards full-width

### Task 6: Touch Target Improvements
**Global:**

Ensure all interactive elements meet 44x44px minimum:
- Add `min-h-[44px]` to buttons
- Add `min-w-[44px]` to icon buttons
- Increase padding on mobile nav items
- Ensure form inputs have adequate height

### Task 7: Safe Areas & Notch Support
**Global:**

Add safe-area CSS to global styles or layout:
```css
@supports (padding-top: env(safe-area-inset-top)) {
  .safe-area-top {
    padding-top: env(safe-area-inset-top);
  }
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

## Validation
1. Test at 320px, 375px, 390px, 430px widths
2. Verify no horizontal scroll on any page
3. Verify all buttons are tappable (min 44px)
4. Verify mobile menu opens/closes correctly
5. Verify bottom nav doesn't overlap content
6. Verify forms are usable on small screens
7. Verify tables are scrollable on mobile
