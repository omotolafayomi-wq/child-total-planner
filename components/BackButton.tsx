import Link from "next/link";
import { usePathname } from "next/navigation";

const backMap: Record<string, string> = {
  "/dashboard/assess": "/dashboard",
  "/dashboard/goals": "/dashboard",
  "/dashboard/activities": "/dashboard",
  "/dashboard/evidence": "/dashboard",
  "/dashboard/plan/weekly": "/dashboard",
  "/dashboard/plan/monthly": "/dashboard",
  "/dashboard/reports": "/dashboard",
  "/dashboard/portfolio": "/dashboard",
  "/dashboard/profile": "/dashboard",
  "/dashboard/children": "/dashboard",
  "/dashboard/modules/parent-guidance": "/dashboard",
  "/dashboard/modules/tracker": "/dashboard",
  "/dashboard/modules/holiday": "/dashboard",
  "/dashboard/modules/school-term": "/dashboard",
};

export default function BackButton() {
  const pathname = usePathname();
  const href = backMap[pathname] || "/dashboard";

  return (
    <Link href={href} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      Dashboard
    </Link>
  );
}
