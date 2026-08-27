# Manual Verification Checklist

## Pre-requisites
- Dev server running at `http://localhost:3000`
- Browser with dev tools open
- Incognito window available for unauthenticated tests

---

## 1. New Account Flow

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1 | Go to `/signup` | Form loads with Total Child header |
| 1.2 | Create account with valid email/password | Redirect to `/onboarding/welcome` |
| 1.3 | Verify progress indicator | Shows `01 WELCOME ●────○────○────○` |
| 1.4 | Click **Add My Child** | Redirect to `/onboarding/child` |
| 1.5 | Fill child form Step 1 (Basic) | Fields: Full Name, Preferred Name, Age, DOB |
| 1.6 | Click **Next** | Advances to Step 2 |
| 1.7 | Click **Back** | Returns to Step 1, data preserved |
| 1.8 | Complete Steps 2-3 | All fields save correctly |
| 1.9 | Click **Save & Create Profile** | Redirect to `/onboarding/profile` |
| 1.10 | Verify disclaimer | "This is a planning and development tool, not a psychological, intelligence or clinical assessment." |
| 1.11 | Complete profile form | Redirect to `/onboarding/plan` |
| 1.12 | Select plan type and continue | Redirect to `/onboarding/complete` |
| 1.13 | Wait 4 seconds | Auto-redirect to `/dashboard` |
| 1.14 | Verify dashboard greeting | "Welcome back, [Parent Name]" |
| 1.15 | Verify subheading | "Let's keep helping [Child Name] grow." |

---

## 2. Existing User Flow

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | Go to `/signin` | Form loads with Total Child header |
| 2.2 | Enter credentials and sign in | Redirect to `/dashboard` |
| 2.3 | Verify child data persists | Child profile visible |
| 2.4 | Verify onboarding not shown | Direct to dashboard, not onboarding |
| 2.5 | Refresh page | Session persists, no data loss |
| 2.6 | Sign out and sign back in | Session restored correctly |

---

## 3. Multiple Children

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | Go to `/dashboard/children` | Shows children list |
| 3.2 | Click **+ Add Child** | Form appears |
| 3.3 | Add second child | Child appears in list |
| 3.4 | Add third child | Child appears in list |
| 3.5 | Switch between children in dashboard dropdown | All data updates correctly |
| 3.6 | Verify data isolation | Each child has independent data |

---

## 4. Pillar Pages

### 4.1 Unauthenticated
| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1.1 | Open incognito window | No auth cookies |
| 4.1.2 | Visit `/learn` | Redirect to `/signin?redirect=/learn` |
| 4.1.3 | Visit `/live` | Redirect to `/signin?redirect=/live` |
| 4.1.4 | Visit `/lead` | Redirect to `/signin?redirect=/lead` |
| 4.1.5 | Visit `/earn` | Redirect to `/signin?redirect=/earn` |
| 4.1.6 | Visit `/serve` | Redirect to `/signin?redirect=/serve` |

### 4.2 Authenticated
| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.2.1 | Sign in | Dashboard loads |
| 4.2.2 | Visit `/learn` | Shows Learn pillar page with hero, activities |
| 4.2.3 | Click **Explore Module** | Navigates to module page |
| 4.2.4 | Click **Browse Activities** | Navigates to `/dashboard/activities` |
| 4.2.5 | Repeat for `/live`, `/lead`, `/earn`, `/serve` | All work correctly |

---

## 5. Navigation & Back Buttons

| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1 | From dashboard, go to `/dashboard/activities` | Breadcrumbs show: Home › Activities |
| 5.2 | Click **Dashboard** breadcrumb | Returns to `/dashboard` |
| 5.3 | Go to `/dashboard/assess` | Back button shows "← Dashboard" |
| 5.4 | Click Back button | Returns to `/dashboard` |
| 5.5 | Go to `/dashboard/children` then `/dashboard/children/[id]` | Back link shows "← Back to children" |
| 5.6 | Click back link | Returns to `/dashboard/children` |

---

## 6. Responsive Testing

Test at each viewport width using browser dev tools:

| Width | What to Check |
|-------|---------------|
| 320px | No horizontal scroll, buttons ≥44px, forms readable |
| 360px | Cards stack, nav accessible |
| 375px | iPhone SE layout, no clipped content |
| 430px | Large phone, drawer works |
| 768px | Tablet, grid columns adjust |
| 1024px | Desktop, sidebar visible |

For each width verify:
- [ ] No horizontal overflow (scrollbar)
- [ ] All buttons ≥44px touch target
- [ ] Forms usable without zoom
- [ ] Hamburger menu works
- [ ] Bottom nav accessible (mobile)
- [ ] Cards stack properly

---

## 7. Accessibility

| Step | Action | Expected Result |
|------|--------|-----------------|
| 7.1 | Tab through sign-in form | Focus ring visible on each field |
| 7.2 | Tab to Total Child logo | Focus ring visible |
| 7.3 | Tab to buttons | Focus ring visible |
| 7.4 | Use screen reader on form | Labels announced correctly |
| 7.5 | Submit empty form | Error announced |
| 7.6 | Check ARIA on breadcrumbs | `role="navigation"` present |
| 7.7 | Check mobile nav | `aria-label` present on nav |

---

## 8. Data Persistence

| Step | Action | Expected Result |
|------|--------|-----------------|
| 8.1 | Create child profile | Data saves |
| 8.2 | Refresh page | Data persists |
| 8.3 | Add assessment | Saves correctly |
| 8.4 | Add goals | Saves correctly |
| 8.5 | Add evidence | Saves correctly |
| 8.6 | Sign out | Session cleared |
| 8.7 | Sign back in | All data restored |

---

## 9. Password Reset

| Step | Action | Expected Result |
|------|--------|-----------------|
| 9.1 | Go to `/forgot-password` | Form loads |
| 9.2 | Enter email and submit | Shows "If an account exists, a temporary password has been sent." |
| 9.3 | Check response | No temp password exposed |
| 9.4 | Check network tab | Response doesn't contain password |

---

## 10. Onboarding Resume

| Step | Action | Expected Result |
|------|--------|-----------------|
| 10.1 | Start onboarding, fill child form | Data saves |
| 10.2 | Close browser | Onboarding state persists |
| 10.3 | Reopen and sign in | Redirects to last incomplete step |
| 10.4 | Verify resume message | "Welcome back. You were creating a development profile for [Child Name]" |

---

## Reporting Issues

Use `.kilo/plans/bug-report-template.md` for any issues found.
