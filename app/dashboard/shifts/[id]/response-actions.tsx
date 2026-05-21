"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResponseActions({
  responseId,
  shiftId,
  employeeId,
}: {
  responseId: string;
  shiftId: string;
  employeeId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReject() {
    setLoading("reject");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("shift_responses")
      .update({ status: "rejected" })
      .eq("id", responseId);

    if (error) {
      setError(error.message);
      setLoading(null);
      return;
    }
    setLoading(null);
    router.refresh();
  }

  async function handleAccept() {
    setLoading("accept");
    setError(null);

    const supabase = createClient();

    // 1) Mark dit response als accepted
    const { error: respErr } = await supabase
      .from("shift_responses")
      .update({ status: "accepted" })
      .eq("id", responseId);
    if (respErr) {
      setError(respErr.message);
      setLoading(null);
      return;
    }

    // 2) Update shift: assigned + confirmed
    const { error: shiftErr } = await supabase
      .from("shifts")
      .update({
        assigned_employee_id: employeeId,
        status: "confirmed",
      })
      .eq("id", shiftId);
    if (shiftErr) {
      setError(shiftErr.message);
      setLoading(null);
      return;
    }

    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex gap-2">
        <button
          onClick={handleReject}
          disabled={loading !== null}
          className="px-3 py-1.5 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50"
        >
          {loading === "reject" ? "..." : "Afwijzen"}
        </button>
        <button
          onClick={handleAccept}
          disabled={loading !== null}
          className="px-4 py-1.5 rounded-md text-sm font-semibold bg-lime text-ink hover:bg-lime-dark transition-colors disabled:opacity-50"
        >
          {loading === "accept" ? "..." : "Accepteer"}
        </button>
      </div>
      {error && (
        <div className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
