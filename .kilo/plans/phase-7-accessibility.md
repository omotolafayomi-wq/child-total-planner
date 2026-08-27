# Phase 7 Plan: Accessibility & Responsive Testing

## Objective
Ensure all interactive elements are keyboard accessible, properly labeled, and responsive across all breakpoints.

---

## 7.1 Accessibility Audit Checklist

### Interactive Elements
- [ ] All clickable cards use semantic `<a>` or `<button>`, not clickable `<div>`
- [ ] All buttons have `aria-label` where text is insufficient
- [ ] All navigation has `aria-current="page"` on active items
- [ ] All form inputs have associated `<label>` elements
- [ ] All error messages are linked to inputs via `aria-describedby`
- [ ] All images/icons have `aria-hidden="true"` or descriptive `alt` text
- [ ] Focus indicators are visible (2px solid outline)
- [ ] Color is not the only indicator of state (use icons + text)

### Forms
- [ ] Required fields marked with `required` and `aria-required="true"`
- [ ] Error messages announced with `role="alert"` or `aria-live="polite"`
- [ ] Validation messages are specific and helpful

### Charts/Progress
- [ ] Progress bars have `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

---

## 7.2 Responsive Breakpoint Testing

### Test at these widths:
- 320px (small mobile)
- 360px (common mobile)
- 375px (iPhone)
- 390px (iPhone 14)
- 430px (large phone)
- 768px (tablet)
- 1024px (small desktop)
- 1280px (desktop)
- 1440px (large desktop)
- 1920px (full HD)

### Pages to test:
- [ ] `/` (landing)
- [ ] `/signin`, `/signup`, `/forgot-password`
- [ ] `/onboarding/welcome`, `/onboarding/child`, `/onboarding/profile`, `/onboarding/plan`
- [ ] `/dashboard`
- [ ] `/dashboard/children`
- [ ] `/dashboard/assess`
- [ ] `/dashboard/goals`
- [ ] `/dashboard/activities`
- [ ] `/dashboard/evidence`
- [ ] `/dashboard/reports`
- [ ] `/dashboard/portfolio`
- [ ] `/dashboard/plan/weekly`
- [ ] `/dashboard/plan/monthly`

### Checks:
- [ ] No horizontal overflow (scrollbar should not appear)
- [ ] Buttons not clipped or too small (< 44px touch target)
- [ ] Forms readable and usable
- [ ] Navigation accessible (hamburger works, bottom nav accessible)
- [ ] Cards stack properly
- [ ] Typography scales appropriately
- [ ] Images/illustrations don't overlap

---

## 7.3 Specific Fixes

### Common issues to address:
1. **Small touch targets**: Ensure all interactive elements have `min-h-[44px] min-w-[44px]`
2. **Text overflow**: Add `truncate` or responsive text sizes
3. **Horizontal scroll**: Check for fixed-width elements, add `max-w-full` where needed
4. **Z-index conflicts**: Ensure modals/drawers have proper z-index stacking
5. **Safe areas**: Add `pb-[env(safe-area-inset-bottom)]` to bottom nav

---

## Validation
Manual testing at all breakpoints. Document any issues found and fix them.
