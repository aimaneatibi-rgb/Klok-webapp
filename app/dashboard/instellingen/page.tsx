import { createClient } from "@/lib/supabase/server";
import CompanyForm from "./company-form";
import AddressesForm from "./addresses-form";
import ContactsSection from "./contacts-section";

export default async function InstellingenPage({
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
    .select("*")
    .eq("user_id", user!.id)
    .single();

  if (!employer) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <p className="text-stone-700">Geen werkgever-profiel gevonden.</p>
        </div>
      </div>
    );
  }

  const { data: contacts } = await supabase
    .from("employer_contacts")
    .select("*")
    .eq("employer_id", employer.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— BEDRIJFSPROFIEL</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Instellingen
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Beheer je bedrijfsgegevens, adressen en contactpersonen.
        </p>
      </div>

      {reden === "contact" && (
        <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 mb-6">
          <div className="text-sm text-amber-900">
            <strong>📞 Eerst een contactpersoon instellen.</strong> Om shifts of
            vacatures te plaatsen hebben we minimaal één primaire contactpersoon
            nodig — voor facturen, opvolging en communicatie. Voeg hieronder je
            primaire contact toe.
          </div>
        </div>
      )}

      <div className="space-y-6">
        <CompanyForm
          employerId={employer.id}
          initial={{
            company_name: employer.company_name ?? "",
            trade_name: employer.trade_name ?? "",
            legal_name: employer.legal_name ?? "",
            kvk_number: employer.kvk_number ?? "",
            vat_number: employer.vat_number ?? "",
            sector: employer.sector,
            website: employer.website ?? "",
            about: employer.about ?? "",
            established_at: employer.established_at ?? "",
            sbi_codes: (employer.sbi_codes as string[] | null) ?? [],
          }}
        />

        <AddressesForm
          employerId={employer.id}
          initialAddress={(employer.address as Record<string, string> | null) ?? null}
          initialBillingAddress={
            (employer.billing_address as Record<string, string> | null) ?? null
          }
          initialBillingEmail={employer.billing_email ?? ""}
        />

        <ContactsSection
          employerId={employer.id}
          initialContacts={(contacts ?? []) as ContactRow[]}
        />
      </div>
    </div>
  );
}

export type ContactRow = {
  id: string;
  name: string;
  role: string | null;
  email: string;
  phone: string | null;
  is_primary: boolean;
};
