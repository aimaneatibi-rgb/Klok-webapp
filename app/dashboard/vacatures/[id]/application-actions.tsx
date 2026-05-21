"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ApplicationActions({
  applicationId,
  vacancyId,
  employeeId,
}: {
  applicationId: string;
  vacancyId: string;
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
      .from("vacancy_applications")
      .update({ status: "rejected" })
      .eq("id", applicationId);

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

    // 1) Application → accepted
    const { error: appErr } = await supabase
      .from("vacancy_applications")
      .update({ status: "accepted" })
      .eq("id", applicationId);
    if (appErr) {
      setError(appErr.message);
      setLoading(null);
      return;
    }

    // 2) Vacancy → filled
    const { error: vacErr } = await supabase
      .from("vacancies")
      .update({
        status: "filled",
        filled_by_employee_id: employeeId,
        filled_at: new Date().toISOString(),
      })
      .eq("id", vacancyId);
    if (vacErr) {
      setError(vacErr.message);
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
          {loading === "accept" ? "..." : "Aannemen"}
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
