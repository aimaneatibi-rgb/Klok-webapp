import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ResponseActions from "./response-actions";
import ApproveButton from "./approve-button";
import RateForm from "./rate-form";

export default async function ShiftDetailPage({
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

  const { data: shift } = await supabase
    .from("shifts")
    .select("*")
    .eq("id", id)
    .eq("employer_id", employer.id)
    .single();

  if (!shift) notFound();

  // Reacties met employee + user info
  const { data: responses } = await supabase
    .from("shift_responses")
    .select(
      `
      id,
      message,
      status,
      match_score,
      created_at,
      employees (
        id,
        avg_rating,
        total_shifts,
        sectors,
        users (
          first_name,
          last_name,
          phone
        )
      )
    `
    )
    .eq("shift_id", id)
    .order("created_at", { ascending: true });

  const start = new Date(shift.starts_at);
  const end = new Date(shift.ends_at);
  const hours = (end.getTime() - start.getTime()) / 3_600_000;
  const grossCents = shift.hourly_rate_cents * hours;

  const acceptedResponse = (responses ?? []).find(
    (r) => r.status === "accepted"
  );

  // Voor rating flow: vind user_id + naam van de toegewezen werknemer
  let assignedUserId: string | null = null;
  let assignedName = "de werknemer";
  if (shift.assigned_employee_id) {
    const { data: assignedEmp } = await supabase
      .from("employees")
      .select(
        `
        user_id,
        users ( first_name, last_name )
      `
      )
      .eq("id", shift.assigned_employee_id)
      .single();
    if (assignedEmp) {
      assignedUserId = assignedEmp.user_id;
      const u = Array.isArray(assignedEmp.users)
        ? assignedEmp.users[0]
        : assignedEmp.users;
      assignedName =
        [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
        "de werknemer";
    }
  }

  // Bestaande rating ophalen (max 1 per werkgever+werknemer+shift door UNIQUE constraint)
  let existingRating: {
    stars: number;
    review: string | null;
    created_at: string;
  } | null = null;
  if (assignedUserId) {
    const { data: rating } = await supabase
      .from("ratings")
      .select("stars, review, created_at")
      .eq("shift_id", shift.id)
      .eq("rated_by_user_id", user!.id)
      .eq("rated_user_id", assignedUserId)
      .maybeSingle();
    existingRating = rating;
  }

  const canRate =
    shift.approved_at != null &&
    assignedUserId != null &&
    existingRating == null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        href="/dashboard/shifts"
        className="text-sm text-stone-600 hover:text-ink"
      >
        ← Terug naar shifts
      </Link>

      <div className="mb-6 mt-3 flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">— SHIFT</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            {shift.title}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {start.toLocaleString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            –{" "}
            {end.toLocaleTimeString("nl-NL", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {hours.toFixed(1)} uur
          </p>
        </div>
        <StatusPill status={shift.status} large />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <InfoCard label="Loon">
          <Field label="Uurloon">
            € {(shift.hourly_rate_cents / 100).toFixed(2)}
          </Field>
          <Field label="Bruto totaal">
            € {(grossCents / 100).toFixed(2)}
          </Field>
          <Field label="Platform fee">
            {shift.platform_fee_cents
              ? `€ ${(shift.platform_fee_cents / 100).toFixed(2)}`
              : "—"}
          </Field>
        </InfoCard>

        <InfoCard label="Werk">
          <Field label="Contract type">{shift.contract_partner ?? "—"}</Field>
          <Field label="Contract getekend">
            {shift.contract_signed_at ? (
              <span className="text-lime-dark font-semibold">
                ✓{" "}
                {new Date(shift.contract_signed_at).toLocaleDateString(
                  "nl-NL",
                  { day: "numeric", month: "short" }
                )}
              </span>
            ) : shift.assigned_employee_id ? (
              <span className="text-amber-700">Wacht op werknemer</span>
            ) : (
              "—"
            )}
          </Field>
          <Field label="Dress code">{shift.dress_code ?? "—"}</Field>
          <Field label="Toegewezen">
            {shift.assigned_employee_id ? "Ja" : "Nee"}
          </Field>
          <Field label="Klok in">
            {shift.clock_in_at
              ? new Date(shift.clock_in_at).toLocaleTimeString("nl-NL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </Field>
          <Field label="Klok uit">
            {shift.clock_out_at
              ? new Date(shift.clock_out_at).toLocaleTimeString("nl-NL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </Field>
          <Field label="Uren gewerkt">
            {shift.hours_worked ? `${Number(shift.hours_worked).toFixed(2)}u` : "—"}
          </Field>
        </InfoCard>

        <InfoCard label="Reacties">
          <Field label="Totaal">{responses?.length ?? 0}</Field>
          <Field label="In afwachting">
            {(responses ?? []).filter((r) => r.status === "pending").length}
          </Field>
          <Field label="Geaccepteerd">
            {(responses ?? []).filter((r) => r.status === "accepted").length}
          </Field>
        </InfoCard>
      </div>

      {(() => {
        const mediaUrls = (shift.media_urls as string[] | null) ?? [];
        return mediaUrls.length > 0 ? (
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
                    alt={`Shift foto ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      {shift.description && (
        <div className="bg-paper border border-stone-200 rounded-lg p-5 mb-6">
          <h2 className="eyebrow mb-2">Omschrijving</h2>
          <p className="text-sm text-stone-700 whitespace-pre-wrap">
            {shift.description}
          </p>
        </div>
      )}

      {/* Goedkeuring uren */}
      {shift.status === "completed" &&
        shift.clock_out_at &&
        shift.assigned_employee_id && (
          <div
            className={`rounded-lg p-5 mb-6 border ${
              shift.approved_at
                ? "bg-lime/10 border-lime"
                : "bg-amber-50 border-amber-300"
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-serif text-lg font-medium mb-1">
                  {shift.approved_at ? "Uren goedgekeurd" : "Wacht op goedkeuring"}
                </h2>
                <p className="text-sm text-stone-700">
                  {shift.approved_at
                    ? `Goedgekeurd op ${new Date(
                        shift.approved_at
                      ).toLocaleString("nl-NL", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}. Klaar voor uitbetaling.`
                    : `Werknemer heeft ${Number(shift.hours_worked ?? 0).toFixed(
                        2
                      )} uur ingeklokt. Keur goed om uitbetaling te starten.`}
                </p>
              </div>
              {!shift.approved_at && (
                <ApproveButton
                  shiftId={shift.id}
                  employeeId={shift.assigned_employee_id}
                />
              )}
            </div>
          </div>
        )}

      {/* Rating geven na approval */}
      {canRate && assignedUserId && (
        <RateForm
          shiftId={shift.id}
          ratedUserId={assignedUserId}
          employeeName={assignedName}
        />
      )}

      {existingRating && (
        <div className="bg-lime/10 border border-lime rounded-lg p-5 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <h2 className="font-serif text-lg font-medium mb-1">
                Je hebt {assignedName} beoordeeld
              </h2>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl leading-none">
                  {"★".repeat(existingRating.stars)}
                  <span className="text-stone-300">
                    {"★".repeat(5 - existingRating.stars)}
                  </span>
                </span>
                <span className="text-sm text-stone-600">
                  {existingRating.stars}/5
                </span>
              </div>
              <div className="text-xs text-stone-500 mt-2">
                Gegeven op{" "}
                {new Date(existingRating.created_at).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="text-xs text-stone-500 mt-2 bg-paper rounded p-2 border border-stone-200">
                🔒 Je toelichting is privé. Alleen {assignedName} en hun
                referrer kunnen het lezen.
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="font-serif text-2xl font-medium mb-4">
        Reacties ({responses?.length ?? 0})
      </h2>

      {!responses || responses.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center text-stone-500">
          Nog geen reacties. Werknemers zien je shift in &lsquo;Shifts zoeken&rsquo;.
        </div>
      ) : (
        <div className="space-y-3">
          {responses.map((r) => {
            const emp = Array.isArray(r.employees) ? r.employees[0] : r.employees;
            const u = emp
              ? Array.isArray(emp.users)
                ? emp.users[0]
                : emp.users
              : null;
            const fullName =
              [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
              "Anonieme werknemer";
            const sectors = (emp?.sectors as string[] | null) ?? [];

            return (
              <div
                key={r.id}
                className={`bg-paper border rounded-lg p-5 ${
                  r.status === "accepted"
                    ? "border-lime"
                    : r.status === "rejected"
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
                      <StatusPill status={r.status} />
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
                    {r.message && (
                      <p className="text-sm text-stone-700 mt-2">
                        &ldquo;{r.message}&rdquo;
                      </p>
                    )}
                    <div className="text-xs text-stone-500 mt-2">
                      Reactie ontvangen{" "}
                      {new Date(r.created_at).toLocaleString("nl-NL", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {r.status === "pending" && !acceptedResponse && (
                      <ResponseActions
                        responseId={r.id}
                        shiftId={shift.id}
                        employeeId={emp?.id ?? ""}
                      />
                    )}
                    {r.status === "pending" && acceptedResponse && (
                      <span className="text-xs text-stone-500">
                        Andere reactie geaccepteerd
                      </span>
                    )}
                    {r.status === "accepted" && u?.phone && (
                      <a
                        href={`tel:${u.phone}`}
                        className="text-sm text-ink underline"
                      >
                        Bel: {u.phone}
                      </a>
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
    confirmed: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    completed: "bg-stone-200 text-stone-700",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-red-100 text-red-800",
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
