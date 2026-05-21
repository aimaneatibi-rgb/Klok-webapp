"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SocialLinks } from "./page";

const FIELDS: { key: keyof SocialLinks; label: string; placeholder: string }[] =
  [
    {
      key: "linkedin",
      label: "LinkedIn",
      placeholder: "https://linkedin.com/in/...",
    },
    {
      key: "instagram",
      label: "Instagram",
      placeholder: "https://instagram.com/...",
    },
    { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/..." },
    { key: "github", label: "GitHub", placeholder: "https://github.com/..." },
    {
      key: "website",
      label: "Eigen website",
      placeholder: "https://...",
    },
  ];

export default function SocialLinksForm({
  employeeId,
  initial,
}: {
  employeeId: string;
  initial: SocialLinks;
}) {
  const router = useRouter();
  const [links, setLinks] = useState<SocialLinks>(initial);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Trim alle values + lege strings weg
    const cleaned: SocialLinks = {};
    for (const f of FIELDS) {
      const v = links[f.key]?.trim();
      if (v) cleaned[f.key] = v;
    }

    const supabase = createClient();
    const { error: updErr } = await supabase
      .from("employees")
      .update({
        social_links: Object.keys(cleaned).length > 0 ? cleaned : null,
        linkedin_url: cleaned.linkedin || null,
      })
      .eq("id", employeeId);

    if (updErr) {
      setError(updErr.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-paper border border-stone-200 rounded-lg p-6"
    >
      <h2 className="font-serif text-xl font-medium mb-1">Social media</h2>
      <p className="text-sm text-stone-500 mb-4">
        Optioneel. Werkgevers kunnen je netwerk en werk zo beter inschatten.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="eyebrow block mb-1.5">{f.label}</label>
            <input
              type="url"
              value={links[f.key] ?? ""}
              onChange={(e) => {
                setLinks({ ...links, [f.key]: e.target.value });
                setSuccess(false);
              }}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 border border-stone-200 rounded-md bg-paper text-sm focus:outline-none focus:border-ink"
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200 mt-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-lime/20 text-ink text-sm px-3 py-2 rounded-md border border-lime mt-3">
          ✓ Social links opgeslagen.
        </div>
      )}

      <div className="flex justify-end pt-3 mt-3 border-t border-stone-100">
        <button
          type="submit"
          disabled={loading}
          className="bg-lime text-ink px-5 py-2 rounded-md font-semibold hover:bg-lime-dark disabled:opacity-50 transition-colors"
        >
          {loading ? "Opslaan..." : "Opslaan"}
        </button>
      </div>
    </form>
  );
}
