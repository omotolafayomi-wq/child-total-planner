# Phase 9 Plan: Final Integration & Testing

## Objective
Verify all phases work together as a coherent product.

---

## 9.1 Acceptance Test — New Account

### Flow:
1. `/signup` → Create account
2. `/onboarding/welcome` → Welcome screen
3. `/onboarding/child` → Add child
4. `/onboarding/profile` → Create development profile
5. `/onboarding/plan` → Select plan type
6. `/onboarding/complete` → Success screen
7. `/dashboard` → Personalized dashboard

### Verify:
- All data persists in localStorage
- Onboarding state is cleared after completion
- Child appears in dashboard
- Profile data is linked to child
- Plan type is saved

---

## 9.2 Acceptance Test — Existing User

### Flow:
1. `/signin` → Sign in with existing credentials
2. `/dashboard` → See personalized dashboard
3. Select child → Child data loads
4. View existing plans → Continue development

### Verify:
- No data loss
- Session persists on refresh
- Onboarding not shown if complete
- Child switcher works

---

## 9.3 Acceptance Test — Multiple Children

### Flow:
1. Create 3 children: Daniel (9), Esther (13), David (17)
2. Create profiles and data for each
3. Switch between children
4. Verify data isolation

### Verify:
- Each child has independent assessments, goals, plans, evidence
- Switching child updates all dashboard data
- No cross-contamination of data

---

## 9.4 Acceptance Test — Pillars

### Unauthenticated:
- Click `/learn` → redirects to `/signin?redirect=/learn`
- Click `/live` → redirects to `/signin?redirect=/live`
- etc.

### Authenticated:
- Click `/learn` → shows Learn pillar page
- Click `/live` → shows Live pillar page
- etc.

---

## 9.5 Acceptance Test — Navigation

### From every page verify:
- [ ] Home link works
- [ ] Dashboard link works
- [ ] Current child context is visible
- [ ] Back button works
- [ ] Breadcrumbs show correct hierarchy
- [ ] No dead-end pages

---

## 9.6 Acceptance Test — Mobile

### Test at 320px, 375px, 768px:
- [ ] Onboarding flows without overflow
- [ ] Forms are usable
- [ ] Buttons are tappable (44px+)
- [ ] Navigation is accessible
- [ ] Cards stack properly
- [ ] No clipped content

---

## 9.7 Build Verification

```bash
npm run build
```

### Must pass:
- TypeScript compilation
- All routes generated
- No build errors

---

## 9.8 Final Product Structure

```
HOME
 │
 ├── MY CHILDREN
 │      │
 │      └── CHILD PROFILE
 │              │
 │              └── DEVELOPMENT PROFILE
 │                      │
 │                      └── PLAN
 │
 ├── LEARN → /learn (pillar page)
 ├── LIVE → /live (pillar page)
 ├── LEAD → /lead (pillar page)
 ├── EARN → /earn (pillar page)
 ├── SERVE → /serve (pillar page)
 │
 ├── GROWTH AREAS → /dashboard/activities
 ├── ACTIVITIES → /dashboard/activities
 ├── GOALS → /dashboard/goals
 ├── TODAY → /dashboard/plan/weekly
 ├── PROGRESS → /dashboard/reports
 ├── REFLECTIONS → /dashboard/reflections/parent-review
 ├── PORTFOLIO → /dashboard/portfolio
 ├── ACHIEVEMENTS → /dashboard/achievements
 └── REPORTS → /dashboard/reports
```

All routes must remain connected. No dead-end pages.

---

## Implementation Priority
1. Phase 1 (Foundation) — CRITICAL
2. Phase 2 (Onboarding) — HIGH
3. Phase 3 (Dashboard) — HIGH
4. Phase 4 (Pillars) — MEDIUM
5. Phase 5 (Data Flow) — MEDIUM
6. Phase 6 (Polish) — MEDIUM
7. Phase 7 (Accessibility) — HIGH
8. Phase 8 (Security) — HIGH
9. Phase 9 (Testing) — FINAL
