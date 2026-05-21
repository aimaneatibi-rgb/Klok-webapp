"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ApproveButton({
  shiftId,
  employeeId,
}: {
  shiftId: string;
  employeeId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // 1) Set approved_at op shift
    const { error: shiftErr } = await supabase
      .from("shifts")
      .update({ approved_at: new Date().toISOString() })
      .eq("id", shiftId);

    if (shiftErr) {
      setError(shiftErr.message);
      setLoading(false);
      return;
    }

    // 2) Increment employee.total_shifts (fetch + update — acceptable voor MVP)
    const { data: emp } = await supabase
      .from("employees")
      .select("total_shifts")
      .eq("id", employeeId)
      .single();

    const newTotal = (emp?.total_shifts ?? 0) + 1;
    await supabase
      .from("employees")
      .update({ total_shifts: newTotal })
      .eq("id", employeeId);

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="bg-lime text-ink px-4 py-2 rounded-md text-sm font-semibold hover:bg-lime-dark transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "✓ Keur uren goed"}
      </button>
      {error && (
        <span className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
          {error}
        </span>
      )}
    </div>
  );
}
