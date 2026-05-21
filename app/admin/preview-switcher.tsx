"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Item = { id: string; label: string };

export default function PreviewSwitcher({
  employers,
  employees,
}: {
  employers: Item[];
  employees: Item[];
}) {
  const router = useRouter();

  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-4">
      <div className="eyebrow mb-3">👁 Preview als</div>
      <div className="space-y-2">
        <Selector
          placeholder="Bekijk werkgever..."
          options={employers}
          onSelect={(id) => router.push(`/admin/bekijk/werkgever/${id}`)}
        />
        <Selector
          placeholder="Bekijk werknemer..."
          options={employees}
          onSelect={(id) => router.push(`/admin/bekijk/werknemer/${id}`)}
        />
      </div>
      {employers.length === 0 && employees.length === 0 && (
        <p className="text-xs text-stone-500 mt-2">
          Nog geen accounts om te previewen.
        </p>
      )}
    </div>
  );
}

function Selector({
  placeholder,
  options,
  onSelect,
}: {
  placeholder: string;
  options: Item[];
  onSelect: (id: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <select
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        if (v) {
          setValue(v);
          onSelect(v);
        }
      }}
      disabled={options.length === 0}
      className="w-full px-3 py-2 border border-stone-200 rounded-md bg-cream text-sm font-medium focus:outline-none focus:border-ink disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
