import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import CrmPanel from "@/components/admin/crm-panel";
import ProspectActions from "./prospect-actions";
import ProspectStatusForm from "./prospect-status-form";

export default async function AdminProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: prospect } = await supabase
    .from("crm_prospects")
    .select("*")
    .eq("id", id)
    .single();

  if (!prospect) notFound();

  // Bekijk of er een geconverteerde employer/employee bestaat — toon dat als
  // "→ Bekijk klant" link
  let convertedLabel: { href: string; label: string } | null = null;
  if (prospect.converted_employer_id) {
    convertedLabel = {
      href: `/admin/klanten/${prospect.converted_employer_id}`,
      label: "→ Bekijk geconverteerd werkgever-account",
    };
  } else if (prospect.converted_employee_id) {
    convertedLabel = {
      href: `/admin/medewerkers/${prospect.converted_employee_id}`,
      label: "→ Bekijk geconverteerd werknemer-account",
    };
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link
        href="/admin/prospects"
        className="text-sm text-stone-600 hover:text-ink"
      >
        ← Terug naar prospects
      </Link>

      <div className="mb-8 mt-3 flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">
            — PROSPECT · {prospect.type === "employer" ? "WERKGEVER" : "WERKNEMER"}
          </span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            {prospect.company_name || prospect.contact_name}
          </h1>
          {prospect.company_name && (
            <p className="text-stone-700 text-sm mt-1">
              Contact: <strong>{prospect.contact_name}</strong>
            </p>
          )}
          <p className="text-stone-500 text-xs mt-1">
            Aangemaakt{" "}
            {new Date(prospect.created_at).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          {convertedLabel && (
            <Link
              href={convertedLabel.href}
              className="text-sm text-lime-dark underline mt-2 inline-block"
            >
              {convertedLabel.label}
            </Link>
          )}
        </div>
      </div>

      {/* Status + acties — vóór de CRM-panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ProspectStatusForm
          prospectId={prospect.id}
          initialStatus={prospect.status}
          initialLastContactAt={prospect.last_contact_at}
        />
        <ProspectActions
          prospectId={prospect.id}
          type={prospect.type}
          email={prospect.email}
          phone={prospect.phone}
          companyName={prospect.company_name}
          contactName={prospect.contact_name}
          alreadyConverted={
            !!(
              prospect.converted_employer_id ||
              prospect.converted_employee_id
            )
          }
        />
      </div>

      {/* CRM panel — notes + activity timeline (prospect heeft geen funnel_stage) */}
      <CrmPanel
        targetType="prospect"
        targetId={prospect.id}
        initialStage="onboarding"
        initialNextAction={null}
        initialNextActionDueAt={null}
        source={prospect.source ?? null}
      />

      {/* Persoongegevens */}
      <div className="bg-paper border border-stone-200 rounded-lg p-5">
        <span className="eyebrow">Contactgegevens</span>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <ReadField label="Email">
            {prospect.email ? (
              <a
                href={`mailto:${prospect.email}`}
                className="underline hover:text-ink"
              >
                {prospect.email}
              </a>
            ) : (
              "—"
            )}
          </ReadField>
          <ReadField label="Telefoon">
            {prospect.phone ? (
              <a
                href={`tel:${prospect.phone}`}
                className="underline hover:text-ink"
              >
                {prospect.phone}
              </a>
            ) : (
              "—"
            )}
          </ReadField>
          <ReadField label="Sector">{prospect.sector ?? "—"}</ReadField>
          <ReadField label="Bron">{prospect.source ?? "—"}</ReadField>
        </div>
        {prospect.notes && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <span className="eyebrow">Notitie bij aanmaak</span>
            <p className="text-sm text-stone-700 mt-2 whitespace-pre-wrap bg-cream rounded p-3">
              {prospect.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-right">{children}</span>
    </div>
  );
}
