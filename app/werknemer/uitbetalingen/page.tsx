import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUSES = ["all", "pending", "sent", "paid", "failed"] as const;

const STATUS_LABELS: Record<string, string> = {
  all: "Alle",
  pending: "In behandeling",
  sent: "Verzonden",
  paid: "Uitbetaald",
  failed: "Mislukt",
};

function eur(cents: number | null | undefined) {
  return `€ ${((cents ?? 0) / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function WerknemerUitbetalingenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = (status as (typeof STATUSES)[number]) ?? "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  // IBAN check via users
  const { data: profile } = await supabase
    .from("users")
    .select("iban")
    .eq("id", user!.id)
    .single();

  if (!employee) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <p className="text-stone-700">
            Geen werknemer-profiel gevonden.{" "}
            <Link href="/werknemer/profiel" className="underline">
              Vul je profiel aan
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  let query = supabase
    .from("payouts")
    .select(
      `
      id,
      period_start,
      period_end,
      wage_cents,
      referral_cents,
      match_fee_cents,
      total_cents,
      sepa_batch_id,
      status,
      paid_at,
      created_at
    `,
      { count: "exact" }
    )
    .eq("employee_id", employee.id)
    .order("period_end", { ascending: false })
    .limit(100);

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: payouts, count } = await query;

  // Aggregates
  const { data: allPayouts } = await supabase
    .from("payouts")
    .select("total_cents, status")
    .eq("employee_id", employee.id);

  const sumPaid = (allPayouts ?? [])
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + (p.total_cents ?? 0), 0);
  const sumPending = (allPayouts ?? [])
    .filter((p) => p.status === "pending" || p.status === "sent")
    .reduce((s, p) => s + (p.total_cents ?? 0), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— UITBETALINGEN</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Mijn uitbetalingen ({count ?? 0})
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Wekelijkse uitbetalingen op basis van gewerkte shifts en referrals.
        </p>
      </div>

      {!profile?.iban && (
        <div className="bg-amber-100 border border-amber-300 rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-semibold text-amber-900">
              Geen IBAN in je profiel.
            </div>
            <div className="text-sm text-amber-800">
              Zonder IBAN kunnen we niet uitbetalen.
            </div>
          </div>
          <Link
            href="/werknemer/profiel"
            className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-semibold hover:bg-ink-soft transition-colors"
          >
            IBAN invullen →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Totaal uitbetaald" value={eur(sumPaid)} dark />
        <StatCard label="Nog te ontvangen" value={eur(sumPending)} />
        <StatCard
          label="IBAN"
          value={profile?.iban ?? "—"}
          mono
          alert={!profile?.iban}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              s === "all"
                ? "/werknemer/uitbetalingen"
                : `/werknemer/uitbetalingen?status=${s}`
            }
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeStatus === s
                ? "bg-ink text-paper"
                : "bg-paper border border-stone-200 hover:border-ink"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {!payouts || payouts.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <div className="font-serif text-xl text-stone-700 mb-2">
            {activeStatus === "all"
              ? "Nog geen uitbetalingen"
              : `Geen ${STATUS_LABELS[activeStatus].toLowerCase()} uitbetalingen`}
          </div>
          {activeStatus === "all" && (
            <p className="text-stone-500 text-sm">
              Uitbetalingen verschijnen automatisch na voltooide shifts. Elke
              maandag wordt de week ervoor uitbetaald.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map((p) => (
            <div
              key={p.id}
              className="bg-paper border border-stone-200 rounded-lg p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="eyebrow">
                      {new Date(p.period_start).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "long",
                      })}{" "}
                      –{" "}
                      {new Date(p.period_end).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <StatusPill status={p.status} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm text-stone-700">
                    <Item label="Loon">{eur(p.wage_cents)}</Item>
                    {p.referral_cents != null && p.referral_cents > 0 && (
                      <Item label="Referral">{eur(p.referral_cents)}</Item>
                    )}
                    {p.match_fee_cents != null && p.match_fee_cents > 0 && (
                      <Item label="Match fee">{eur(p.match_fee_cents)}</Item>
                    )}
                  </div>
                  {p.sepa_batch_id && (
                    <div className="text-xs text-stone-500 mt-2 font-mono">
                      SEPA batch: {p.sepa_batch_id}
                    </div>
                  )}
                  {p.paid_at && (
                    <div className="text-xs text-stone-500 mt-1">
                      Betaald op{" "}
                      {new Date(p.paid_at).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-serif text-2xl font-semibold text-lime-dark">
                    {eur(p.total_cents)}
                  </div>
                  <div className="eyebrow mt-1">Totaal</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  dark = false,
  mono = false,
  alert = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
  mono?: boolean;
  alert?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-lg border ${
        dark ? "bg-ink text-paper border-ink" : "bg-paper border-stone-200"
      }`}
    >
      <div className={`eyebrow ${dark ? "text-stone-400" : ""}`}>{label}</div>
      <div
        className={`mt-2 font-medium ${
          mono ? "font-mono text-sm" : "font-serif text-2xl tracking-tight"
        } ${dark ? "text-lime" : alert ? "text-stone-400" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}

function Item({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="text-stone-500">{label}:</span>{" "}
      <span className="font-medium">{children}</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-lime/20 text-lime-dark",
    failed: "bg-red-100 text-red-800",
  };
  const labels: Record<string, string> = {
    pending: "In behandeling",
    sent: "Verzonden",
    paid: "Uitbetaald",
    failed: "Mislukt",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
        styles[status] ?? "bg-stone-100"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
