import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";
import { SECTOR_LABELS, SECTORS } from "@/lib/sectors";

export const metadata: Metadata = {
  title: "Open vacatures — KLOK Works",
  description:
    "Bekijk alle open vacatures en shifts via KLOK Works. Direct solliciteren via je account.",
};

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
  employers: {
    company_name: string;
    sector: string;
  } | { company_name: string; sector: string }[] | null;
};

export default async function PubliekeVacaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>;
}) {
  const { sector: filterSector } = await searchParams;
  const supabase = await createClient();

  // Open vacatures opvragen (RLS-policy `vacancies_public_browse` laat dit toe)
  let query = supabase
    .from("vacancies")
    .select(
      `
      id,
      title,
      description,
      hours_per_week,
      contract_months,
      salary_min_cents,
      salary_max_cents,
      status,
      created_at,
      employers (
        company_name,
        sector
      )
    `
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: vacancies } = await query;

  // Client-side filter op sector (de filter via SQL kan niet over relation)
  const filtered: VacancyRow[] = filterSector
    ? ((vacancies ?? []) as VacancyRow[]).filter((v) => {
        const e = Array.isArray(v.employers) ? v.employers[0] : v.employers;
        return e?.sector === filterSector;
      })
    : ((vacancies ?? []) as VacancyRow[]);

  return (
    <>
      <MarketingNav active="/vacatures" />

      <section
        className="mkt-section"
        style={{ padding: "80px 0 48px", background: "var(--cream)" }}
      >
        <div className="mkt-container">
          <span className="eyebrow">— Alle open vacatures</span>
          <h1
            className="display section-title mt-2"
            style={{ fontSize: "clamp(48px, 8vw, 96px)" }}
          >
            Vind je volgende
            <br />
            <em>werkgever.</em>
          </h1>
          <p className="section-lead mt-3" style={{ maxWidth: "640px" }}>
            Browse alle open vacatures. Maak een gratis account aan om te
            reageren of een persoonlijk profiel op te bouwen.
          </p>

          <div className="flex gap-2 mt-4 flex-wrap">
            <Link href="/signup" className="btn btn-primary btn-large">
              Maak account →
            </Link>
            <Link href="/login" className="btn btn-ghost btn-large">
              Al een account? Inloggen
            </Link>
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ paddingTop: "48px" }}>
        <div className="mkt-container">
          {/* Sector filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            <SectorPill
              href="/vacatures"
              active={!filterSector}
              label="Alle sectoren"
              count={(vacancies ?? []).length}
            />
            {SECTORS.map((s) => {
              const count = ((vacancies ?? []) as VacancyRow[]).filter((v) => {
                const e = Array.isArray(v.employers)
                  ? v.employers[0]
                  : v.employers;
                return e?.sector === s.value;
              }).length;
              if (count === 0) return null;
              return (
                <SectorPill
                  key={s.value}
                  href={`/vacatures?sector=${s.value}`}
                  active={filterSector === s.value}
                  label={s.label}
                  count={count}
                />
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div
              style={{
                background: "var(--paper)",
                border: "1px solid var(--stone-200)",
                padding: "64px 32px",
                textAlign: "center",
              }}
            >
              <div
                className="serif"
                style={{ fontSize: "32px", fontWeight: 500, marginBottom: "8px" }}
              >
                Nog geen vacatures voor dit filter.
              </div>
              <p style={{ color: "var(--stone-500)", fontSize: "15px" }}>
                Werkgevers plaatsen continu nieuwe vacatures. Maak een account
                aan om als eerste melding te krijgen.
              </p>
              <Link
                href="/signup"
                className="btn btn-primary mt-3"
                style={{ marginTop: "24px" }}
              >
                Account aanmaken →
              </Link>
            </div>
          ) : (
            <div className="grid-2" style={{ gap: "16px" }}>
              {filtered.map((v) => {
                const e = Array.isArray(v.employers)
                  ? v.employers[0]
                  : v.employers;
                const sectorLabel = e?.sector
                  ? SECTOR_LABELS[e.sector] ?? e.sector
                  : null;
                const salary = formatSalary(
                  v.salary_min_cents,
                  v.salary_max_cents
                );
                const contractLabel =
                  v.contract_months >= 120
                    ? "Vast contract"
                    : `${v.contract_months} maanden`;

                return (
                  <VacancyCard
                    key={v.id}
                    title={v.title}
                    description={v.description}
                    companyName={e?.company_name ?? "Onbekend bedrijf"}
                    sector={sectorLabel}
                    hoursPerWeek={v.hours_per_week}
                    contractLabel={contractLabel}
                    salary={salary}
                  />
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <div
              style={{ marginTop: "48px", textAlign: "center" }}
            >
              <p
                style={{ color: "var(--stone-500)", fontSize: "14px", marginBottom: "16px" }}
              >
                Klaar om te solliciteren? Maak een gratis account aan.
              </p>
              <Link href="/signup" className="btn btn-primary btn-large">
                Maak account →
              </Link>
            </div>
          )}
        </div>
      </section>

      <section
        className="mkt-section"
        style={{ background: "var(--ink)", color: "var(--paper)" }}
      >
        <div className="mkt-container">
          <div className="grid-2" style={{ gap: "64px", alignItems: "center" }}>
            <div className="reveal">
              <span className="eyebrow lime">— Niet de juiste vacature?</span>
              <h2
                className="section-title mt-2"
                style={{ color: "var(--paper)" }}
              >
                Maak een profiel.
                <br />
                <em style={{ color: "var(--lime)" }}>Werkgevers vinden jou.</em>
              </h2>
              <p
                className="section-lead"
                style={{ color: "var(--stone-300)" }}
              >
                Met een KLOK-account word je gevonden door werkgevers die op
                zoek zijn naar jouw profiel. Plus toegang tot losse shifts.
              </p>
            </div>
            <div className="reveal reveal-delay-1">
              <div
                className="card"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--paper)",
                }}
              >
                <h3
                  className="card-title"
                  style={{ color: "var(--paper)" }}
                >
                  Wat krijg je met een account?
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    fontSize: "14px",
                    lineHeight: 2.1,
                    color: "var(--stone-300)",
                    marginTop: "16px",
                  }}
                >
                  <li>✓ Direct solliciteren op vacatures</li>
                  <li>✓ Toegang tot losse shifts</li>
                  <li>✓ €1/uur referral voor aangebrachte vrienden</li>
                  <li>✓ Profiel waarmee werkgevers jou vinden</li>
                  <li>✓ Loon binnen 4 werkdagen via partner</li>
                </ul>
                <Link
                  href="/signup"
                  className="btn btn-lime btn-large mt-4"
                  style={{ width: "100%" }}
                >
                  Account aanmaken
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}

function formatSalary(
  minCents: number | null,
  maxCents: number | null
): string {
  if (minCents && maxCents)
    return `€ ${(minCents / 100).toFixed(0)} – € ${(maxCents / 100).toFixed(0)} /mnd`;
  if (maxCents) return `tot € ${(maxCents / 100).toFixed(0)} /mnd`;
  if (minCents) return `vanaf € ${(minCents / 100).toFixed(0)} /mnd`;
  return "Op aanvraag";
}

function SectorPill({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "8px 14px",
        background: active ? "var(--ink)" : "var(--paper)",
        color: active ? "var(--paper)" : "var(--ink)",
        border: "1px solid",
        borderColor: active ? "var(--ink)" : "var(--stone-200)",
        fontSize: "13px",
        fontWeight: 500,
        transition: "all 0.2s",
      }}
    >
      {label}{" "}
      <span style={{ opacity: 0.6, fontSize: "11px" }}>({count})</span>
    </Link>
  );
}

function VacancyCard({
  title,
  description,
  companyName,
  sector,
  hoursPerWeek,
  contractLabel,
  salary,
}: {
  title: string;
  description: string | null;
  companyName: string;
  sector: string | null;
  hoursPerWeek: number;
  contractLabel: string;
  salary: string;
}) {
  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div className="flex" style={{ gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <span className="eyebrow">{companyName}</span>
        {sector && <span className="eyebrow lime">· {sector}</span>}
      </div>
      <h3
        className="serif"
        style={{
          fontSize: "26px",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          marginBottom: "4px",
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: "14px",
            color: "var(--stone-700)",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>
      )}
      <div
        className="flex flex-wrap"
        style={{
          gap: "16px",
          fontSize: "13px",
          color: "var(--stone-500)",
          fontFamily: "JetBrains Mono, monospace",
          marginTop: "auto",
          paddingTop: "8px",
        }}
      >
        <span>{hoursPerWeek}u/wk</span>
        <span>{contractLabel}</span>
        <span>{salary}</span>
      </div>
    </div>
  );
}
