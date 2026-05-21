"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PayButton({
  invoiceId,
  amountCents,
  demoMode,
  hasMandate,
}: {
  invoiceId: string;
  amountCents: number;
  demoMode: boolean;
  hasMandate: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function payNow() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { data: emp } = await supabase
      .from("employers")
      .select("id")
      .eq("user_id", userData.user!.id)
      .single();
    if (!emp) {
      setError("Werkgever niet gevonden");
      setLoading(false);
      return;
    }

    if (demoMode) {
      // Simuleer succesvolle iDEAL betaling
      // 1) Log payment attempt
      await supabase.from("payment_attempts").insert({
        invoice_id: invoiceId,
        employer_id: emp.id,
        amount_cents: amountCents,
        method_type: "ideal",
        provider: "mollie",
        status: "succeeded",
        processed_at: new Date().toISOString(),
        settled_at: new Date().toISOString(),
        metadata: { demo: true },
      });

      // 2) Mark invoice as paid
      const { error: updErr } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          paid_via: "ideal",
        })
        .eq("id", invoiceId);

      if (updErr) {
        setError(updErr.message);
        setLoading(false);
        return;
      }
      setLoading(false);
      router.refresh();
      return;
    }

    // Productie: zou een POST naar /api/payments/create-ideal-link doen
    // die Mollie checkout URL teruggeeft, dan window.location = url
    setError(
      "Mollie integratie nog niet gewired. Voeg MOLLIE_API_KEY toe en bouw /api/payments/* endpoints."
    );
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={payNow}
        disabled={loading}
        className="text-xs px-2.5 py-1 rounded-md bg-lime text-ink font-semibold hover:bg-lime-dark disabled:opacity-50 transition-colors"
      >
        {loading
          ? "..."
          : hasMandate
            ? "💳 Incasseren"
            : "🇳🇱 Direct betalen"}
      </button>
      {error && (
        <span className="text-[10px] text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
          {error}
        </span>
      )}
    </div>
  );
}
