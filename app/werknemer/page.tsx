import { createClient } from "@/lib/supabase/server";
import { checkEmployeeProfile } from "@/lib/profile-completeness";
import Link from "next/link";

export default async function WerknemerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("first_name, last_name, phone")
    .eq("id", user!.id)
    .single();

  const { data: employee } = await supabase
    .from("employees")
    .select("id, date_of_birth, sectors, avg_rating, total_shifts")
    .eq("user_id", user!.id)
    .single();

  const profileCheck = checkEmployeeProfile({
    user: profile,
    employee: employee
      ? {
          date_of_birth: employee.date_of_birth,
          sectors: (employee.sectors as string[] | null) ?? null,
        }
      : null,
  });
  const profileComplete = profileCheck.complete;

  // Earnings & rating data
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  const [
    { data: monthShifts },
    { data: allPaidPayouts },
    { data: pendingPayouts },
    { data: referralEarnings },
    { count: ratingsCount },
    { count: upcomingShiftsCount },
  ] = await Promise.all([
    supabase
      .from("shifts")
      .select("hours_worked, hourly_rate_cents")
      .eq("assigned_employee_id", employee?.id ?? "00000000-0000-0000-0000-000000000000")
      .eq("status", "completed")
      .gte("ends_at", startOfMonth.toISOString()),
    supabase
      .from("payouts")
      .select("total_cents")
      .eq("employee_id", employee?.id ?? "00000000-0000-0000-0000-000000000000")
      .eq("status", "paid"),
    supabase
      .from("payouts")
      .select("total_cents")
      .eq("employee_id", employee?.id ?? "00000000-0000-0000-0000-000000000000")
      .eq("status", "pending"),
    supabase
      .from("referral_earnings")
      .select("amount_cents")
      .eq("referrer_user_id", user!.id)
      .is("paid_at", null),
    supabase
      .from("ratings")
      .select("*", { count: "exact", head: true })
      .eq("rated_user_id", user!.id),
    supabase
      .from("shifts")
      .select("*", { count: "exact", head: true })
      .eq("assigned_employee_id", employee?.id ?? "00000000-0000-0000-0000-000000000000")
      .in("status", ["confirmed", "in_progress"]),
  ]);

  const earnedThisMonth = (monthShifts ?? []).reduce(
    (s, sh) =>
      s + Math.round((Number(sh.hours_worked) || 0) * (sh.hourly_rate_cents ?? 0)),
    0
  );
  const totalPaid = (allPaidPayouts ?? []).reduce(
    (s, p) => s + (p.total_cents ?? 0),
    0
  );
  const totalPending =
    (pendingPayouts ?? []).reduce((s, p) => s + (p.total_cents ?? 0), 0) +
    (referralEarnings ?? []).reduce((s, r) => s + (r.amount_cents ?? 0), 0);
  const avgRating = Number(employee?.avg_rating ?? 0);

  const greeting = getGreeting();
  const now = new Date().toLocaleString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— LIVE · {now}</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          {greeting}, {profile?.first_name || "daar"}.
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Welkom op je werknemers-dashboard. Vind shifts die bij je passen.
        </p>
      </div>

      {!profileComplete && (
        <div className="bg-lime/20 border border-lime rounded-lg p-6 mb-8">
          <span className="eyebrow text-lime-dark">— ACTIE NODIG</span>
          <h2 className="font-serif text-xl font-medium mt-2 mb-1">
            Vul je profiel aan om te kunnen reageren op shifts.
          </h2>
          <p className="text-sm text-stone-700 mb-4">
            Je kan al rondkijken, maar om op shifts of vacatures te reageren
            moeten we je geboortedatum, sectoren en woonlocatie weten.
          </p>
          <Link
            href="/werknemer/profiel"
            className="inline-block bg-ink text-paper px-4 py-2 rounded-md text-sm font-semibold hover:bg-ink-soft transition-colors"
          >
            Profiel completen →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Aankomende shifts"
          value={String(upcomingShiftsCount ?? 0)}
          dark
        />
        <StatCard
          label="Verdiend deze maand"
          value={`€ ${(earnedThisMonth / 100).toFixed(0)}`}
          sublabel={`Voltooid: ${monthShifts?.length ?? 0} shifts`}
          href="/werknemer/uitbetalingen"
        />
        <StatCard
          label="Totaal verdiend"
          value={`€ ${(totalPaid / 100).toFixed(0)}`}
          sublabel={totalPending > 0 ? `Pending: € ${(totalPending / 100).toFixed(0)}` : "Alle uitbetaald"}
          href="/werknemer/uitbetalingen"
        />
        <StatCard
          label="Rating"
          value={avgRating > 0 ? `${avgRating.toFixed(1)} ★` : "—"}
          sublabel={
            (ratingsCount ?? 0) > 0
              ? `${ratingsCount} ${ratingsCount === 1 ? "rating" : "ratings"}`
              : "Nog geen ratings"
          }
          href="/werknemer/ratings"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-paper border border-stone-200 rounded-lg p-6">
          <h2 className="font-serif text-xl font-medium mb-4">Aanbevolen shifts</h2>
          <div className="text-stone-500 text-sm py-12 text-center">
            {profileComplete
              ? "Nog geen shifts gevonden die bij je passen. Probeer je zoekradius te verbreden."
              : "Vul je profiel aan om aanbevolen shifts te zien."}
          </div>
        </div>
        <div className="bg-paper border border-stone-200 rounded-lg p-6">
          <h2 className="font-serif text-xl font-medium mb-4">Snelle acties</h2>
          <div className="space-y-2">
            <ActionButton href="/werknemer/zoeken" lime>
              Shifts zoeken
            </ActionButton>
            <ActionButton href="/werknemer/vacatures">
              Vacatures bekijken
            </ActionButton>
            <ActionButton href="/werknemer/referrals">
              💸 Verdien via referrals
            </ActionButton>
            <ActionButton href="/werknemer/profiel">
              Profiel bekijken
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  href,
  dark = false,
}: {
  label: string;
  value: string;
  sublabel?: string;
  href?: string;
  dark?: boolean;
}) {
  const inner = (
    <>
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
    </>
  );
  const className = `block p-5 rounded-lg border transition-colors ${
    dark
      ? "bg-ink text-paper border-ink hover:bg-ink-soft"
      : "bg-paper border-stone-200 hover:border-stone-400"
  }`;
  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

function ActionButton({
  href,
  children,
  lime = false,
}: {
  href: string;
  children: React.ReactNode;
  lime?: boolean;
}) {
  return (
    <a
      href={href}
      className={`block w-full px-4 py-2.5 rounded-md text-sm font-medium text-center transition-colors ${
        lime
          ? "bg-lime text-ink hover:bg-lime-dark"
          : "bg-cream border border-stone-200 hover:border-ink"
      }`}
    >
      {children}
    </a>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Goedenacht";
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}
