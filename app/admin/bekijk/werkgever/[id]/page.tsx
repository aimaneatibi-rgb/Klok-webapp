import { createClient } from "@/lib/supabase/server";
import { SECTOR_LABELS } from "@/lib/sectors";
import Link from "next/link";
import { notFound } from "next/navigation";

function eur(cents: number | null | undefined) {
  return `€ ${((cents ?? 0) / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default async function PreviewWerkgeverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: employer } = await supabase
    .from("employers")
    .select("id, company_name, sector")
    .eq("id", id)
    .single();

  if (!employer) notFound();

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    { count: shiftsTodayCount },
    { count: openVacanciesCount },
    { data: monthShifts },
    { data: recentShifts },
  ] = await Promise.all([
    supabase
      .from("shifts")
      .select("*", { count: "exact", head: true })
      .eq("employer_id", id)
      .gte("starts_at", startOfDay.toISOString())
      .lte("starts_at", endOfDay.toISOString()),
    supabase
      .from("vacancies")
      .select("*", { count: "exact", head: true })
      .eq("employer_id", id)
      .eq("status", "open"),
    supabase
      .from("shifts")
      .select("hours_worked, hourly_rate_cents, platform_fee_cents, status")
      .eq("employer_id", id)
      .eq("status", "completed")
      .gte("ends_at", startOfMonth.toISOString()),
    supabase
      .from("shifts")
      .select(
        `
        id, title, starts_at, status, hourly_rate_cents,
        shift_responses (id)
      `
      )
      .eq("employer_id", id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const hoursThisMonth = (monthShifts ?? []).reduce(
    (s, sh) => s + Number(sh.hours_worked ?? 0),
    0
  );
  const platformCostsThisMonth = (monthShifts ?? []).reduce(
    (s, sh) => s + (sh.platform_fee_cents ?? 0),
    0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Preview banner */}
      <div className="bg-ink text-paper rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="eyebrow lime">— ADMIN PREVIEW MODE</span>
          <div className="text-sm mt-1">
            Je kijkt naar het werkgever-dashboard van{" "}
            <strong>{employer.company_name}</strong>. Acties zijn uitgeschakeld.
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/klanten/${employer.id}`}
            className="bg-paper text-ink px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-stone-200 transition-colors"
          >
            Klant details
          </Link>
          <Link
            href="/admin/klanten"
            className="bg-stone-700 text-paper px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-stone-600 transition-colors"
          >
            ← Terug naar admin
          </Link>
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-8">
        <span className="eyebrow">— OVERZICHT</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Hoi, {employer.company_name}.
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {SECTOR_LABELS[employer.sector] ?? employer.sector} · Wat staat er
          vandaag op de planning?
        </p>
      </div>

      {/* Stats grid — zoals werkgever ziet */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Shifts vandaag"
          value={String(shiftsTodayCount ?? 0)}
          dark
        />
        <StatCard
          label="Open vacatures"
          value={String(openVacanciesCount ?? 0)}
        />
        <StatCard
          label="Uren deze maand"
          value={hoursThisMonth.toFixed(0)}
        />
        <StatCard
          label="KLOK kosten MTD"
          value={eur(platformCostsThisMonth)}
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-paper border border-stone-200 rounded-lg p-6">
          <h2 className="font-serif text-xl font-medium mb-4">
            Recente shifts
          </h2>
          {!recentShifts || recentShifts.length === 0 ? (
            <div className="text-stone-500 text-sm py-8 text-center">
              Geen shifts geplaatst.
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recentShifts.map((s) => {
                const responses = Array.isArray(s.shift_responses)
                  ? s.shift_responses.length
                  : 0;
                return (
                  <li
                    key={s.id}
                    className="py-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{s.title}</div>
                      <div className="text-xs text-stone-500">
                        {new Date(s.starts_at).toLocaleString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · € {(s.hourly_rate_cents / 100).toFixed(2)}/u
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {responses > 0 && (
                        <span className="bg-lime/20 text-lime-dark px-2 py-0.5 rounded text-xs font-semibold">
                          {responses} reactie{responses !== 1 ? "s" : ""}
                        </span>
                      )}
                      <StatusPill status={s.status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-paper border border-stone-200 rounded-lg p-6">
          <h2 className="font-serif text-xl font-medium mb-4">Snelle acties</h2>
          <p className="text-xs text-stone-500 mb-3">
            Deze knoppen zijn zichtbaar voor de werkgever maar uitgeschakeld in
            preview.
          </p>
          <div className="space-y-2">
            <DisabledAction>+ Plaats nieuwe shift</DisabledAction>
            <DisabledAction>+ Plaats vacature</DisabledAction>
            <DisabledAction>Bedrijfsprofiel completen</DisabledAction>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-lg border ${
        dark ? "bg-ink text-paper border-ink" : "bg-paper border-stone-200"
      }`}
    >
      <div className={`eyebrow ${dark ? "text-stone-400" : ""}`}>{label}</div>
      <div
        className={`font-serif text-3xl font-medium tracking-tight mt-2 ${
          dark ? "text-lime" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function DisabledAction({ children }: { children: React.ReactNode }) {
  return (
    <div className="block w-full px-4 py-2.5 rounded-md text-sm font-medium text-center bg-stone-100 text-stone-400 cursor-not-allowed">
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-lime/20 text-lime-dark",
    confirmed: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    completed: "bg-stone-200 text-stone-700",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
        styles[status] ?? "bg-stone-100"
      }`}
    >
      {status}
    </span>
  );
}
