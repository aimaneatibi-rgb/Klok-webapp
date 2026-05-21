import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ReferralShareCard from "./share-card";

function eur(cents: number | null | undefined) {
  return `€ ${((cents ?? 0) / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function ReferralsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("referral_code, first_name")
    .eq("id", user!.id)
    .single();

  // Mensen gerefereerd door deze user
  const { data: referredUsers, count: totalReferred } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, user_type, created_at", {
      count: "exact",
    })
    .eq("referrer_id", user!.id)
    .order("created_at", { ascending: false });

  // Referral verdiensten (al ontvangen + nog te ontvangen)
  const { data: earnings } = await supabase
    .from("referral_earnings")
    .select(
      `
      id,
      amount_cents,
      source_type,
      source_id,
      earned_at,
      paid_at,
      referred_user_id
    `
    )
    .eq("referrer_user_id", user!.id)
    .order("earned_at", { ascending: false });

  const totalEarnedCents = (earnings ?? []).reduce(
    (s, e) => s + (e.amount_cents ?? 0),
    0
  );
  const paidEarnedCents = (earnings ?? [])
    .filter((e) => e.paid_at != null)
    .reduce((s, e) => s + (e.amount_cents ?? 0), 0);
  const pendingEarnedCents = totalEarnedCents - paidEarnedCents;

  // Check welke gerefereerde users al actief zijn (shifts gedaan)
  const referredIds = (referredUsers ?? []).map((r) => r.id);
  const { data: activeEmployees } =
    referredIds.length > 0
      ? await supabase
          .from("employees")
          .select("user_id, total_shifts")
          .in("user_id", referredIds)
          .gt("total_shifts", 0)
      : { data: [] };

  const activeIds = new Set(
    (activeEmployees ?? []).map((e) => e.user_id)
  );
  const activeCount = activeIds.size;

  // Referral URL — gebruikt window.location in client; voor SSR een placeholder die client overschrijft
  const referralCode = profile?.referral_code ?? "";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— REFERRALS</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Verdien mee aan vrienden.
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Deel je link. Per shift die ze doen krijg je <strong>€1 per uur</strong>,
          per vacature die ze invullen <strong>€100</strong> bonus.
        </p>
      </div>

      {/* Share card */}
      <ReferralShareCard
        referralCode={referralCode}
        firstName={profile?.first_name ?? "daar"}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Gerefereerd"
          value={String(totalReferred ?? 0)}
          sublabel="Accounts aangemaakt"
          dark
        />
        <StatCard
          label="Actief"
          value={String(activeCount)}
          sublabel="≥ 1 shift gedaan"
        />
        <StatCard
          label="Verdiend totaal"
          value={eur(totalEarnedCents)}
          sublabel="Inclusief pending"
        />
        <StatCard
          label="Uitbetaald"
          value={eur(paidEarnedCents)}
          sublabel={`Pending: ${eur(pendingEarnedCents)}`}
        />
      </div>

      {/* Twee kolommen: gerefereerde users + earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-paper border border-stone-200 rounded-lg p-6">
          <h2 className="font-serif text-xl font-medium mb-4">
            Wie gebruikt je link ({totalReferred ?? 0})
          </h2>
          {!referredUsers || referredUsers.length === 0 ? (
            <div className="text-sm text-stone-500 py-6 text-center">
              Nog niemand. Deel je link om je eerste referral binnen te halen.
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {referredUsers.map((r) => {
                const name =
                  [r.first_name, r.last_name].filter(Boolean).join(" ") ||
                  r.email.split("@")[0];
                const isActive = activeIds.has(r.id);
                return (
                  <li
                    key={r.id}
                    className="py-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{name}</div>
                      <div className="text-xs text-stone-500">
                        {r.user_type === "employer" ? "Werkgever" : "Werknemer"}{" "}
                        · sinds{" "}
                        {new Date(r.created_at).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge active={isActive} />
                      {r.user_type === "employee" && (
                        <Link
                          href={`/werknemer/referrals/${r.id}`}
                          className="text-xs text-ink underline hover:text-lime-dark whitespace-nowrap"
                        >
                          Bekijk ratings →
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-paper border border-stone-200 rounded-lg p-6">
          <h2 className="font-serif text-xl font-medium mb-4">
            Verdiensten ({earnings?.length ?? 0})
          </h2>
          {!earnings || earnings.length === 0 ? (
            <div className="text-sm text-stone-500 py-6 text-center">
              Nog geen verdiensten. Je krijgt €1/u per gewerkte uur van je
              referrals, en €100 per ingevulde vacature.
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {earnings.map((e) => (
                <li
                  key={e.id}
                  className="py-3 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">
                      {e.source_type === "shift"
                        ? "Shift bonus"
                        : "Vacature bonus"}
                    </div>
                    <div className="text-xs text-stone-500">
                      {new Date(e.earned_at).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lime-dark">
                      {eur(e.amount_cents)}
                    </div>
                    <div className="text-xs text-stone-500">
                      {e.paid_at ? "✓ Uitbetaald" : "Pending"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {(earnings?.length ?? 0) > 0 && (
            <Link
              href="/werknemer/uitbetalingen"
              className="block text-center text-sm text-ink underline mt-3 pt-3 border-t border-stone-100"
            >
              Naar uitbetalingen →
            </Link>
          )}
        </div>
      </div>

      {/* Hoe werkt het */}
      <div className="bg-cream border border-stone-200 rounded-lg p-6 mt-6">
        <h2 className="font-serif text-xl font-medium mb-3">Hoe werkt het?</h2>
        <ol className="space-y-2 text-sm text-stone-700 list-decimal list-inside">
          <li>
            Deel je persoonlijke link via WhatsApp, mail of social media.
          </li>
          <li>
            Wanneer iemand zich aanmeldt via jouw link, koppelen we hen aan jou.
          </li>
          <li>
            Voor elke shift die ze werken via KLOK krijg je <strong>€1/uur</strong>.
          </li>
          <li>
            Voor elke vacature die ingevuld wordt via jouw referral krijg je{" "}
            <strong>€100 bonus</strong>.
          </li>
          <li>
            Verdiensten worden wekelijks uitbetaald, samen met je gewone payouts.
          </li>
        </ol>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  dark = false,
}: {
  label: string;
  value: string;
  sublabel?: string;
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
        className={`font-serif text-2xl font-medium tracking-tight mt-2 ${
          dark ? "text-lime" : "text-ink"
        }`}
      >
        {value}
      </div>
      {sublabel && (
        <div
          className={`text-xs mt-1 ${dark ? "text-stone-400" : "text-stone-500"}`}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded font-semibold whitespace-nowrap ${
        active ? "bg-lime/20 text-lime-dark" : "bg-stone-100 text-stone-600"
      }`}
    >
      {active ? "✓ Actief" : "Account"}
    </span>
  );
}
