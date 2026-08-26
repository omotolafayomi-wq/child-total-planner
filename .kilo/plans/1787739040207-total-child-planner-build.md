# Total Child Development Planner — Implementation Plan

## Current State
- Next.js 16.3.3 + React 19 + TypeScript + Tailwind CSS v4
- Default scaffold only (`app/page.tsx`, `app/layout.tsx`, `app/globals.css`)
- No database, no auth, no state management
- Design system: default Tailwind (zinc)

## Target MVP (Buildplan Phases 0–22, scoped to functional core)

### Phase 1 — Foundation & Design System
1. **Design tokens**: Navy `#0f172a`, gold `#f59e0b`, growth green `#10b981`, warm slate cards. Extend Tailwind theme in `app/globals.css`. No dark mode unless explicitly requested.
2. **Layout shell**: Replace root layout with mobile-first app shell: sticky top header, bottom nav on mobile, sidebar on `md+`. Use `app/layout.tsx` + a shared `components/AppShell.tsx`.
3. **Navigation**: Home, My Children, Assess, Goals, Activities, Evidence, Reflections, Reports, Profile, Sign Out. Adaptive nav based on auth state and selected child.
4. **Empty/error states**: Every list view must handle no-data gracefully with a clear CTA.

### Phase 2 — Data Layer (localStorage-backed, schema-ready for DB swap)
File: `lib/store.ts`

Entities (UUID keys, parent-scoped):
- `parents`: id, email, name, passwordHash (demo only — see security note)
- `children`: id, parentId, name, age, schoolLevel, interests, strengths, areasForSupport, gender, archived
- `assessments`: id, childId, pillar, area, level, observations, date
- `goals`: id, childId, pillar, area, goalText, behaviour, currentLevel, targetLevel, evidence, targetDate, status, nextStep
- `activities`: id, childId, pillar, area, title, description, safetyLevel, estimatedCost, frequency
- `plans`: id, childId, type (weekly/monthly), startDate, endDate, entries[]
- `evidence`: id, childId, goalId, type (text/image/video/document), description, date, reflection
- `reflections`: id, childId, type (childVoice|parentReview), answers, date
- `reports`: id, childId, period, summary, generatedAt
- `achievements`: id, childId, badge, date

Helper functions:
- `getSession()` → parent | null
- `requireUser()` → throws to `/signin`
- `requireChildAccess(childId)` → validates ownership
- CRUD wrappers for each entity

**Security note**: This MVP uses bcryptjs for password hashing and in-memory session tokens stored in localStorage cookies. Real server-side auth with proper HTTP-only secure cookies is Phase 2.0.

### Phase 3 — Authentication
Pages: `app/signin/page.tsx`, `app/signup/page.tsx`, `app/forgot-password/page.tsx`

- Sign Up: name, email, password, confirm password. Hash with bcryptjs.
- Sign In: email + password. Validate hash. Store session token.
- Sign Out: clear session.
- Forgot/Reset: mock flow (token stored in localStorage for demo).
- Route guards: all `/dashboard/*` routes redirect to `/signin` if no session.

### Phase 4 — Child Profiles & Multi-Child Switcher
Pages: `app/dashboard/children/page.tsx`, `app/dashboard/children/[id]/page.tsx`

- CRUD child profiles.
- Header child switcher dropdown. Switching child updates context; all data queries re-run for selected child.
- Never mix sibling data — every query filters by `childId`.

### Phase 5 — Development Assessment
Page: `app/dashboard/assess/page.tsx`

Pillars: LEARN, LIVE, LEAD, EARN, SERVE
Supporting areas: Digital Builder, Life Skills, Young Entrepreneur, Creative Explorer, Future Ready, Health & Wellbeing, Character & Values, Family Growth, Exploration

For each item:
- Current level (Beginning / Developing / Consistent / Independent / Can Teach Others)
- Observations textarea
- Support needed textarea

Output: Development Profile dashboard with:
- 5 primary pillar cards (progress bars)
- Supporting area mini-cards
- Next step recommendations

### Phase 6 — Goal Management
Page: `app/dashboard/goals/page.tsx`

Goal structure:
- Pillar, Growth Area, Goal text, Observable Behaviour, Current Level, Target Level, Evidence note, Target Date, Status (NOT_STARTED | IN_PROGRESS | CONSISTENT | ACHIEVED | CONTINUE), Next Step

Features:
- Create goal form with domain selector
- Goal cards with status badges
- Inline edit / archive
- Filter by pillar/status

Child Voice section within goal creation:
- What are you proud of?
- What was difficult?
- What do you want to learn next?
- Where do you want more help?
- What responsibility are you ready to take on?

### Phase 7 — Activity Discovery & Planning
Pages: `app/dashboard/activities/page.tsx`, `app/dashboard/plan/weekly/page.tsx`, `app/dashboard/plan/monthly/page.tsx`

Activities:
- Pre-seeded activity library aligned to pillars/areas
- Each activity: title, description, pillar, area, safetyLevel (AGE_APPROPRIATE | ADULT_GUIDANCE | SUPERVISION_REQUIRED), estimatedCost, timeEstimate
- Search/filter by pillar, area, age range

Planning:
- Weekly plan: Mon–Sun grid, drag-style add from activity library
- Monthly plan: Domain-based table (LEARN/LIVE/LEAD/EARN/SERVE + supporting areas)
- Allow 1–5 priority goals per month per source framework

### Phase 8 — Evidence & Tracking
Pages: `app/dashboard/evidence/page.tsx`, `app/dashboard/tracker/page.tsx`

Evidence:
- Upload types: text, image, video, document, parent observation, mentor note
- Linked to goal and pillar
- Lightweight — encourage 1–2 strong pieces per goal

Tracker:
- Daily/weekly activity log
- Level of help indicator
- Reflection prompt
- No per-minute tracking

### Phase 9 — Reflections & Reviews
Pages: `app/dashboard/reflections/child-voice/page.tsx`, `app/dashboard/reflections/parent-review/page.tsx`

Child Voice:
- 5 guided questions
- Stored with date, linked to child

Parent Review:
- What did we over-schedule?
- What should we stop/start/continue?
- Which responsibility can move to child?
- What safety/wellbeing issue needs attention?
- What opportunity next month?

### Phase 10 — Reporting
Page: `app/dashboard/reports/[id]/page.tsx`

Generate:
- Child Profile header
- 5-pillar overview
- Specialist areas summary
- Goals completed / developing / continued
- Evidence highlights
- Child voice excerpts
- Parent review key points
- Next steps

Print-friendly CSS. No fake scores. Language: "Current capability", "Observed development", "Next step".

### Phase 11 — Specialist Module Shells
Create shell pages for all 14 specialist modules. Each shows:
- Module purpose
- Age-appropriate guidance
- Safety badge where relevant
- "Coming soon" state with placeholder content aligned to buildplan spec
- Add at least 1 seeded activity per module

Modules:
1. Digital Builder (`app/dashboard/modules/digital-builder/page.tsx`)
2. Life Skills (`app/dashboard/modules/life-skills/page.tsx`)
3. Young Entrepreneur (`app/dashboard/modules/young-entrepreneur/page.tsx`)
4. Creative Explorer (`app/dashboard/modules/creative-explorer/page.tsx`)
5. Future Ready (`app/dashboard/modules/future-ready/page.tsx`)
6. Health & Wellbeing (`app/dashboard/modules/health-wellbeing/page.tsx`)
7. Character & Values (`app/dashboard/modules/character-values/page.tsx`)
8. Family Growth (`app/dashboard/modules/family-growth/page.tsx`)
9. Exploration (`app/dashboard/modules/exploration/page.tsx`)
10. Examination Preparation (`app/dashboard/modules/exams/page.tsx`)
11. Child Development Tracker (`app/dashboard/modules/tracker/page.tsx`)
12. Holiday Growth (`app/dashboard/modules/holiday/page.tsx`)
13. School-Term Development (`app/dashboard/modules/school-term/page.tsx`)
14. Parent Guidance (`app/dashboard/modules/parent-guidance/page.tsx`

### Phase 12 — Low-Cost / Offline-First Support
- Add "Low-Cost Mode" toggle in family settings
- When enabled, activities show offline alternatives (radio, textbooks, household objects, markets)
- Printable plan generation (window.print() with print CSS)

### Phase 13 — Portfolio & Achievements
Pages: `app/dashboard/portfolio/page.tsx`, `app/dashboard/achievements/page.tsx`

Portfolio:
- Filter by pillar, area, date, evidence type
- Sections: Projects, Skills, Creative, Digital, Reading, Enterprise, Community, Career, Certificates, Reflections

Achievements:
- Private badges: Learner, Independence Builder, Digital Builder, Creative Explorer, Young Entrepreneur, Community Contributor, Family Contributor, Young Leader, Problem Solver, Future Ready
- No public leaderboard. No sibling ranking.

### Phase 14 — Nigerian/African Context
- Currency: ₦ Nigerian Naira for all financial examples
- Pre-seeded activities reference WAEC, NECO, JAMB, UTME, Nigerian literature, local markets, family businesses, agriculture
- Contextual examples for urban/rural, variable electricity/connectivity

### Phase 15 — Safety & Privacy
- Safety badges on all activities: AGE-APPROPRIATE INDEPENDENT TASK | ADULT GUIDANCE REQUIRED | SUPERVISION REQUIRED
- Online safety guidance embedded in Digital Builder
- All child data private by default — no public profiles, no leaderboards
- Parent can archive/delete child data

## Execution Order (by dependency)
1. Phase 1 (Foundation)
2. Phase 2 (Data Layer)
3. Phase 3 (Auth)
4. Phase 4 (Children + Switcher)
5. Phase 5 (Assessment + Profile)
6. Phase 6 (Goals + Child Voice)
7. Phase 7 (Activities + Plans)
8. Phase 8 (Evidence + Tracker)
9. Phase 9 (Reflections + Reviews)
10. Phase 10 (Reports)
11. Phase 11 (Module shells)
12. Phase 12 (Low-cost mode)
13. Phase 13 (Portfolio + Achievements)
14. Phase 14 (Nigerian context — content updates)
15. Phase 15 (Safety + privacy — validation pass)

## Validation
- Every button, form, and navigation element must perform a real operation
- No hard-coded reports
- No fake authentication
- No sibling data leakage
- Mobile-first responsive test at 375px, 768px, 1024px
- TypeScript strict mode passes
- `npm run build` succeeds

## Out of Scope (Post-MVP)
- Real backend API / database (PostgreSQL/Prisma)
- Real email/password reset via SMTP
- PDF generation (use print CSS instead)
- File upload to cloud storage
- Push notifications
- Mentor role with explicit invitation flow
- Multi-language support beyond English
- Real AI recommendation engine
- Advanced charts (radar, trends) — use simple progress bars for MVP
