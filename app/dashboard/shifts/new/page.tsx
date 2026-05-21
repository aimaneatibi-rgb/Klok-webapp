import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSectorLabel } from "@/lib/sectors";
import NewShiftForm from "./new-shift-form";

export default async function NewShiftPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: employer } = await supabase
    .from("employers")
    .select("id, company_name, sector, coop_agreement_signed_at")
    .eq("user_id", user!.id)
    .single();

  if (!employer) {
    redirect("/dashboard/instellingen");
  }

  if (!employer.coop_agreement_signed_at) {
    redirect("/dashboard/overeenkomst");
  }

  // Vereis primaire contactpersoon — anders kunnen we niet factureren of opvolgen
  const { data: primaryContact } = await supabase
    .from("employer_contacts")
    .select("id")
    .eq("employer_id", employer.id)
    .eq("is_primary", true)
    .maybeSingle();

  if (!primaryContact) {
    redirect("/dashboard/instellingen?reden=contact");
  }

  // Lookup actieve payroll partij voor deze sector
  const { data: payrollProvider } = await supabase
    .from("sector_payroll_providers")
    .select("provider_name, provider_legal_name, factoring_rate_bps")
    .eq("sector", employer.sector)
    .eq("active", true)
    .maybeSingle();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        href="/dashboard/shifts"
        className="eyebrow text-stone-500 hover:text-ink"
      >
        ← Terug naar shifts
      </Link>
      <h1 className="font-serif text-4xl font-medium tracking-tight mt-4 mb-2">
        Nieuwe shift plaatsen
      </h1>
      <p className="text-stone-500 text-sm mb-6">
        Vul de details in. Werknemers kunnen direct reageren zodra je &lsquo;m
        plaatst.
      </p>

      {/* Payroll partij info — admin-aangewezen, niet door werkgever te kiezen */}
      <div
        className={`rounded-lg p-4 mb-6 border ${
          payrollProvider
            ? "bg-lime/10 border-lime"
            : "bg-amber-50 border-amber-300"
        }`}
      >
        <div className="eyebrow mb-1">— PAYROLL VOOR DEZE SHIFT</div>
        {payrollProvider ? (
          <>
            <div className="font-serif text-lg font-medium">
              {payrollProvider.provider_name}
            </div>
            <p className="text-sm text-stone-700 mt-1">
              Voor shifts in <strong>{getSectorLabel(employer.sector)}</strong>{" "}
              werkt KLOK samen met {payrollProvider.provider_name}.{" "}
              {payrollProvider.provider_name} verzorgt het contract en de
              loonadministratie.{" "}
              {payrollProvider.factoring_rate_bps != null && (
                <>
                  Factoring rate:{" "}
                  <span className="font-mono">
                    {(payrollProvider.factoring_rate_bps / 100).toFixed(2)}%
                  </span>
                  .
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <div className="font-semibold text-amber-900">
              Geen payroll partij toegewezen voor{" "}
              {getSectorLabel(employer.sector)}
            </div>
            <p className="text-sm text-amber-900 mt-1">
              KLOK Works is nog in onderhandeling met een payroll partij voor
              jouw sector. Voorlopig handelen we shifts handmatig af — neem
              contact op via hallo@klokworks.nl.
            </p>
          </>
        )}
      </div>

      <NewShiftForm employerId={employer.id} />
    </div>
  );
}
