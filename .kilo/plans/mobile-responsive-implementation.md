# Mobile Responsiveness Implementation Guide

## Issue
Edit tool is currently restricted to `.kilo\plans\*.md` files only. This document provides the exact code changes needed for mobile responsiveness.

## Changes Required

### 1. `components/AppShell.tsx` - Add Mobile Menu

**Add state** (after line 139):
```typescript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
```

**Add hamburger button** (inside header, after brand link):
```tsx
<button
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
  aria-label="Toggle menu"
  aria-expanded={mobileMenuOpen}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {mobileMenuOpen ? (
      <line x1="18" y1="6" x2="6" y2="18" />
    ) : (
      <line x1="3" y1="12" x2="21" y2="12" />
    )}
  </svg>
</button>
```

**Add mobile drawer** (before closing `</header>`):
```tsx
{mobileMenuOpen && (
  <>
    <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
    <div className="fixed right-0 top-0 bottom-0 w-72 bg-white shadow-xl z-50 md:hidden transform transition-transform">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <span className="font-semibold">Menu</span>
        <button onClick={() => setMobileMenuOpen(false)} className="p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="p-4 space-y-4">
        {childrenList.length > 0 && (
          <div>
            <label className="label mb-2">Switch Child</label>
            <div className="space-y-2">
              {childrenList.map((child) => (
                <button
                  key={child.id}
                  onClick={() => {
                    setSelectedChildId(child.id);
                    localStorage.setItem("selectedChildId", child.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selectedChildId === child.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                  }`}
                >
                  {child.name} — Age {child.age}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
              {session.name?.[0]?.toUpperCase() || "P"}
            </span>
            {session.name}
          </Link>
          <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  </>
)}
```

### 2. `components/AppShell.tsx` - Improve Bottom Nav

**Add safe-area padding** to bottom nav:
```tsx
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-border no-print pb-[env(safe-area-inset-bottom)]" aria-label="Mobile navigation">
```

**Reduce icon size on very small screens**:
```tsx
<item.icon className="w-5 h-5 sm:w-5 sm:h-5" />
```

### 3. `app/dashboard/page.tsx` - Mobile Improvements

**Child selector** (line 144-157):
```tsx
{children.length > 0 && (
  <div className="flex items-center gap-2 w-full sm:w-auto">
    <label className="label mb-0 whitespace-nowrap">Child:</label>
    <select
      value={selectedChild?.id || ""}
      onChange={(e) => handleChildChange(e.target.value)}
      className="input w-full sm:w-auto"
    >
```

**Next step cards** (already responsive, ensure buttons stack):
```tsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
```

### 4. `app/onboarding/child/page.tsx` - Mobile Form Improvements

**Add sticky bottom CTA for mobile**:
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 md:hidden z-30">
  <button type="submit" className="btn-primary w-full" disabled={loading}>
    {loading ? "Saving..." : saved ? "Saved" : "Save & Continue"}
  </button>
</div>
```

**Add padding to main content**:
```tsx
<main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8">
```

**Reduce form spacing on mobile**:
```tsx
<form onSubmit={handleSubmit} className="card space-y-4 sm:space-y-6">
```

### 5. `app/dashboard/plan/monthly/page.tsx` - Table Mobile

**Add min-width to table wrapper**:
```tsx
<div className="overflow-x-auto -mx-4 sm:mx-0">
  <div className="min-w-[640px] px-4 sm:px-0">
    <table className="w-full text-sm">
```

### 6. `app/dashboard/plan/weekly/page.tsx` - Day Cards Mobile

**Ensure day columns stack on mobile**:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
```

### 7. Global Touch Target Improvements

**Add to global CSS or ensure classes**:
```tsx
// Buttons should have min-height
className="btn-primary min-h-[44px]"

// Icon buttons
className="icon-btn min-w-[44px] min-h-[44px]"

// Nav items on mobile
className="min-h-[44px] min-w-[44px]"
```

## Implementation Order

1. First: AppShell mobile menu (highest impact)
2. Second: Onboarding mobile forms
3. Third: Dashboard mobile layout
4. Fourth: Module pages mobile fixes
5. Fifth: Global touch target audit
6. Finally: Build and test

## Testing Checklist

- [ ] 320px width: No horizontal scroll
- [ ] 375px width: All buttons tappable
- [ ] 390px width: Forms usable
- [ ] 430px width: Navigation works
- [ ] Mobile menu opens/closes
- [ ] Bottom nav doesn't overlap content
- [ ] Tables scroll horizontally
- [ ] All touch targets >= 44x44px
- [ ] Safe areas respected on notched devices
