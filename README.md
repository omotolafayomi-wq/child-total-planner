# Total Child Development Planner

A professional, responsive, mobile-first family-development platform for Nigerian and African families. Built around **LEARN • LIVE • LEAD • EARN • SERVE**.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Update `.env.local` with the generated secret and your local URL.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using the application.

## Project Structure

```
app/                    # Next.js App Router pages
  signin/              # Sign in
  signup/              # Sign up with email verification
  verify-email/        # Email verification page
  dashboard/           # Protected dashboard routes
    children/          # Child profile management
    assess/            # Development assessment
    goals/             # Goal setting and tracking
    activities/        # Activity discovery
    plan/              # Weekly and monthly planning
    evidence/          # Evidence of growth
    reflections/       # Child voice and parent review
    reports/           # Development reports
    portfolio/         # Child portfolio
    achievements/      # Developmental achievements
    profile/           # Parent profile
    modules/           # Specialist modules
components/            # Reusable React components
lib/                   # Data layer, auth, utilities
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Design System

- **Primary**: Deep blue (`#123C63` → `#1E6FA8`)
- **Accent**: Warm gold (`#F4B942`)
- **Growth**: Green (`#3FA36B`)
- **Background**: Soft blue-grey (`#F7F9FC`)

## Philosophy

> Raise a child who can learn, live, lead, earn, serve, create, adapt and keep learning — not merely a child who can pass the next examination.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Total Child Development Guide](https://example.com)
