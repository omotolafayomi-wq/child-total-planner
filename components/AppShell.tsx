"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { getChildren, getOnboardingState } from "@/lib/store";

const navItems = [
  { href: "/", label: "Home", ariaLabel: "Home", icon: HomeIcon },
  { href: "/dashboard/children", label: "Children", ariaLabel: "My Children", icon: ChildrenIcon },
  { href: "/dashboard/assess", label: "Assess", ariaLabel: "Assess Development", icon: AssessIcon },
  { href: "/dashboard/goals", label: "Goals", ariaLabel: "Development Goals", icon: GoalsIcon },
  { href: "/dashboard/activities", label: "Activities", ariaLabel: "Activities", icon: ActivitiesIcon },
  { href: "/dashboard/evidence", label: "Evidence", ariaLabel: "Evidence of Growth", icon: EvidenceIcon },
  { href: "/dashboard/reports", label: "Reports", ariaLabel: "Development Reports", icon: ReportsIcon },
  { href: "/dashboard/profile", label: "Profile", ariaLabel: "Parent Profile", icon: ProfileIcon },
];

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  );
}

function ChildrenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}

function AssessIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 16v-3"/><path d="M11 16V8"/><path d="M15 16v-5"/><path d="M19 16v-9"/></svg>
  );
}

function GoalsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  );
}

function ActivitiesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  );
}

function EvidenceIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  );
}

function ReportsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  );
}

function ProfileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  );
}

function SignOutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  );
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  );
}

function TikTokIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.15V11.6a4.85 4.85 0 01-3.77-1.26V6.69h3.77z"/></svg>
  );
}

function YouTubeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.075-.199-.322-.615-.354-.676-.073-.381-.288-.688-.481-.791-.16-.086-.343-.06-.463-.036-.179.036-2.826 1.131-5.445 2.169-.416.166-.818.244-1.192.244-.363 0-.768-.076-1.177-.226-.415-.15-2.826-1.1-3.056-1.156-.228-.055-.326-.089-.463.089-.136.177-1.253 1.543-1.253 3.761 0 2.218 1.278 3.469 1.545 3.707.268.238.627.268 1.003.194.376-.073 2.826-1.153 5.445-2.17.416-.166.818-.243 1.192-.243.363 0 .768.076 1.177.226.415.15 2.826 1.1 3.056 1.156.228.055.326.089.463-.089.136-.177 1.253-1.543 1.253-3.761 0-2.218-1.278-3.469-1.545-3.707z"/></svg>
  );
}

function AboutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
  );
}

function ContactIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  );
}

function TermsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  );
}

function PrivacyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  );
}

const footerLinks = [
  { href: "/about", label: "About", icon: AboutIcon },
  { href: "/contact", label: "Contact", icon: ContactIcon },
  { href: "/terms", label: "Terms", icon: TermsIcon },
  { href: "/privacy", label: "Privacy", icon: PrivacyIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childSwitcherOpen, setChildSwitcherOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const sess = getSession();
    setSession(sess);
    if (sess) {
      const kids = getChildren(sess.parentId);
      setChildrenList(kids);
      const saved = localStorage.getItem("selectedChildId");
      if (saved && kids.find((c: any) => c.id === saved)) {
        setSelectedChildId(saved);
      } else if (kids.length > 0) {
        setSelectedChildId(kids[0].id);
        localStorage.setItem("selectedChildId", kids[0].id);
      }
    }
    setAuthChecked(true);
  }, [pathname]);

  useEffect(() => {
    if (!authChecked) return;
    const isAuthPage = pathname === "/signin" || pathname === "/signup" || pathname === "/forgot-password";
    const isLanding = pathname === "/";
    const isLegalPage = pathname === "/about" || pathname === "/contact" || pathname === "/terms" || pathname === "/privacy";
    const isOnboarding = pathname.startsWith("/onboarding");
    if (isAuthPage || isLanding || isLegalPage || isOnboarding) return;
    if (!session) {
      router.push("/signin");
      return;
    }
    const onboarding = getOnboardingState();
    if (onboarding && onboarding.parentId === session.parentId && onboarding.step !== "complete") {
      router.push(`/onboarding/${onboarding.step}`);
    }
  }, [authChecked, session, pathname, router]);

  const handleSignOut = () => {
    signOut();
    setSession(null);
    setSelectedChildId(null);
    setChildrenList([]);
    router.push("/");
  };

  const selectedChild = childrenList.find((c) => c.id === selectedChildId);

  const isAuthPage = pathname === "/signin" || pathname === "/signup" || pathname === "/forgot-password";
  const isLanding = pathname === "/";
  const isLegalPage = pathname === "/about" || pathname === "/contact" || pathname === "/terms" || pathname === "/privacy";
  const isOnboarding = pathname.startsWith("/onboarding");

  if (isAuthPage || isLanding || isLegalPage || isOnboarding) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const visibleNav = navItems.filter((item) => {
    if (item.href === "/" || item.href === "/dashboard/children") return true;
    if (!selectedChildId) return item.href === "/dashboard/children";
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border no-print">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary tracking-tight">Total Child</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {childrenList.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setChildSwitcherOpen(!childSwitcherOpen)}
                  className="icon-btn flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                  aria-expanded={childSwitcherOpen}
                  aria-label="Switch child"
                >
                  <span className="truncate max-w-[100px]">
                    {selectedChild ? selectedChild.name : "Select child"}
                  </span>
                  <ChevronDownIcon />
                </button>
                {childSwitcherOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setChildSwitcherOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border border-border bg-white shadow-lg py-1">
                      {childrenList.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => {
                            setSelectedChildId(child.id);
                            localStorage.setItem("selectedChildId", child.id);
                            setChildSwitcherOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                            selectedChildId === child.id ? "bg-muted font-medium" : ""
                          }`}
                        >
                          <div className="font-medium">{child.name}</div>
                          <div className="text-xs text-muted-foreground">Age {child.age} • {child.schoolLevel}</div>
                        </button>
                      ))}
                      <Link
                        href="/dashboard/children"
                        className="block px-3 py-2 text-sm text-accent hover:bg-muted transition-colors border-t border-border mt-1"
                        onClick={() => setChildSwitcherOpen(false)}
                      >
                        + Add child
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            <Link
              href="/dashboard/profile"
              className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Parent profile"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                {session.name?.[0]?.toUpperCase() || "P"}
              </div>
              <span className="hidden lg:inline max-w-[120px] truncate">{session.name}</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="icon-btn hidden md:inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Sign out"
            >
              <SignOutIcon />
              <span className="hidden lg:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {selectedChildId ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ChildrenIcon />
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Total Child</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              Add your first child to begin their development journey.
            </p>
            <Link href="/onboarding/child" className="btn-primary">
              Add Your First Child
            </Link>
          </div>
        )}
      </main>

      {selectedChildId && (
        <>
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-border no-print" aria-label="Mobile navigation">
            <div className="flex items-center justify-around px-2 py-1.5">
              {visibleNav.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors min-w-[60px] ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={item.ariaLabel}
                  >
                    <item.icon />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <nav className="hidden md:flex fixed left-0 top-14 bottom-0 w-56 border-r border-border bg-white/80 backdrop-blur z-30 no-print flex-col" aria-label="Desktop navigation">
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <div className="space-y-1">
                {visibleNav.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
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
            </div>
            <div className="p-3 border-t border-border">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Sign out"
              >
                <SignOutIcon />
                Sign out
              </button>
            </div>
          </nav>
        </>
      )}

      <footer className="border-t border-border bg-surface-soft no-print">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/dashboard/children" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Children</Link></li>
                <li><Link href="/dashboard/goals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Goals</Link></li>
                <li><Link href="/dashboard/reports" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reports</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3">Family</h3>
              <ul className="space-y-2">
                <li><Link href="/dashboard/assess" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Assess</Link></li>
                <li><Link href="/dashboard/activities" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Activities</Link></li>
                <li><Link href="/dashboard/evidence" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Evidence</Link></li>
                <li><Link href="/dashboard/plan/weekly" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Weekly Plan</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/dashboard/modules/parent-guidance" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Parent Guidance</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.facebook.com/profile.php?id=61562544517742" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                    <FacebookIcon /> Facebook
                  </a>
                </li>
                <li>
                  <a href="https://www.tiktok.com/@omotolafayomi" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                    <TikTokIcon /> TikTok
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@fayomiomotola4672" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                    <YouTubeIcon /> YouTube
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/2348038291810" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                    <WhatsAppIcon /> WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Total Child Development Planner — Built for Nigerian and African families.
            </p>
            <p className="text-xs text-muted-foreground mt-1">LEARN • LIVE • LEAD • EARN • SERVE</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
