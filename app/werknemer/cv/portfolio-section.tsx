"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PortfolioItem } from "./page";

const MAX_ITEMS = 9;

export default function PortfolioSection({
  employeeId,
  userId,
  initial,
}: {
  employeeId: string;
  userId: string;
  initial: PortfolioItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioItem[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  async function persist(newItems: PortfolioItem[]) {
    setLoading(true);
    const supabase = createClient();
    const { error: updErr } = await supabase
      .from("employees")
      .update({ portfolio: newItems.length > 0 ? newItems : null })
      .eq("id", employeeId);
    setLoading(false);
    if (updErr) {
      setError(updErr.message);
      return false;
    }
    router.refresh();
    return true;
  }

  async function handleAddFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (items.length >= MAX_ITEMS) {
      setError(`Maximaal ${MAX_ITEMS} portfolio items.`);
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Foto te groot (max 5MB).");
      e.target.value = "";
      return;
    }

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `${userId}/portfolio-${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("employee-media")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (upErr) {
      setError(`Upload mislukt: ${upErr.message}`);
      setUploading(false);
      e.target.value = "";
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("employee-media").getPublicUrl(fileName);

    const newItem: PortfolioItem = {
      id: crypto.randomUUID(),
      image_url: publicUrl,
      title: file.name.replace(/\.[^.]+$/, "").slice(0, 60),
      description: null,
    };
    const next = [newItem, ...items];
    await persist(next);
    setItems(next);
    setUploading(false);
    e.target.value = "";
    // Direct in edit mode zodat user titel kan zetten
    setEditingId(newItem.id);
    setEditTitle(newItem.title);
    setEditDesc("");
  }

  async function deleteItem(id: string) {
    if (!confirm("Verwijder dit portfolio item?")) return;
    const target = items.find((i) => i.id === id);
    const next = items.filter((i) => i.id !== id);

    // Remove from storage
    if (target?.image_url) {
      const supabase = createClient();
      const marker = "/storage/v1/object/public/employee-media/";
      const idx = target.image_url.indexOf(marker);
      if (idx >= 0) {
        await supabase.storage
          .from("employee-media")
          .remove([target.image_url.slice(idx + marker.length)]);
      }
    }

    const ok = await persist(next);
    if (ok) setItems(next);
  }

  function startEdit(item: PortfolioItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDesc(item.description ?? "");
  }

  async function saveEdit() {
    if (!editingId) return;
    const next = items.map((i) =>
      i.id === editingId
        ? { ...i, title: editTitle.trim(), description: editDesc.trim() || null }
        : i
    );
    const ok = await persist(next);
    if (ok) {
      setItems(next);
      setEditingId(null);
    }
  }

  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="font-serif text-xl font-medium">
            Portfolio ({items.length}/{MAX_ITEMS})
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Foto&apos;s van projecten waar je trots op bent. Bv. event setups,
            keuken creaties, kapsels, of bouwwerk.
          </p>
        </div>
        {items.length < MAX_ITEMS && (
          <label className="bg-ink text-paper px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-ink-soft transition-colors cursor-pointer">
            {uploading ? "Uploaden..." : "+ Foto toevoegen"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAddFile}
              disabled={uploading || loading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200 mb-3">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-stone-500 text-center py-6">
          Nog geen portfolio items.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-cream border border-stone-200 rounded-lg overflow-hidden"
            >
              <div className="aspect-square bg-stone-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Titel"
                      maxLength={60}
                      className="w-full px-2 py-1 border border-stone-300 rounded text-sm bg-paper focus:outline-none focus:border-ink"
                    />
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={2}
                      maxLength={200}
                      placeholder="Korte uitleg"
                      className="w-full px-2 py-1 border border-stone-300 rounded text-xs bg-paper focus:outline-none focus:border-ink resize-none"
                    />
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={loading}
                        className="text-xs px-2 py-1 text-stone-600 hover:text-ink"
                      >
                        Annuleer
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={loading}
                        className="text-xs px-2 py-1 bg-lime text-ink rounded font-semibold hover:bg-lime-dark disabled:opacity-50"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-semibold text-sm truncate">
                      {item.title || "Zonder titel"}
                    </div>
                    {item.description && (
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        disabled={loading}
                        className="text-xs px-2 py-0.5 rounded bg-paper border border-stone-200 hover:border-ink disabled:opacity-50"
                      >
                        Bewerk
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        disabled={loading}
                        className="text-xs px-2 py-0.5 rounded text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Verwijder
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
