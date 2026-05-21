import { createClient } from "@/lib/supabase/server";
import { SECTORS } from "@/lib/sectors";
import PayrollProvidersManager from "./providers-manager";

export type ProviderRow = {
  id: string;
  sector: string;
  provider_name: string;
  provider_legal_name: string | null;
  factoring_rate_bps: number | null;
  contract_url: string | null;
  notes: string | null;
  active: boolean;
};

export default async function AdminPayrollPage() {
  const supabase = await createClient();

  const { data: providers } = await supabase
    .from("sector_payroll_providers")
    .select("*")
    .order("sector", { ascending: true })
    .order("active", { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— ADMIN · PAYROLL INTEGRATIE</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Sector → Payroll partij.
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Wijs per sector de payroll partij toe die shifts via KLOK afhandelt
          (contract + loonadministratie). Werkgevers in die sector krijgen
          automatisch deze partij toegewezen bij elke shift.
        </p>
      </div>

      {/* Uitleg */}
      <div className="bg-cream border border-stone-200 rounded-lg p-5 mb-6 text-sm">
        <h2 className="font-serif text-lg font-medium mb-2">Hoe het werkt</h2>
        <ol className="space-y-1.5 text-stone-700 list-decimal list-inside">
          <li>
            Jij (admin) onderhandelt per sector de beste factoring-deal met
            een payroll partij (bv. Tentoo voor Horeca).
          </li>
          <li>
            Voeg de partij hier toe gekoppeld aan de sector. Eén actieve partij
            per sector tegelijk.
          </li>
          <li>
            Wanneer een werkgever in die sector een shift plaatst, wordt
            automatisch het contract van deze partij gebruikt.
          </li>
          <li>
            Werkgever kan dit niet aanpassen — shifts gaan altijd via de
            platform-gekozen partij. Voor vacatures (vaste banen) kan werkgever
            kiezen tussen platform-payroll of direct eigen contract.
          </li>
        </ol>
      </div>

      <PayrollProvidersManager
        initialProviders={(providers ?? []) as ProviderRow[]}
        sectorOptions={SECTORS.map((s) => ({ value: s.value, label: s.label }))}
      />
    </div>
  );
}
