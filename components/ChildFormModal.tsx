"use client";

import { useState } from "react";
import { createChild } from "@/lib/store";

interface ChildFormModalProps {
  parentId: string;
  onClose: () => void;
  onSave: (child: any) => void;
}

export default function ChildFormModal({ parentId, onClose, onSave }: ChildFormModalProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !age || !schoolLevel) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const child = createChild({
        parentId,
        name,
        age: parseInt(age, 10),
        schoolLevel,
        interests: [],
        strengths: [],
        areasForSupport: [],
      });
      onSave(child);
    } catch (err) {
      setError((err as Error)?.message || "Failed to create child.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h2 className="text-xl font-bold mb-4">Add Your Child</h2>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="childName">Child&apos;s Name</label>
            <input id="childName" type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="childAge">Age</label>
            <input id="childAge" type="number" className="input" value={age} onChange={(e) => setAge(e.target.value)} min={0} max={18} required />
          </div>
          <div>
            <label className="label" htmlFor="schoolLevel">School Level</label>
            <select id="schoolLevel" className="input" value={schoolLevel} onChange={(e) => setSchoolLevel(e.target.value)} required>
              <option value="">Select level</option>
              <option value="preschool">Preschool</option>
              <option value="primary">Primary</option>
              <option value="junior_secondary">Junior Secondary</option>
              <option value="senior_secondary">Senior Secondary</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? "Saving..." : "Add Child"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
