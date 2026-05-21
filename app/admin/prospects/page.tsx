import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AddProspectButton from "./add-prospect-button";

const STATUSES = [
  "all",
  "new",
  "contacted",
  "qualified",
  "converted",
  "unresponsive",
  "dead",
] as const;

type Status = (typeof STATUSES)[number];

const STATUS_LABELS: Record<string, string> = {
  new: "Nieuw",
  contacted: "Benaderd",
  qualified: "Gekwalificeerd",
  converted: "Geconverteerd",
  unresponsive: "Geen reactie",
  dead: "Dood",
};

const STATUS_TONE: Record<string, string> = {
  new: "bg-blue-100 text-blue-900",
  contacted: "bg-amber-100 text-amber-900",
  qualified: "bg-lime/30 text-lime-dark",
  converted: "bg-stone-200 text-stone-700",
  unresponsive: "bg-stone-100 text-stone-600",
  dead: "bg-red-100 text-red-900",
};

export default async function AdminProspectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; type?: string }>;
}) {
  const { status, q, type } = await searchParams;
  const activeStatus = (status as Status) ?? "all";
  const activeType = type === "employee" ? "employee" : type === "employer" ? "employer" : "all";
  const search = (q ?? "").trim();

  const supabase = await createClient();

  let query = supabase
    .from("crm_prospects")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(200);

  if (activeStatus !== "all") query = query.eq("status", activeStatus);
  if (activeType !== "all") query = query.eq("type", activeType);
  if (search) {
    query = query.or(
      `company_name.ilike.%${search}%,contact_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data: prospects, count } = await query;

  const { data: stageStats } = await supabase
    .from("crm_prospects")
    .select("status", { head: false });
  const counts = (stageStats ?? []).reduce<Record<string, number>>(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {}
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <span className="eyebrow">— OUTBOUND</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Prospects ({count ?? 0}).
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Leads zonder account. Beheer je outbound funnel hier.
          </p>
        </div>
        <AddProspectButton />
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-3">
        {STATUSES.map((s) => {
          const c = s === "all" ? count ?? 0 : counts[s] ?? 0;
          return (
            <FilterPill
              key={s}
              href={buildHref({ status: s, type: activeType, q: search })}
              active={activeStatus === s}
            >
              {s === "all" ? "Alle" : STATUS_LABELS[s] ?? s} ({c})
            </FilterPill>
          );
        })}
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(["all", "employer", "employee"] as const).map((t) => (
          <FilterPill
            key={t}
            href={buildHref({ status: activeStatus, type: t, q: search })}
            active={activeType === t}
            variant="subtle"
          >
            {t === "all" ? "Beide types" : t === "employer" ? "Werkgevers" : "Werknemers"}
          </FilterPill>
        ))}
      </div>

      {/* Search */}
      <form className="mb-6" action="/admin/prospects">
        {activeStatus !== "all" && (
          <input type="hidden" name="status" value={activeStatus} />
        )}
        {activeType !== "all" && (
          <input type="hidden" name="type" value={activeType} />
        )}
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Zoek op naam, bedrijf, of email…"
          className="w-full max-w-md px-3 py-2 border border-stone-200 rounded-md bg-paper text-sm focus:outline-none focus:border-ink"
        />
      </form>

      {/* Lijst */}
      {!prospects || prospects.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <p className="text-stone-500">
            {search || activeStatus !== "all" || activeType !== "all"
              ? "Geen prospects voor dit filter."
              : "Nog geen prospects toegevoegd. Klik rechtsboven om je eerste lead te loggen."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {prospects.map((p) => (
            <Link
              key={p.id}
              href={`/admin/prospects/${p.id}`}
              className="bg-paper border border-stone-200 rounded-lg p-4 hover:border-ink transition-colors flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-serif text-lg font-medium tracking-tight">
                    {p.company_name || p.contact_name}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      STATUS_TONE[p.status] ?? "bg-stone-100"
                    }`}
                  >
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                  <span className="text-xs bg-stone-100 px-2 py-0.5 rounded">
                    {p.type === "employer" ? "Werkgever" : "Werknemer"}
                  </span>
                </div>
                <div className="text-sm text-stone-600">
                  {p.contact_name && p.company_name ? `${p.contact_name} · ` : ""}
                  {p.email ?? "geen email"} · {p.phone ?? "geen telefoon"}
                </div>
                {p.source && (
                  <div className="text-xs text-stone-400 mt-1">
                    Bron: {p.source}
                  </div>
                )}
              </div>
              <div className="text-xs text-stone-400 text-right">
                Aangemaakt{" "}
                {new Date(p.created_at).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "short",
                })}
                {p.last_contact_at && (
                  <div className="mt-0.5">
                    Laatst contact:{" "}
                    {new Date(p.last_contact_at).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function buildHref(params: { status: string; type: string; q: string }) {
  const usp = new URLSearchParams();
  if (params.status && params.status !== "all") usp.set("status", params.status);
  if (params.type && params.type !== "all") usp.set("type", params.type);
  if (params.q) usp.set("q", params.q);
  const query = usp.toString();
  return query ? `/admin/prospects?${query}` : "/admin/prospects";
}

function FilterPill({
  href,
  active,
  children,
  variant = "default",
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  variant?: "default" | "subtle";
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-ink text-paper"
          : variant === "subtle"
            ? "bg-cream border border-stone-200 hover:border-ink text-stone-600"
            : "bg-paper border border-stone-200 hover:border-ink"
      }`}
    >
      {children}
    </Link>
  );
}
