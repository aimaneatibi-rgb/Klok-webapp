import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";
import VacaturesBrowser from "@/components/marketing/vacatures-browser";
import { DEMO_VACANCIES, type PublicVacancy } from "@/lib/demo-vacatures";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Vacatures in horeca, zorg, logistiek en bouw",
  description:
    "Doorzoek alle open vacatures op de KLOK-marktplaats: filter op sector, salaris en uren, bewaar favorieten en solliciteer direct bij de werkgever. Gratis voor werkzoekenden.",
  path: "/vacatures",
});

type VacancyRow = {
  id: string;
  title: string;
  description: string | null;
  hours_per_week: number;
  contract_months: number;
  salary_min_cents: number | null;
  salary_max_cents: number | null;
  status: string;
  created_at: string;
  employers:
    | { company_name: string; sector: string }
    | { company_name: string; sector: string }[]
    | null;
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "zojuist";
  if (hours < 24) return `${hours} uur geleden`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "gisteren";
  if (days < 7) return `${days} dagen geleden`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week geleden" : `${weeks} weken geleden`;
}

export default async function PubliekeVacaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plaats?: string; sector?: string }>;
}) {
  const { q, plaats, sector } = await searchParams;
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("vacancies")
    .select(
      `id, title, description, hours_per_week, contract_months,
       salary_min_cents, salary_max_cents, status, created_at,
       employers ( company_name, sector )`
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(200);

  const real: PublicVacancy[] = ((rows ?? []) as VacancyRow[]).map((v) => {
    const e = Array.isArray(v.employers) ? v.employers[0] : v.employers;
    return {
      id: v.id,
      title: v.title,
      description: v.description ?? "",
      companyName: e?.company_name ?? "Onbekend bedrijf",
      sector: e?.sector ?? "horeca",
      city: "Nederland",
      hoursPerWeek: v.hours_per_week,
      contractLabel:
        v.contract_months >= 120 ? "Vast contract" : `${v.contract_months} maanden`,
      salaryMin: v.salary_min_cents ? Math.round(v.salary_min_cents / 100) : null,
      salaryMax: v.salary_max_cents ? Math.round(v.salary_max_cents / 100) : null,
      postedAgo: timeAgo(v.created_at),
      isDemo: false,
    };
  });

  // Lege markt? Toon voorbeeld-vacatures zodat de browser nooit leeg oogt.
  const vacancies = real.length > 0 ? real : DEMO_VACANCIES;
  const initialQuery = [q, plaats].filter(Boolean).join(" ");

  return (
    <>
      <MarketingNav active="/vacatures" />

      <section style={{ padding: "56px 0 40px", background: "var(--cream)" }}>
        <div className="mkt-container">
          <span className="eyebrow pill">
            <span className="live-dot" /> {vacancies.length} open posities
          </span>
          <h1
            className="display mt-2"
            style={{ fontSize: "clamp(40px, 6.5vw, 76px)" }}
          >
            Vind je volgende <em style={{ color: "var(--stone-500)" }}>werkgever.</em>
          </h1>
          <p className="section-lead mt-2" style={{ maxWidth: "600px" }}>
            Zoek, filter en bewaar vacatures op de marktplaats. Reageren doe je
            met één compleet KLOK-profiel — gratis, zonder losse
            sollicitatiebrieven.
          </p>
        </div>
      </section>

      <section style={{ padding: "36px 0 72px" }}>
        <div className="mkt-container">
          <VacaturesBrowser
            vacancies={vacancies}
            initialQuery={initialQuery}
            initialSector={sector ?? ""}
          />
        </div>
      </section>

      <section className="mkt-section" style={{ paddingTop: 0 }}>
        <div className="mkt-container">
          <div className="cta-banner">
            <span className="eyebrow" style={{ color: "var(--ink)" }}>
              — Niet de juiste vacature gevonden?
            </span>
            <h2 className="mt-2">Maak een profiel. Werkgevers vinden jou.</h2>
            <p>
              Met een compleet KLOK-profiel word je gevonden door werkgevers die
              zoeken naar jouw ervaring — en krijg je als eerste toegang tot de
              app en losse shifts.
            </p>
            <div
              className="flex gap-2"
              style={{ justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link href="/signup" className="btn btn-primary btn-large">
                Maak gratis profiel →
              </Link>
              <Link href="/download" className="btn btn-ghost btn-large">
                📱 De KLOK-app komt eraan
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
