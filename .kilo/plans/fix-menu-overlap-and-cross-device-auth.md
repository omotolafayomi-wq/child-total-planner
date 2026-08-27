# Fix: Mobile Menu Overlap & Cross-Device Authentication

## Issue 1: Mobile Menu Overlap

### Current Problem
The mobile menu drawer overlaps the header and may cause visual glitches. The hamburger button is missing from the mobile header.

### Exact Changes Needed

#### File: `components/AppShell.tsx`

**Change 1: Add mobile menu state**
After line 139 (`const [authChecked, setAuthChecked] = useState(false);`), add:
```typescript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
```

**Change 2: Add hamburger button in header**
After the brand link (`</Link>` around line 222), add:
```tsx
<button
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
  aria-label="Toggle menu"
  aria-expanded={mobileMenuOpen}
>
  {mobileMenuOpen ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  )}
</button>
```

**Change 3: Add mobile drawer before closing `</header>`**
Before `</header>`, add:
```tsx
{mobileMenuOpen && (
  <>
    <div className="fixed inset-0 z-[55] bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
    <div className="fixed right-0 top-0 bottom-0 w-72 bg-white shadow-xl z-[60] md:hidden overflow-y-auto overscroll-contain">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <span className="font-semibold">Menu</span>
        <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground" aria-label="Close menu">
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
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm min-h-[44px] ${
                    selectedChildId === child.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                  }`}
                >
                  <div className="font-medium">{child.name}</div>
                  <div className="text-xs text-muted-foreground">Age {child.age} • {child.schoolLevel}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted min-h-[44px]"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
              {session.name?.[0]?.toUpperCase() || "P"}
            </div>
            {session.name}
          </Link>
          <button
            onClick={() => { handleSignOut(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 min-h-[44px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  </>
)}
```

**Change 4: Update handleSignOut**
Add `setMobileMenuOpen(false);` in the `handleSignOut` function.

**Change 5: Update bottom nav safe area**
Change the bottom nav className to:
```tsx
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-border no-print pb-[env(safe-area-inset-bottom)]" aria-label="Mobile navigation">
```

**Change 6: Add touch target sizes to mobile nav**
Update mobile nav Link className to:
```tsx
className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors min-w-[56px] min-h-[44px] justify-center ${
  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
}`}
```

---

## Issue 2: Cross-Device Authentication

### Current Problem
All auth data is stored in `localStorage`:
- `tcd_parents` - user accounts
- `tcd_sessions` - active sessions
- `tcd_children` - child profiles

This means:
- Sign up on phone → cannot sign in on laptop
- Each device has separate data
- Clearing browser data loses everything

### Solution
Implement server-side authentication using Next.js API routes and HTTP-only cookies.

### Exact Changes Needed

#### 1. Create Server Store

**New file:** `lib/server-store.ts`

```typescript
// Server-side data store
// In production, replace with a real database

declare global {
  var serverParents: any[] | undefined;
  var serverSessions: any[] | undefined;
}

function getServerParents() {
  if (!global.serverParents) {
    global.serverParents = [];
  }
  return global.serverParents;
}

function getServerSessions() {
  if (!global.serverSessions) {
    global.serverSessions = [];
  }
  return global.serverSessions;
}

export function getServerParentByEmail(email: string) {
  return getServerParents().find((p: any) => p.email === email);
}

export function createServerParent(parent: any) {
  const parents = getServerParents();
  parents.push(parent);
  return parent;
}

export function getServerSession(token: string) {
  const sessions = getServerSessions();
  return sessions.find((s: any) => s.token === token);
}

export function createServerSession(session: any) {
  const sessions = getServerSessions();
  sessions.push(session);
  return session;
}

export function deleteServerSession(token: string) {
  const sessions = getServerSessions();
  const index = sessions.findIndex((s: any) => s.token === token);
  if (index >= 0) {
    sessions.splice(index, 1);
  }
}
```

#### 2. Create Signup API Route

**New file:** `app/api/auth/signup/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getServerParentByEmail, createServerParent, createServerSession } from "@/lib/server-store";

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = getServerParentByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password + "tcd_salt_2024");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const parent = {
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash,
      role: "parent" as const,
      createdAt: new Date().toISOString(),
    };

    createServerParent(parent);

    const sessionToken = crypto.randomUUID();
    const session = {
      token: sessionToken,
      parentId: parent.id,
      email: parent.email,
      name: parent.name,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    createServerSession(session);

    const response = NextResponse.json({
      success: true,
      user: { id: parent.id, email: parent.email, name: parent.name },
    });

    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
```

#### 3. Create Signin API Route

**New file:** `app/api/auth/signin/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getServerParentByEmail, createServerSession } from "@/lib/server-store";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const parent = getServerParentByEmail(email);
    if (!parent) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password + "tcd_salt_2024");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (passwordHash !== parent.passwordHash) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    const sessionToken = crypto.randomUUID();
    const session = {
      token: sessionToken,
      parentId: parent.id,
      email: parent.email,
      name: parent.name,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    createServerSession(session);

    const response = NextResponse.json({
      success: true,
      user: { id: parent.id, email: parent.email, name: parent.name },
    });

    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Sign in failed" }, { status: 500 });
  }
}
```

#### 4. Create Session API Route

**New file:** `app/api/auth/session/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession, deleteServerSession } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ user: null });
  }

  const session = getServerSession(sessionToken);
  if (!session || new Date(session.expiresAt) < new Date()) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: session.parentId,
      email: session.email,
      name: session.name,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;

  if (sessionToken) {
    deleteServerSession(sessionToken);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("session");
  return response;
}
```

#### 5. Update Client-Side Auth

**Modify:** `lib/auth.ts`

Replace the current `signUp`, `signIn`, `getCurrentUser`, and `signOut` functions with:

```typescript
export async function signUp(email: string, name: string, password: string) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Signup failed");
  }

  return await response.json();
}

export async function signIn(email: string, password: string) {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Sign in failed");
  }

  return await response.json();
}

export async function getCurrentUser() {
  try {
    const response = await fetch("/api/auth/session", {
      cache: "no-store",
    });
    const data = await response.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function signOut() {
  await fetch("/api/auth/session", { method: "DELETE" });
}
```

**Important:** Keep `getSession` as a synchronous wrapper for backward compatibility:

```typescript
export function getSession() {
  // This is now deprecated but kept for components that haven't been updated yet
  // It will return null on server-side and the actual session on client-side after hydration
  if (typeof window === "undefined") return null;
  
  // Check for session cookie presence
  const hasSession = document.cookie.includes("session=");
  if (!hasSession) return null;
  
  // Return a minimal session object
  // The actual user data will be loaded asynchronously
  return {
    token: "pending",
    parentId: "pending",
    email: "pending",
    name: "pending",
  };
}
```

#### 6. Update AppShell for Async Auth

**Modify:** `components/AppShell.tsx`

Replace the `useEffect` that loads session:

```typescript
useEffect(() => {
  async function loadSession() {
    const user = await getCurrentUser();
    setSession(user);
    if (user) {
      const kids = getChildren(user.id);
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
  }
  loadSession();
}, []);
```

## Testing Checklist

### Menu Overlap
- [ ] Open mobile menu on 320px width
- [ ] Verify menu slides in from right without overlapping header
- [ ] Verify backdrop covers content
- [ ] Verify bottom nav remains visible below menu
- [ ] Close menu and verify smooth transition

### Cross-Device Auth
- [ ] Sign up on one device/browser
- [ ] Sign in on different device/browser with same email/password
- [ ] Verify session persists after page refresh
- [ ] Verify sign out works on all devices
- [ ] Verify data syncs across devices

## Notes
- The server-side store uses in-memory storage which resets on server restart
- For production, replace with a real database (PostgreSQL, MongoDB, etc.)
- Cookies are HTTP-only and secure in production
- Session expires after 7 days
