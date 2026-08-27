"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import * as XLSX from "xlsx";

const STORE_KEYS = {
  parents: "tcd_parents",
};

function getParents() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEYS.parents);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function AdminSignupsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "email">("newest");
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u || !isAdmin(u)) {
        router.push("/signin");
        return;
      }
      setUser(u);
    });
  }, [router]);

  const parents = useMemo(() => {
    const all = getParents();
    const filtered = all.filter((p: any) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    });
    filtered.sort((a: any, b: any) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "email") return a.email.localeCompare(b.email);
      return 0;
    });
    return filtered;
  }, [search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(parents.length / perPage));
  const pageParents = parents.slice((page - 1) * perPage, page * perPage);

  const stats = useMemo(() => {
    const all = getParents();
    const today = new Date().toDateString();
    const todayCount = all.filter((p: any) => new Date(p.createdAt).toDateString() === today).length;
    return {
      total: all.length,
      today: todayCount,
      latest: all.length > 0 ? new Date(all[0].createdAt).toLocaleDateString() : "—",
    };
  }, []);

  function handleExport() {
    const all = getParents();
    const data = all.map((p: any) => ({
      "Parent Name": p.name,
      "Email Address": p.email,
      "Registered Date": new Date(p.createdAt).toISOString().replace("T", " ").slice(0, 19),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 30 },
      { wch: 40 },
      { wch: 22 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registered Signups");
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `total-child-development-signups-${dateStr}.xlsx`);
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Registered Signups</h1>
            <p className="text-muted-foreground mt-1">Administrative view of registered parent accounts.</p>
          </div>
          <button onClick={handleExport} className="btn-primary inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Spreadsheet
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <div className="text-sm text-muted-foreground">Registered Parents</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </div>
          <div className="card">
            <div className="text-sm text-muted-foreground">New Signups Today</div>
            <div className="text-2xl font-bold mt-1">{stats.today}</div>
          </div>
          <div className="card">
            <div className="text-sm text-muted-foreground">Latest Signup</div>
            <div className="text-2xl font-bold mt-1">{stats.latest}</div>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input flex-1"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input w-full sm:w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="email">Email A-Z</option>
            </select>
          </div>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 font-semibold">Parent Name</th>
                <th className="py-3 px-4 font-semibold">Email Address</th>
                <th className="py-3 px-4 font-semibold">Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {pageParents.map((p: any, idx: number) => (
                <tr key={p.id || idx} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">{p.name}</td>
                  <td className="py-3 px-4">{p.email}</td>
                  <td className="py-3 px-4">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {pageParents.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground">No signups found.</td>
                </tr>
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-outline disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
