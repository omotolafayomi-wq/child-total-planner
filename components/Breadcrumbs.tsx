"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/children": "My Children",
  "/dashboard/assess": "Assessment",
  "/dashboard/goals": "Goals",
  "/dashboard/activities": "Activities",
  "/dashboard/evidence": "Evidence",
  "/dashboard/reports": "Reports",
  "/dashboard/portfolio": "Portfolio",
  "/dashboard/profile": "Profile",
  "/dashboard/plan/weekly": "Weekly Plan",
  "/dashboard/plan/monthly": "Monthly Plan",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  
  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = breadcrumbMap[href] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { href, label };
  });

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb" role="navigation">
      <Link href="/dashboard" className="hover:text-foreground transition-colors" aria-label="Dashboard">
        <Home className="w-4 h-4" />
      </Link>
      {crumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center gap-2">
          <ChevronRight className="w-3 h-3" />
          {index === crumbs.length - 1 ? (
            <span className="text-foreground font-medium" aria-current="page">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
