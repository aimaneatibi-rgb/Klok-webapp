"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CvBasicsForm({
  employeeId,
  userId,
  fullName,
  initial,
}: {
  employeeId: string;
  userId: string;
  fullName: string;
  initial: {
    profile_photo_url: string;
    bio: string;
    skills: string[];
  };
}) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState(initial.profile_photo_url);
  const [bio, setBio] = useState(initial.bio);
  const [skillsRaw, setSkillsRaw] = useState(initial.skills.join(", "));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Foto te groot (max 5MB).");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `${userId}/profile-${Date.now()}.${ext}`;

    // Verwijder oude foto als die er was (alleen onze eigen folder)
    if (photoUrl) {
      const marker = "/storage/v1/object/public/employee-media/";
      const idx = photoUrl.indexOf(marker);
      if (idx >= 0) {
        await supabase.storage
          .from("employee-media")
          .remove([photoUrl.slice(idx + marker.length)]);
      }
    }

    const { error: upErr } = await supabase.storage
      .from("employee-media")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (upErr) {
      setError(`Upload mislukt: ${upErr.message}`);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("employee-media").getPublicUrl(fileName);

    setPhotoUrl(publicUrl);
    setUploading(false);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const skills = skillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const supabase = createClient();
    const { error: updErr } = await supabase
      .from("employees")
      .update({
        profile_photo_url: photoUrl || null,
        bio: bio.trim() || null,
        skills: skills.length > 0 ? skills : null,
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
      <h2 className="font-serif text-xl font-medium mb-4">
        Persoonlijke intro
      </h2>

      <div className="grid grid-cols-[auto_1fr] gap-5 items-start mb-4">
        {/* Profielfoto */}
        <div>
          <label className="eyebrow block mb-2">Profielfoto</label>
          <div className="w-32 h-32 rounded-full bg-stone-100 border border-stone-200 overflow-hidden relative group">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-stone-400">
                👤
              </div>
            )}
            <label className="absolute inset-0 bg-ink/0 hover:bg-ink/40 flex items-center justify-center cursor-pointer transition-colors group">
              <span className="text-paper text-xs font-semibold opacity-0 group-hover:opacity-100">
                {uploading ? "..." : "📷 Wijzig"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-[128px]">
            Vierkante foto werkt het beste. Max 5MB.
          </p>
        </div>

        {/* Bio + Skills */}
        <div className="space-y-3 min-w-0">
          <div>
            <label className="eyebrow block mb-1.5">
              Korte intro (verschijnt bovenaan je CV)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Wie ben je in 2-3 zinnen? Wat doe je graag? Wat zoek je in een werkomgeving?"
              className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink resize-none text-sm"
            />
            <div className="text-xs text-stone-500 mt-1 text-right">
              {bio.length}/500
            </div>
          </div>

          <div>
            <label className="eyebrow block mb-1.5">
              Skills (komma-gescheiden)
            </label>
            <input
              type="text"
              value={skillsRaw}
              onChange={(e) => setSkillsRaw(e.target.value)}
              placeholder="Bartender, cocktails, klantgericht, snel werken"
              className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink text-sm"
            />
            <p className="text-xs text-stone-500 mt-1">
              Wat ben je goed in? Werkgevers zoeken op deze tags.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200 mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-lime/20 text-ink text-sm px-3 py-2 rounded-md border border-lime mb-3">
          ✓ Intro opgeslagen.
        </div>
      )}

      <div className="flex justify-end pt-3 border-t border-stone-100">
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
