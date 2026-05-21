import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ApplicationActions from "./application-actions";
import DeleteVacancyModal from "./delete-modal";

export default async function VacancyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  if (!employer) redirect("/dashboard/instellingen");

  const { data: vacancy } = await supabase
    .from("vacancies")
    .select("*")
    .eq("id", id)
    .eq("employer_id", employer.id)
    .single();

  if (!vacancy) notFound();

  const { data: applications } = await supabase
    .from("vacancy_applications")
    .select(
      `
      id,
      cover_letter,
      status,
      match_score,
      created_at,
      employees (
        id,
        avg_rating,
        total_shifts,
        sectors,
        linkedin_url,
        users (
          first_name,
          last_name,
          phone,
          email
        )
      )
    `
    )
    .eq("vacancy_id", id)
    .order("created_at", { ascending: true });

  const perks = (vacancy.perks as string[] | null) ?? [];
  const mediaUrls = (vacancy.media_urls as string[] | null) ?? [];
  const acceptedApplication = (applications ?? []).find(
    (a) => a.status === "accepted"
  );
  const isFilled = vacancy.status === "filled";

  const salaryLabel =
    vacancy.salary_min_cents && vacancy.salary_max_cents
      ? `€ ${(vacancy.salary_min_cents / 100).toFixed(0)} – € ${(vacancy.salary_max_cents / 100).toFixed(0)} per maand`
      : vacancy.salary_max_cents
        ? `tot € ${(vacancy.salary_max_cents / 100).toFixed(0)} per maand`
        : "Op aanvraag";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        href="/dashboard/vacatures"
        className="text-sm text-stone-600 hover:text-ink"
      >
        ← Terug naar vacatures
      </Link>

      <div className="mb-6 mt-3 flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">— VACATURE</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            {vacancy.title}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {vacancy.hours_per_week} uur/week ·{" "}
            {vacancy.contract_months >= 120
              ? "Vast contract"
              : `${vacancy.contract_months} maanden`}{" "}
            · geplaatst{" "}
            {new Date(vacancy.created_at).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-start gap-2 flex-wrap">
          <StatusPill status={vacancy.status} large />
          {vacancy.status !== "archived" && (
            <DeleteVacancyModal
              vacancyId={vacancy.id}
              employerId={employer.id}
              vacancyTitle={vacancy.title}
              createdAt={vacancy.created_at}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <InfoCard label="Voorwaarden">
          <Field label="Salaris">{salaryLabel}</Field>
          <Field label="Uren/week">{vacancy.hours_per_week}</Field>
          <Field label="Contract">
            {vacancy.contract_months >= 120
              ? "Vast"
              : `${vacancy.contract_months} mnd`}
          </Field>
        </InfoCard>

        <InfoCard label="Match fee">
          <Field label="Bij invulling">
            € {(vacancy.match_fee_cents / 100).toFixed(2)}
          </Field>
          <Field label="Status">
            {isFilled ? "Ingevuld ✓" : "Open"}
          </Field>
          {vacancy.filled_at && (
            <Field label="Ingevuld op">
              {new Date(vacancy.filled_at).toLocaleDateString("nl-NL")}
            </Field>
          )}
        </InfoCard>

        <InfoCard label="Sollicitaties">
          <Field label="Totaal">{applications?.length ?? 0}</Field>
          <Field label="In afwachting">
            {(applications ?? []).filter((a) => a.status === "pending").length}
          </Field>
          <Field label="Geaccepteerd">
            {(applications ?? []).filter((a) => a.status === "accepted").length}
          </Field>
        </InfoCard>
      </div>

      {mediaUrls.length > 0 && (
        <div className="mb-4">
          <span className="eyebrow block mb-2">Foto&apos;s ({mediaUrls.length})</span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {mediaUrls.map((url, i) => (
              <div
                key={url}
                className="aspect-square bg-stone-100 rounded-md overflow-hidden border border-stone-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Vacature foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {vacancy.description && (
        <div className="bg-paper border border-stone-200 rounded-lg p-5 mb-4">
          <h2 className="eyebrow mb-2">Omschrijving</h2>
          <p className="text-sm text-stone-700 whitespace-pre-wrap">
            {vacancy.description}
          </p>
        </div>
      )}

      {perks.length > 0 && (
        <div className="bg-paper border border-stone-200 rounded-lg p-5 mb-6">
          <h2 className="eyebrow mb-3">Perks</h2>
          <div className="flex flex-wrap gap-2">
            {perks.map((p) => (
              <span
                key={p}
                className="px-3 py-1 bg-lime/20 text-lime-dark rounded-full text-sm font-medium"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-serif text-2xl font-medium mb-4 mt-8">
        Sollicitaties ({applications?.length ?? 0})
      </h2>

      {!applications || applications.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center text-stone-500">
          Nog geen sollicitaties.
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((a) => {
            const emp = Array.isArray(a.employees)
              ? a.employees[0]
              : a.employees;
            const u = emp
              ? Array.isArray(emp.users)
                ? emp.users[0]
                : emp.users
              : null;
            const fullName =
              [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
              "Anonieme sollicitant";
            const sectors = (emp?.sectors as string[] | null) ?? [];

            return (
              <div
                key={a.id}
                className={`bg-paper border rounded-lg p-5 ${
                  a.status === "accepted"
                    ? "border-lime"
                    : a.status === "rejected"
                      ? "border-stone-200 opacity-60"
                      : "border-stone-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium">{fullName}</span>
                      {Number(emp?.avg_rating) > 0 && (
                        <span className="text-xs text-stone-600">
                          {Number(emp.avg_rating).toFixed(1)} ⭐ ·{" "}
                          {emp?.total_shifts ?? 0} shifts
                        </span>
                      )}
                      {emp?.linkedin_url && (
                        <a
                          href={emp.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-ink underline"
                        >
                          LinkedIn ↗
                        </a>
                      )}
                      <StatusPill status={a.status} />
                    </div>
                    {sectors.length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {sectors.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    {a.cover_letter && (
                      <div className="bg-cream rounded-md p-3 mt-2 text-sm whitespace-pre-wrap">
                        {a.cover_letter}
                      </div>
                    )}
                    <div className="text-xs text-stone-500 mt-2">
                      Gesolliciteerd{" "}
                      {new Date(a.created_at).toLocaleString("nl-NL", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {a.status === "pending" && !isFilled && (
                      <ApplicationActions
                        applicationId={a.id}
                        vacancyId={vacancy.id}
                        employeeId={emp?.id ?? ""}
                      />
                    )}
                    {a.status === "pending" && isFilled && (
                      <span className="text-xs text-stone-500">
                        Vacature al ingevuld
                      </span>
                    )}
                    {a.status === "accepted" && u && (
                      <div className="text-right text-sm space-y-1">
                        {u.phone && (
                          <a
                            href={`tel:${u.phone}`}
                            className="block text-ink underline"
                          >
                            {u.phone}
                          </a>
                        )}
                        {u.email && (
                          <a
                            href={`mailto:${u.email}`}
                            className="block text-ink underline text-xs"
                          >
                            {u.email}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-5">
      <span className="eyebrow">{label}</span>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-right">{children}</span>
    </div>
  );
}

function StatusPill({
  status,
  large = false,
}: {
  status: string;
  large?: boolean;
}) {
  const styles: Record<string, string> = {
    open: "bg-lime/20 text-lime-dark",
    paused: "bg-amber-100 text-amber-800",
    filled: "bg-blue-100 text-blue-800",
    archived: "bg-stone-100 text-stone-600",
    pending: "bg-amber-100 text-amber-800",
    accepted: "bg-lime/20 text-lime-dark",
    rejected: "bg-stone-200 text-stone-500",
  };
  return (
    <span
      className={`rounded font-semibold whitespace-nowrap ${
        large ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"
      } ${styles[status] ?? "bg-stone-100 text-stone-700"}`}
    >
      {status}
    </span>
  );
}
