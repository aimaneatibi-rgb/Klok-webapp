import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/payments";
import { redirect } from "next/navigation";
import BillingMethodSelector from "./billing-method-selector";
import MethodsManager from "./methods-manager";

export type PaymentMethodRow = {
  id: string;
  type: "sepa_dd" | "ideal" | "card" | "bank_transfer";
  provider: string;
  label: string | null;
  iban_last4: string | null;
  card_brand: string | null;
  card_last4: string | null;
  card_exp_month: number | null;
  card_exp_year: number | null;
  status: "pending" | "active" | "expired" | "failed" | "revoked";
  is_default: boolean;
  created_at: string;
};

export default async function BetaalmethodesPage({
  searchParams,
}: {
  searchParams: Promise<{ reden?: string }>;
}) {
  const { reden } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: employer } = await supabase
    .from("employers")
    .select("id, company_name, billing_method, mollie_mandate_status")
    .eq("user_id", user!.id)
    .single();

  if (!employer) redirect("/dashboard/instellingen");

  const { data: methods } = await supabase
    .from("employer_payment_methods")
    .select("*")
    .eq("employer_id", employer.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  const demo = isDemoMode();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <span className="eyebrow">— FINANCIEEL</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Betaalmethodes
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Kies hoe je je maandelijkse vacature-fees betaalt: automatische
          incasso via Mollie, of op factuur met 7 dagen betaaltermijn.
        </p>
      </div>

      {reden === "vacature" && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 text-sm text-amber-900">
          <strong>⚠️ Eerst je betaalmethode regelen.</strong> Om een vacature
          te plaatsen heb je een geverifieerde betaalmethode nodig: kies
          hieronder voor automatische incasso (machtiging via Mollie afronden)
          of op factuur. Je vacature start daarna gewoon met 14 dagen gratis —
          pas op dag 15 incasseren of factureren we.
        </div>
      )}

      <BillingMethodSelector
        current={
          (employer.billing_method as "incasso" | "factuur" | null) ?? null
        }
        mandateStatus={employer.mollie_mandate_status ?? "none"}
        demoMode={demo}
      />

      {demo && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 text-sm">
          <strong className="text-amber-900">🧪 Demo mode</strong>
          <p className="text-amber-900 mt-1">
            Mollie API integratie wordt geactiveerd zodra{" "}
            <code className="bg-amber-100 px-1 rounded text-xs">
              MOLLIE_API_KEY
            </code>{" "}
            in je environment staat. Tot dan kun je in demo mode methodes
            toevoegen om de UI te testen — er gebeurt nog niets in Mollie.
          </p>
        </div>
      )}

      <MethodsManager
        employerId={employer.id}
        companyName={employer.company_name}
        initial={(methods ?? []) as PaymentMethodRow[]}
        demoMode={demo}
      />

      {/* Wat als je later wilt switchen */}
      <div className="bg-cream border border-stone-200 rounded-lg p-5 mt-6">
        <h2 className="font-serif text-lg font-medium mb-3">
          Hoe werkt het straks
        </h2>
        <ul className="space-y-2 text-sm text-stone-700">
          <li>
            <strong>SEPA Auto-Incasso</strong> — eenmalig machtigen via Mollie
            checkout. Daarna debiteert KLOK automatisch elke maand bij vacature
            fees.
          </li>
          <li>
            <strong>iDEAL direct betalen</strong> — geen mandaat nodig. Bij
            elke factuur klik je op &lsquo;Direct betalen&rsquo; voor een
            iDEAL link.
          </li>
          <li>
            <strong>Creditcard</strong> — eenmalig opslaan via Mollie, daarna
            voor losse betalingen of recurring.
          </li>
          <li>
            <strong>Bankoverschrijving</strong> — klassiek, factuur ontvangen
            en zelf overmaken binnen 7 dagen. Geen provider fee.
          </li>
        </ul>
      </div>
    </div>
  );
}
