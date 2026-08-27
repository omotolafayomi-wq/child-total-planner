# Phase 8 Plan: Security Hardening

## Objective
Add server-side validation, child ownership checks, and fix security issues.

---

## 8.1 Server-Side Validation

### Files to modify:
All `app/api/` routes should validate:
- Input types and lengths
- Required fields
- Enum values where applicable
- Ownership checks

### Pattern for child ownership:
```ts
// In lib/server-store.ts or a new lib/security.ts
export function assertChildOwnership(parentId: string, childId: string): boolean {
  const child = getServerChild(childId);
  return child?.parentId === parentId;
}
```

---

## 8.2 Fix Forgot Password Security (Already in Phase 1)

- [x] Do not return temp password in JSON
- [x] Return generic success message

---

## 8.3 Password Change Validation

### File: `app/dashboard/profile/page.tsx`
Ensure password change requires current password:
```tsx
if (currentPassword !== user.passwordHash) { // or verify against hash
  setError("Current password is incorrect.");
  return;
}
```

Note: Since we don't store plain passwords, this needs a hash verification. For now, add a note that this requires server-side implementation.

---

## 8.4 Rate Limiting (Future)

Add rate limiting to auth endpoints to prevent brute-force attacks. Use a simple in-memory store with time windows.

---

## 8.5 CSRF Protection (Future)

Add CSRF tokens to all POST/DELETE API routes using Next.js `csrf` headers or a custom solution.

---

## Validation
Run `npm run build` and verify no errors. Security fixes applied where possible without major rewrites.
