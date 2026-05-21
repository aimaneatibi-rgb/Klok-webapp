import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generateCoopAgreement } from "@/lib/coop-agreement";
import { COOP_AGREEMENT_VERSION } from "@/lib/pricing";
import Link from "next/link";
import SignAgreementForm from "./sign-form";

export default async function OvereenkomstPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: employer } = await supabase
    .from("employers")
    .select(
      "id, company_name, legal_name, kvk_number, vat_number, address, coop_agreement_signed_at, coop_agreement_version"
    )
    .eq("user_id", user!.id)
    .single();

  if (!employer) redirect("/dashboard/instellingen");

  const isSigned = !!employer.coop_agreement_signed_at;

  const agreement = generateCoopAgreement({
    opdrachtgever: {
      company_name: employer.company_name,
      legal_name: employer.legal_name,
      kvk_number: employer.kvk_number,
      vat_number: employer.vat_number,
      address: employer.address as Record<string, string> | null,
    },
    signedAt: employer.coop_agreement_signed_at ?? undefined,
    version: COOP_AGREEMENT_VERSION,
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href="/dashboard"
        className="text-sm text-stone-600 hover:text-ink"
      >
        ← Terug naar dashboard
      </Link>

      <div className="mt-3 mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">— OVEREENKOMST</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Samenwerkingsovereenkomst
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Versie {COOP_AGREEMENT_VERSION} ·{" "}
            {isSigned ? (
              <span className="text-lime-dark font-semibold">
                ✓ Ondertekend op{" "}
                {new Date(
                  employer.coop_agreement_signed_at!
                ).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            ) : (
              <span className="text-amber-700">Nog niet ondertekend</span>
            )}
          </p>
        </div>
      </div>

      {/* Contract body */}
      <div className="bg-paper border border-stone-200 rounded-lg overflow-hidden mb-6">
        <div className="bg-cream px-6 py-3 border-b border-stone-200">
          <h2 className="font-serif text-xl font-medium">{agreement.title}</h2>
        </div>
        <div className="p-6 max-h-[600px] overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-xs text-stone-700 leading-relaxed">
            {agreement.body}
          </pre>
        </div>
      </div>

      {/* Sign form */}
      {!isSigned ? (
        <SignAgreementForm
          employerId={employer.id}
          version={COOP_AGREEMENT_VERSION}
        />
      ) : (
        <div className="bg-lime/10 border border-lime rounded-lg p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-semibold text-ink">
              ✓ Je hebt deze versie van de overeenkomst ondertekend.
            </div>
            <div className="text-sm text-stone-700 mt-0.5">
              Bij wijziging van de overeenkomst ontvang je 30 dagen van tevoren
              een melding.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
