"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  shiftId: string;
  shiftStatus: string;
  clockInAt: string | null;
  clockOutAt: string | null;
  hourlyRateCents: number;
};

export default function ClockButtons({
  shiftId,
  shiftStatus,
  clockInAt,
  clockOutAt,
  hourlyRateCents,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClockIn() {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error: updErr } = await supabase
      .from("shifts")
      .update({
        clock_in_at: new Date().toISOString(),
        status: "in_progress",
      })
      .eq("id", shiftId);

    if (updErr) {
      setError(updErr.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    router.refresh();
  }

  async function handleClockOut() {
    if (!clockInAt) {
      setError("Geen clock-in tijd gevonden.");
      return;
    }
    setLoading(true);
    setError(null);

    const now = new Date();
    const hoursWorked =
      (now.getTime() - new Date(clockInAt).getTime()) / 3_600_000;
    const hoursRounded = Math.round(hoursWorked * 100) / 100;

    const supabase = createClient();
    const { error: updErr } = await supabase
      .from("shifts")
      .update({
        clock_out_at: now.toISOString(),
        hours_worked: hoursRounded,
        status: "completed",
      })
      .eq("id", shiftId);

    if (updErr) {
      setError(updErr.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    router.refresh();
  }

  // State: confirmed, niet ingeklokt
  if (shiftStatus === "confirmed" && !clockInAt) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleClockIn}
          disabled={loading}
          className="bg-lime text-ink px-4 py-2 rounded-md text-sm font-semibold hover:bg-lime-dark transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "🟢 Klok in"}
        </button>
        {error && (
          <span className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
            {error}
          </span>
        )}
      </div>
    );
  }

  // State: in_progress, ingeklokt maar niet uitgeklokt
  if (shiftStatus === "in_progress" && clockInAt && !clockOutAt) {
    const inTime = new Date(clockInAt);
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="text-xs text-stone-600">
          Ingeklokt:{" "}
          {inTime.toLocaleTimeString("nl-NL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <button
          onClick={handleClockOut}
          disabled={loading}
          className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-semibold hover:bg-ink-soft transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "🔴 Klok uit"}
        </button>
        {error && (
          <span className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
            {error}
          </span>
        )}
      </div>
    );
  }

  // State: completed, niet (nog) goedgekeurd — voorbij voor werknemer
  if (shiftStatus === "completed" && clockOutAt) {
    return (
      <div className="text-right">
        <div className="text-xs text-stone-600 mb-1">
          Uitgeklokt:{" "}
          {new Date(clockOutAt).toLocaleTimeString("nl-NL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <span className="text-xs text-stone-500">
          Wacht op goedkeuring werkgever
        </span>
      </div>
    );
  }

  // Suppress unused props warning
  void hourlyRateCents;
  return null;
}
