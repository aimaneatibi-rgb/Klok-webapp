"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type Props = {
  bucket: string;
  pathPrefix: string; // folder prefix, e.g. "employer-id/"
  value: string[];
  onChange: (urls: string[]) => void;
  maxPhotos?: number;
  maxFileSize?: number; // bytes
  label?: string;
};

export default function PhotoUploader({
  bucket,
  pathPrefix,
  value,
  onChange,
  maxPhotos = 5,
  maxFileSize = 5 * 1024 * 1024,
  label = "Optioneel. Toon de werkplek, team of sfeer.",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (value.length + files.length > maxPhotos) {
      setError(`Maximaal ${maxPhotos} foto's.`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > maxFileSize) {
        setError(
          `${file.name} is groter dan ${Math.round(maxFileSize / 1024 / 1024)}MB.`
        );
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const fileName = `${pathPrefix}${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (upErr) {
        setError(`Upload mislukt: ${upErr.message}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);
      newUrls.push(publicUrl);
    }

    onChange([...value, ...newUrls]);
    setUploading(false);
    e.target.value = "";
  }

  async function handleRemove(url: string) {
    const supabase = createClient();
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx >= 0) {
      const path = url.slice(idx + marker.length);
      await supabase.storage.from(bucket).remove([path]);
    }
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div>
      <p className="text-xs text-stone-500 mb-2">
        {label} Max {maxPhotos} foto&apos;s,{" "}
        {Math.round(maxFileSize / 1024 / 1024)}MB per stuk.
      </p>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {value.map((url) => (
            <div
              key={url}
              className="relative group aspect-square bg-stone-100 rounded-md overflow-hidden border border-stone-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Foto"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 bg-ink/80 text-paper rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
                title="Verwijder foto"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < maxPhotos && (
        <label className="inline-block">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-cream border border-stone-300 rounded-md text-sm font-medium hover:border-ink cursor-pointer transition-colors">
            {uploading ? "📤 Uploaden..." : "📷 Foto toevoegen"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={uploading}
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200 mt-2">
          {error}
        </div>
      )}
    </div>
  );
}
