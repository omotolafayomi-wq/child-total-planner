"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { getChildren, createChild, updateChild, archiveChild } from "@/lib/store";

export default function ChildrenPage() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    schoolLevel: "",
    gender: "",
    interests: "",
    strengths: "",
    areasForSupport: "",
  });
  const router = useRouter();

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.push("/signin");
      return;
    }
    setUser(u);
    setChildren(getChildren(u.id));
  }, [router]);

  function resetForm() {
    setFormData({ name: "", age: "", schoolLevel: "", gender: "", interests: "", strengths: "", areasForSupport: "" });
    setShowForm(false);
    setEditingId(null);
  }

  function handleEdit(child: any) {
    setFormData({
      name: child.name,
      age: child.age.toString(),
      schoolLevel: child.schoolLevel,
      gender: child.gender || "",
      interests: child.interests.join(", "),
      strengths: child.strengths.join(", "),
      areasForSupport: child.areasForSupport.join(", "),
    });
    setEditingId(child.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const data = {
      parentId: user.id,
      name: formData.name,
      age: parseInt(formData.age) || 5,
      schoolLevel: formData.schoolLevel,
      gender: formData.gender || undefined,
      interests: formData.interests.split(",").map((s) => s.trim()).filter(Boolean),
      strengths: formData.strengths.split(",").map((s) => s.trim()).filter(Boolean),
      areasForSupport: formData.areasForSupport.split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (editingId) {
      updateChild(editingId, data);
    } else {
      createChild(data);
    }
    setChildren(getChildren(user.id));
    resetForm();
  }

  function handleArchive(id: string) {
    if (!confirm("Archive this child? Their data will be hidden but not deleted.")) return;
    archiveChild(id);
    setChildren(getChildren(user.id));
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Children</h1>
          <p className="text-muted-foreground">Manage your children&apos;s development profiles</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary">
          {showForm ? "Cancel" : "+ Add Child"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Child" : "Add New Child"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="name">Name</label>
                <input id="name" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="label" htmlFor="age">Age</label>
                <input id="age" type="number" min="3" max="18" className="input" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} required />
              </div>
              <div>
                <label className="label" htmlFor="schoolLevel">School Level</label>
                <input id="schoolLevel" className="input" value={formData.schoolLevel} onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })} placeholder="e.g. Primary 4, JSS 2" required />
              </div>
              <div>
                <label className="label" htmlFor="gender">Gender (optional)</label>
                <input id="gender" className="input" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="interests">Interests (comma separated)</label>
                <input id="interests" className="input" value={formData.interests} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="strengths">Strengths (comma separated)</label>
                <input id="strengths" className="input" value={formData.strengths} onChange={(e) => setFormData({ ...formData, strengths: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="areasForSupport">Areas for Support (comma separated)</label>
                <input id="areasForSupport" className="input" value={formData.areasForSupport} onChange={(e) => setFormData({ ...formData, areasForSupport: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">{editingId ? "Save Changes" : "Add Child"}</button>
              <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {children.length === 0 && !showForm ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No children added yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add your first child to begin their development journey. You can add multiple children and switch between them easily.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <div key={child.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{child.name}</h3>
                  <p className="text-sm text-muted-foreground">Age {child.age} • {child.schoolLevel}</p>
                  {child.interests.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Interests: {child.interests.slice(0, 3).join(", ")}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link href={`/dashboard/children/${child.id}`} className="btn-outline flex-1 justify-center text-xs py-2">
                  View Profile
                </Link>
                <button onClick={() => handleEdit(child)} className="btn-outline flex-1 justify-center text-xs py-2">
                  Edit
                </button>
                <button onClick={() => handleArchive(child.id)} className="btn-outline flex-1 justify-center text-xs py-2 text-red-600 hover:text-red-700">
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
