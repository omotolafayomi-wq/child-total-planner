import { ACTIVITY_LIBRARY, PILLARS } from "@/lib/store";
import Link from "next/link";

export default function PublicActivitiesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Activities</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Discover practical activities to support your child&apos;s development across LEARN, LIVE, LEAD, EARN and SERVE.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACTIVITY_LIBRARY.slice(0, 12).map((activity) => (
          <div key={activity.id} className="card">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {PILLARS.find((p) => p.value === activity.pillar)?.label || activity.pillar}
              </span>
            </div>
            <h3 className="font-semibold mb-2">{activity.title}</h3>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-4">
          Want to save activities and create personalized plans?
        </p>
        <Link href="/onboarding/welcome" className="btn-primary">
          Create Free Account
        </Link>
      </div>
    </div>
  );
}

