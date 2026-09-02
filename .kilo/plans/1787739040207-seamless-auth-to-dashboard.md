# Navigation Redesign: Top Nav with Auto-Collapse + Mobile Accordion

## Goal
Replace the current sidebar (desktop) and bottom tab bar (mobile) with:
1. **Desktop:** Top navigation bar that auto-collapses on scroll down, expands on scroll up
2. **Mobile:** Accordion/collapse menu at the top (replaces bottom tab bar)
3. **Scope:** Navigation only — page content layout remains unchanged

## Current State
- `components/AppShell.tsx` lines 443-464: Mobile bottom tab bar (`fixed bottom-0`)
- `components/AppShell.tsx` lines 466-499: Desktop left sidebar (`fixed left-0 top-14 bottom-0 w-56`)
- Header at line 248 is `sticky top-0 z-40`

## Target State
- Desktop: Nav moves to a horizontal bar below header, collapses on scroll down (slides up out of view), expands on scroll up
- Mobile: Nav becomes an accordion menu below header, toggles open/closed
- Bottom tab bar removed entirely

## Files to Change

### 1. `components/AppShell.tsx` — Navigation Redesign

**Add scroll detection state** (near other state declarations):
```tsx
const [navCollapsed, setNavCollapsed] = useState(false);
const [mobileNavOpen, setMobileNavOpen] = useState(false);
const lastScrollY = useRef(0);

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
      setNavCollapsed(true);
    } else {
      setNavCollapsed(false);
    }
    lastScrollY.current = currentScrollY;
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

**Update header** to include top nav for desktop (below the existing header bar):
```tsx
<header className={`sticky top-0 z-40 transition-transform duration-300 ${navCollapsed ? "-translate-y-full" : "translate-y-0"}`}>
  {/* Existing header bar (logo, user, sign out) */}
  <div className="bg-white/80 backdrop-blur border-b border-border">
    {/* ... existing header content ... */}
  </div>
  
  {/* Desktop top navigation */}
  <div className="hidden md:block bg-white/80 backdrop-blur border-b border-border">
    <div className="max-w-6xl mx-auto px-4">
      <nav className="flex items-center gap-1 overflow-x-auto py-2" aria-label="Main navigation">
        {visibleNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              aria-label={item.ariaLabel}
            >
              <item.icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  </div>
</header>
```

**Add mobile accordion nav** (below header, before main content):
```tsx
{/* Mobile accordion navigation */}
<div className="md:hidden border-b border-border bg-white/80 backdrop-blur">
  <button
    onClick={() => setMobileNavOpen(!mobileNavOpen)}
    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
    aria-expanded={mobileNavOpen}
    aria-label="Toggle navigation"
  >
    <span>Menu</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${mobileNavOpen ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
  {mobileNavOpen && (
    <div className="px-4 pb-3 space-y-1">
      {visibleNav.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileNavOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            aria-label={item.ariaLabel}
          >
            <item.icon />
            {item.label}
          </Link>
        );
      })}
    </div>
  )}
</div>
```

**Remove old navigation** (lines 443-501):
- Delete the mobile bottom tab bar (`md:hidden fixed bottom-0 ...`)
- Delete the desktop left sidebar (`hidden md:flex fixed left-0 top-14 bottom-0 w-56 ...`)

**Update main content area** — remove any padding/margin that was accounting for the old sidebar:
- The `main` element at line ~404 currently has `pb-24 md:pb-6` to account for bottom tab bar
- Change to uniform padding: `py-6`

## Validation Plan
1. Run `npm run build` — must pass with no TypeScript errors
2. Manual test flow:
   - Desktop: Scroll down → nav bar slides up and hides; Scroll up → nav bar slides down and shows
   - Desktop: Nav items are horizontally scrollable if they overflow
   - Mobile: Tap "Menu" → accordion expands showing nav items; Tap again → collapses
   - Mobile: Tap a nav item → navigates and closes accordion
   - Both: Active page is highlighted in nav
   - Both: Sign out button still accessible (move to header or mobile accordion)

## Out of Scope
- Changes to page content layout (padding, margins, grid layouts)
- Changes to header behavior (logo, user avatar, sign out button position)
- Animations beyond the collapse/expand transition
- Persisting nav collapse state across page navigations
