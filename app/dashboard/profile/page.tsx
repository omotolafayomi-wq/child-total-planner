"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOnboardingState } from "@/lib/store";
import { updateParent, getParentByEmail } from "@/lib/store";
import { hashPassword } from "@/lib/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", location: "", planningStyle: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPassword: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onboarding = getOnboardingState();
      if (!onboarding) {
        router.replace("/onboarding/welcome");
        return;
      }
      setUser({ id: onboarding.parentId });
      const biodata = (onboarding as any).biodata || {};
      setForm({
        name: biodata.parentName || "",
        email: biodata.email || "",
        phone: biodata.phone || "",
        location: biodata.location || "",
        planningStyle: "",
    });
  }, [router]);

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    updateParent(user.id, {
      name: form.name,
      phone: form.phone,
      location: form.location,
      planningStyle: form.planningStyle,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!user) return;
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const parent = getParentByEmail(user.email);
    if (!parent) {
      setError("Account not found.");
      return;
    }
    const newHash = await hashPassword(passwordForm.newPassword);
    updateParent(user.id, { passwordHash: newHash });
    setPasswordForm({ current: "", newPassword: "", confirm: "" });
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  }

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Personal Information</h2>
        {saved && (
          <div className="mb-4 rounded-lg bg-growth/10 text-growth px-4 py-2 text-sm font-medium">
            Profile updated successfully!
          </div>
        )}
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} className="input bg-muted" disabled />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="label">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+234..." />
          </div>
          <div>
            <label className="label">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" placeholder="City, State" />
          </div>
          <div>
            <label className="label">Planning Style</label>
            <select value={form.planningStyle} onChange={(e) => setForm({ ...form, planningStyle: e.target.value })} className="input">
              <option value="">Select style</option>
              <option value="structured">Structured — detailed schedules</option>
              <option value="flexible">Flexible — adapt as we go</option>
              <option value="mixed">Mix of both</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Change Password</h2>
        {passwordSaved && (
          <div className="mb-4 rounded-lg bg-growth/10 text-growth px-4 py-2 text-sm font-medium">
            Password updated successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-600 px-4 py-2 text-sm font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input" placeholder="At least 6 characters" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="input" placeholder="Re-enter new password" />
          </div>
          <button type="submit" className="btn-primary" disabled={!passwordForm.newPassword || !passwordForm.confirm}>Update Password</button>
        </form>
      </div>
    </div>
  );
}

