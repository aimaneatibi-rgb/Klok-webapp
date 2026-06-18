import { createClient } from "@/lib/supabase/server";
import { SECTOR_LABELS } from "@/lib/sectors";
import Link from "next/link";

// === KPI Targets ===
const TARGET_MRR_FIRST = 1_500_000; // €15.000 in cents
const TARGET_MRR_MID = 10_000_000; // €100.000 in cents
const TARGET_MRR_LONG = 100_000_000; // €1.000.000 in cents

// === Forecast scenarios (maandelijkse groei %) ===
const SCENARIOS = [
  {
    label: "Conservatief",
    monthly: 0.05,
    barClass: "bg-stone-400",
    textClass: "text-stone-700",
  },
  {
    label: "Realistisch",
    monthly: 0.15,
    barClass: "bg-lime",
    textClass: "text-lime-dark",
  },
  {
    label: "Agressief",
    monthly: 0.3,
    barClass: "bg-ink",
    textClass: "text-ink",
  },
];

// === Kosten schattingen ===
const FIXED_COSTS_CENTS = 14_500; // €145/m — Supabase + Vercel + domain + tooling
const VARIABLE_COST_RATE = 0.005; // 0,5% van MRR → Mollie/Stripe fees

function monthsToTarget(
  current: number,
  target: number,
  growth: number
): number | null {
  if (current >= target) return 0;
  if (growth <= 0) return null;
  const months = Math.log(target / current) / Math.log(1 + growth);
  if (months > 240) return null; // >20 jaar = onhaalbaar
  return Math.ceil(months);
}

function monthsLabel(m: number | null): string {
  if (m == null) return "—";
  if (m === 0) return "Behaald";
  if (m < 12) return `${m} mnd`;
  const years = Math.floor(m / 12);
  const remM = m % 12;
  return remM === 0 ? `${years}j` : `${years}j ${remM}m`;
}

function eur(cents: number): string {
  return `€ ${(cents / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function eurShort(cents: number): string {
  if (cents >= 100_000_000) return `€${(cents / 100_000_000).toFixed(1)}M`;
  if (cents >= 100_000) return `€${(cents / 100_000).toFixed(0)}k`;
  return `€${Math.round(cents / 100)}`;
}

function pct(n: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

function trend(current: number, previous: number): {
  text: string;
  positive: boolean;
} {
  if (previous === 0)
    return { text: current > 0 ? "Nieuw" : "—", positive: current > 0 };
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? "+" : "";
  return {
    text: `${sign}${delta.toFixed(0)}%`,
    positive: delta >= 0,
  };
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mrt",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dec",
];

export default async function KpiDashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // ============ DATA FETCHES ============
  const [
    // MRR sources
    { data: activeVacancies },
    { data: completed30d },
    { data: completedPrev30d },
    { data: filledVacanciesSixMonths },
    { data: referralPaidThisMonth },
    // Customer counts
    { count: totalEmployers },
    { count: totalEmployees },
    { count: employersThisMonth },
    { count: employersPrevMonth },
    { count: employeesThisMonth },
    { count: employeesPrevMonth },
    { count: employersThisWeek },
    { count: employeesThisWeek },
    // Activation
    { count: employersSigned },
    { count: employeesWithProfile },
    { count: employersWithActivity },
    { count: employeesWithReaction },
    { count: employeesWithCompletedShift },
    // Activity
    { count: shiftsPosted30d },
    { count: shiftsCompleted30d },
    { count: vacanciesPosted30d },
    { count: vacanciesFilled30d },
    // Sector breakdown
    { data: employersBySector },
  ] = await Promise.all([
    supabase
      .from("vacancies")
      .select("monthly_fee_cents, employer_id, employers(sector)")
      .in("status", ["open", "paused"]),
    supabase
      .from("shifts")
      .select("platform_fee_cents, ends_at")
      .eq("status", "completed")
      .gte("ends_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("shifts")
      .select("platform_fee_cents")
      .eq("status", "completed")
      .gte("ends_at", new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lt("ends_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("vacancies")
      .select("match_fee_cents, filled_at")
      .eq("status", "filled")
      .gte("filled_at", sixMonthsAgo.toISOString()),
    supabase
      .from("referral_earnings")
      .select("amount_cents")
      .gte("paid_at", startOfMonth.toISOString()),
    supabase.from("employers").select("*", { count: "exact", head: true }),
    supabase.from("employees").select("*", { count: "exact", head: true }),
    supabase
      .from("employers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("employers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfPrevMonth.toISOString())
      .lt("created_at", startOfMonth.toISOString()),
    supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfPrevMonth.toISOString())
      .lt("created_at", startOfMonth.toISOString()),
    supabase
      .from("employers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString()),
    supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString()),
    supabase
      .from("employers")
      .select("*", { count: "exact", head: true })
      .not("coop_agreement_signed_at", "is", null),
    supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .not("date_of_birth", "is", null),
    // Placeholder — we computeren employersWithActivity in JS via set union
    Promise.resolve({ count: 0 as number | null }),
    supabase
      .from("shift_responses")
      .select("employee_id", { count: "exact", head: true }),
    supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .gt("total_shifts", 0),
    supabase
      .from("shifts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("shifts")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("ends_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("vacancies")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("vacancies")
      .select("*", { count: "exact", head: true })
      .eq("status", "filled")
      .gte("filled_at", thirtyDaysAgo.toISOString()),
    supabase.from("employers").select("sector"),
  ]);

  // Employers met activiteit (≥1 shift of vacature) — set union in JS
  // Plus extra data voor period comparisons, top klanten, records
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [
    { data: empsWithVac },
    { data: empsWithShifts },
    { data: employersRecent60 },
    { data: employeesRecent60 },
    { data: shiftsRecent90 },
    { data: vacanciesRecent60 },
    { data: allEmployerMeta },
    { data: shiftsRevenueRecent },
    { data: highestShift },
  ] = await Promise.all([
    supabase.from("vacancies").select("employer_id"),
    supabase.from("shifts").select("employer_id"),
    supabase
      .from("employers")
      .select("id, created_at, company_name")
      .gte("created_at", sixtyDaysAgo.toISOString()),
    supabase
      .from("employees")
      .select("id, created_at")
      .gte("created_at", sixtyDaysAgo.toISOString()),
    supabase
      .from("shifts")
      .select(
        "id, employer_id, created_at, ends_at, status, platform_fee_cents, hourly_rate_cents, hours_worked"
      )
      .gte("created_at", ninetyDaysAgo.toISOString()),
    supabase
      .from("vacancies")
      .select("id, employer_id, created_at, status")
      .gte("created_at", sixtyDaysAgo.toISOString()),
    supabase.from("employers").select("id, company_name, sector"),
    supabase
      .from("shifts")
      .select("employer_id, platform_fee_cents")
      .eq("status", "completed")
      .gte("ends_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("shifts")
      .select("id, platform_fee_cents, title, ends_at")
      .eq("status", "completed")
      .order("platform_fee_cents", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const activeEmployerIds = new Set<string>([
    ...(empsWithVac ?? []).map((v) => v.employer_id),
    ...(empsWithShifts ?? []).map((s) => s.employer_id),
  ]);
  const employersWithActivityComputed = activeEmployerIds.size;

  // === Periode vergelijkingen ===
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgoStart = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgoStart = new Date(startOfToday.getTime() - 14 * 24 * 60 * 60 * 1000);

  function inRange<T extends { created_at: string }>(
    items: T[],
    field: "created_at",
    startDate: Date,
    endDate: Date
  ): T[] {
    return items.filter((i) => {
      const t = new Date(i[field]).getTime();
      return t >= startDate.getTime() && t < endDate.getTime();
    });
  }
  function inRangeBy<T>(
    items: T[],
    accessor: (item: T) => string | null,
    startDate: Date,
    endDate: Date
  ): T[] {
    return items.filter((i) => {
      const v = accessor(i);
      if (!v) return false;
      const t = new Date(v).getTime();
      return t >= startDate.getTime() && t < endDate.getTime();
    });
  }

  const periodMetrics = {
    employers: {
      today: inRange(employersRecent60 ?? [], "created_at", startOfToday, new Date()).length,
      yesterday: inRange(employersRecent60 ?? [], "created_at", startOfYesterday, startOfToday).length,
      thisWeek: inRange(employersRecent60 ?? [], "created_at", sevenDaysAgoStart, new Date()).length,
      lastWeek: inRange(employersRecent60 ?? [], "created_at", fourteenDaysAgoStart, sevenDaysAgoStart).length,
      thisMonth: employersThisMonth ?? 0,
      lastMonth: employersPrevMonth ?? 0,
    },
    employees: {
      today: inRange(employeesRecent60 ?? [], "created_at", startOfToday, new Date()).length,
      yesterday: inRange(employeesRecent60 ?? [], "created_at", startOfYesterday, startOfToday).length,
      thisWeek: inRange(employeesRecent60 ?? [], "created_at", sevenDaysAgoStart, new Date()).length,
      lastWeek: inRange(employeesRecent60 ?? [], "created_at", fourteenDaysAgoStart, sevenDaysAgoStart).length,
      thisMonth: employeesThisMonth ?? 0,
      lastMonth: employeesPrevMonth ?? 0,
    },
    shifts: {
      today: inRange(shiftsRecent90 ?? [], "created_at", startOfToday, new Date()).length,
      yesterday: inRange(shiftsRecent90 ?? [], "created_at", startOfYesterday, startOfToday).length,
      thisWeek: inRange(shiftsRecent90 ?? [], "created_at", sevenDaysAgoStart, new Date()).length,
      lastWeek: inRange(shiftsRecent90 ?? [], "created_at", fourteenDaysAgoStart, sevenDaysAgoStart).length,
      thisMonth: inRange(shiftsRecent90 ?? [], "created_at", startOfMonth, new Date()).length,
      lastMonth: inRange(shiftsRecent90 ?? [], "created_at", startOfPrevMonth, startOfMonth).length,
    },
    vacancies: {
      today: inRange(vacanciesRecent60 ?? [], "created_at", startOfToday, new Date()).length,
      yesterday: inRange(vacanciesRecent60 ?? [], "created_at", startOfYesterday, startOfToday).length,
      thisWeek: inRange(vacanciesRecent60 ?? [], "created_at", sevenDaysAgoStart, new Date()).length,
      lastWeek: inRange(vacanciesRecent60 ?? [], "created_at", fourteenDaysAgoStart, sevenDaysAgoStart).length,
      thisMonth: inRange(vacanciesRecent60 ?? [], "created_at", startOfMonth, new Date()).length,
      lastMonth: inRange(vacanciesRecent60 ?? [], "created_at", startOfPrevMonth, startOfMonth).length,
    },
    revenue: {
      today: inRangeBy(
        (shiftsRecent90 ?? []).filter((s) => s.status === "completed"),
        (s) => s.ends_at,
        startOfToday,
        new Date()
      ).reduce((sum, s) => sum + (s.platform_fee_cents ?? 0), 0),
      yesterday: inRangeBy(
        (shiftsRecent90 ?? []).filter((s) => s.status === "completed"),
        (s) => s.ends_at,
        startOfYesterday,
        startOfToday
      ).reduce((sum, s) => sum + (s.platform_fee_cents ?? 0), 0),
      thisWeek: inRangeBy(
        (shiftsRecent90 ?? []).filter((s) => s.status === "completed"),
        (s) => s.ends_at,
        sevenDaysAgoStart,
        new Date()
      ).reduce((sum, s) => sum + (s.platform_fee_cents ?? 0), 0),
      lastWeek: inRangeBy(
        (shiftsRecent90 ?? []).filter((s) => s.status === "completed"),
        (s) => s.ends_at,
        fourteenDaysAgoStart,
        sevenDaysAgoStart
      ).reduce((sum, s) => sum + (s.platform_fee_cents ?? 0), 0),
      thisMonth: inRangeBy(
        (shiftsRecent90 ?? []).filter((s) => s.status === "completed"),
        (s) => s.ends_at,
        startOfMonth,
        new Date()
      ).reduce((sum, s) => sum + (s.platform_fee_cents ?? 0), 0),
      lastMonth: inRangeBy(
        (shiftsRecent90 ?? []).filter((s) => s.status === "completed"),
        (s) => s.ends_at,
        startOfPrevMonth,
        startOfMonth
      ).reduce((sum, s) => sum + (s.platform_fee_cents ?? 0), 0),
    },
  };

  // === Top 10 klanten ===
  const employerStats = new Map<
    string,
    { name: string; sector: string; vacatureMrr: number; shiftMrr30d: number }
  >();
  for (const e of allEmployerMeta ?? []) {
    employerStats.set(e.id, {
      name: e.company_name,
      sector: e.sector,
      vacatureMrr: 0,
      shiftMrr30d: 0,
    });
  }
  for (const v of activeVacancies ?? []) {
    const e = employerStats.get(v.employer_id);
    if (e) e.vacatureMrr += v.monthly_fee_cents ?? 19500;
  }
  for (const s of shiftsRevenueRecent ?? []) {
    const e = employerStats.get(s.employer_id);
    if (e) e.shiftMrr30d += s.platform_fee_cents ?? 0;
  }
  const topKlanten = Array.from(employerStats.entries())
    .map(([id, v]) => ({
      id,
      ...v,
      total: v.vacatureMrr + v.shiftMrr30d,
    }))
    .filter((e) => e.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // === Records ===
  const empSignupsByDay = new Map<string, number>();
  for (const e of employersRecent60 ?? []) {
    const day = new Date(e.created_at).toISOString().slice(0, 10);
    empSignupsByDay.set(day, (empSignupsByDay.get(day) ?? 0) + 1);
  }
  const bestEmpDay = [...empSignupsByDay.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];

  const empeSignupsByDay = new Map<string, number>();
  for (const e of employeesRecent60 ?? []) {
    const day = new Date(e.created_at).toISOString().slice(0, 10);
    empeSignupsByDay.set(day, (empeSignupsByDay.get(day) ?? 0) + 1);
  }
  const bestEmpeDay = [...empeSignupsByDay.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];

  const revenueByDay = new Map<string, number>();
  for (const s of (shiftsRecent90 ?? []).filter(
    (sh) => sh.status === "completed" && sh.ends_at
  )) {
    const day = new Date(s.ends_at!).toISOString().slice(0, 10);
    revenueByDay.set(
      day,
      (revenueByDay.get(day) ?? 0) + (s.platform_fee_cents ?? 0)
    );
  }
  const bestRevDay = [...revenueByDay.entries()].sort((a, b) => b[1] - a[1])[0];

  // ============ COMPUTATIONS ============

  // MRR vacatures (recurring monthly fees)
  const mrrVacatures = (activeVacancies ?? []).reduce(
    (s, v) => s + (v.monthly_fee_cents ?? 19500),
    0
  );

  // MRR shifts (last 30d platform fees, approximated as monthly run rate)
  const mrrShifts = (completed30d ?? []).reduce(
    (s, sh) => s + (sh.platform_fee_cents ?? 0),
    0
  );
  const mrrShiftsPrev = (completedPrev30d ?? []).reduce(
    (s, sh) => s + (sh.platform_fee_cents ?? 0),
    0
  );

  // Referral payouts (deducted from net MRR)
  const referralOutgoing = (referralPaidThisMonth ?? []).reduce(
    (s, r) => s + (r.amount_cents ?? 0),
    0
  );

  const totalMrr = mrrVacatures + mrrShifts;
  const netMrr = totalMrr - referralOutgoing;

  // === Forecasts (na MRR berekening) ===
  const realisticGrowth =
    mrrShiftsPrev > 0
      ? Math.max(0, (mrrShifts - mrrShiftsPrev) / mrrShiftsPrev)
      : 0.15;
  const dynamicScenarios = SCENARIOS.map((s) =>
    s.label === "Realistisch"
      ? { ...s, monthly: Math.max(realisticGrowth, 0.05) }
      : s
  );

  // === Kosten ===
  const variableCosts = Math.round(totalMrr * VARIABLE_COST_RATE);
  const totalCosts = FIXED_COSTS_CENTS + variableCosts;
  const netProfit = netMrr - totalCosts;
  const grossMargin =
    totalMrr > 0 ? ((totalMrr - totalCosts) / totalMrr) * 100 : 0;

  // Progress percentages
  const progressFirst = Math.min(100, (totalMrr / TARGET_MRR_FIRST) * 100);
  const progressLong = Math.min(100, (totalMrr / TARGET_MRR_LONG) * 100);
  const mrrToFirstTarget = Math.max(0, TARGET_MRR_FIRST - totalMrr);

  // Months to €15K at current growth
  const shiftsMomGrowth = trend(mrrShifts, mrrShiftsPrev);
  const shiftsGrowthPct =
    mrrShiftsPrev > 0 ? (mrrShifts - mrrShiftsPrev) / mrrShiftsPrev : 0;

  let estimatedMonthsToFirst: number | null = null;
  if (totalMrr < TARGET_MRR_FIRST && shiftsGrowthPct > 0.01) {
    let projected = totalMrr;
    let months = 0;
    while (projected < TARGET_MRR_FIRST && months < 36) {
      projected = projected * (1 + shiftsGrowthPct);
      months++;
    }
    estimatedMonthsToFirst = months === 36 ? null : months;
  }

  // Trend computations
  const employerTrend = trend(employersThisMonth ?? 0, employersPrevMonth ?? 0);
  const employeeTrend = trend(employeesThisMonth ?? 0, employeesPrevMonth ?? 0);

  // 6-month chart data
  const monthly: Record<string, { shifts: number; vacancies: number }> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthly[`${d.getFullYear()}-${d.getMonth()}`] = { shifts: 0, vacancies: 0 };
  }
  for (const sh of completed30d ?? []) {
    if (!sh.ends_at) continue;
    const d = new Date(sh.ends_at);
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthly[k]) monthly[k].shifts += sh.platform_fee_cents ?? 0;
  }
  // Re-fetch shifts over 6 months for the chart (the 30d query was too narrow)
  const { data: shifts6mo } = await supabase
    .from("shifts")
    .select("platform_fee_cents, ends_at")
    .eq("status", "completed")
    .gte("ends_at", sixMonthsAgo.toISOString());
  // Reset shifts in monthly aggregation
  for (const k in monthly) monthly[k].shifts = 0;
  for (const sh of shifts6mo ?? []) {
    if (!sh.ends_at) continue;
    const d = new Date(sh.ends_at);
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthly[k]) monthly[k].shifts += sh.platform_fee_cents ?? 0;
  }
  for (const v of filledVacanciesSixMonths ?? []) {
    if (!v.filled_at) continue;
    const d = new Date(v.filled_at);
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthly[k]) monthly[k].vacancies += v.match_fee_cents ?? 0;
  }
  const monthlySeries = Object.entries(monthly)
    .sort(([a], [b]) => {
      const [ay, am] = a.split("-").map(Number);
      const [by, bm] = b.split("-").map(Number);
      return ay * 12 + am - (by * 12 + bm);
    })
    .map(([key, val]) => {
      const [y, m] = key.split("-").map(Number);
      return {
        label: `${MONTHS[m]} '${String(y).slice(-2)}`,
        shifts: val.shifts,
        vacancies: val.vacancies,
        total: val.shifts + val.vacancies,
      };
    });
  const maxMonthly = Math.max(...monthlySeries.map((m) => m.total), 1);

  // Sector aggregation
  const sectorCounts: Record<string, number> = {};
  for (const e of employersBySector ?? []) {
    sectorCounts[e.sector] = (sectorCounts[e.sector] ?? 0) + 1;
  }
  const topSectors = Object.entries(sectorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);
  const maxSectorCount = Math.max(...topSectors.map(([, c]) => c), 1);

  // MRR per sector approximation
  const sectorMrr: Record<string, number> = {};
  for (const v of activeVacancies ?? []) {
    const emp = Array.isArray(v.employers) ? v.employers[0] : v.employers;
    const sec = emp?.sector;
    if (sec) sectorMrr[sec] = (sectorMrr[sec] ?? 0) + (v.monthly_fee_cents ?? 19500);
  }

  // Activation rates
  const employerActivation = pct(employersSigned ?? 0, totalEmployers ?? 0);
  const employeeProfileRate = pct(
    employeesWithProfile ?? 0,
    totalEmployees ?? 0
  );
  const employeeActiveRate = pct(
    employeesWithCompletedShift ?? 0,
    totalEmployees ?? 0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-6">
        <span className="eyebrow">— GROEI DASHBOARD</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Op weg naar <em className="italic text-lime-dark">€1M MRR.</em>
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Real-time inzicht in alle groei-metrics. Live data uit Supabase, geen
          cache.
        </p>
      </div>

      {/* SECTION 1: MRR HERO */}
      <div className="bg-ink text-paper rounded-xl p-6 mb-6 relative overflow-hidden">
        <div
          className="absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full bg-lime opacity-[0.08] -translate-y-1/2"
          style={{ filter: "blur(120px)" }}
        />
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end mb-6">
            <div>
              <div className="eyebrow lime mb-1">— Huidige MRR</div>
              <div className="font-serif text-6xl font-medium tracking-tight">
                {eur(totalMrr)}
              </div>
              <div className="text-sm text-stone-300 mt-2">
                Bruto omzet per maand · netto na referrals:{" "}
                <strong className="text-paper">{eur(netMrr)}</strong>
              </div>
            </div>
            <div className="text-right">
              <div className="eyebrow text-stone-400 mb-1">Doel 1 (€15K)</div>
              <div className="font-serif text-2xl font-medium">
                {progressFirst.toFixed(1)}%
              </div>
              {estimatedMonthsToFirst != null && (
                <div className="text-xs text-stone-400 mt-1">
                  Op huidige groei: ~{estimatedMonthsToFirst} mnd
                </div>
              )}
              {totalMrr < TARGET_MRR_FIRST && (
                <div className="text-xs text-stone-400 mt-1">
                  Nog {eur(mrrToFirstTarget)} te gaan
                </div>
              )}
            </div>
          </div>

          {/* Progress bar to €15K */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="eyebrow text-stone-400">Naar €15K/m</span>
              <span className="font-mono text-stone-300">
                {eur(totalMrr)} / {eur(TARGET_MRR_FIRST)}
              </span>
            </div>
            <div className="h-3 bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime transition-all"
                style={{ width: `${progressFirst}%` }}
              />
            </div>
          </div>

          {/* Progress bar to €1M */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="eyebrow text-stone-400">Naar €1M/m</span>
              <span className="font-mono text-stone-300">
                {eur(totalMrr)} / {eur(TARGET_MRR_LONG)}
              </span>
            </div>
            <div className="h-1.5 bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-paper transition-all"
                style={{ width: `${Math.max(0.5, progressLong)}%` }}
              />
            </div>
            <div className="text-[10px] text-stone-500 mt-1 font-mono">
              {progressLong.toFixed(2)}% — 2-3 jaar horizon
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Revenue streams */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <RevenueCard
          label="Vacatures (MRR)"
          value={eur(mrrVacatures)}
          sublabel={`${(activeVacancies ?? []).length} actieve vacatures × avg €${Math.round(mrrVacatures / Math.max(1, (activeVacancies ?? []).length) / 100)}`}
        />
        <RevenueCard
          label="Shifts (laatste 30d)"
          value={eur(mrrShifts)}
          sublabel="Platform fees 11,5%"
          trendText={shiftsMomGrowth.text}
          trendPositive={shiftsMomGrowth.positive}
        />
        <RevenueCard
          label="Referrals (uitgaand)"
          value={`- ${eur(referralOutgoing)}`}
          sublabel="Deze maand uitbetaald"
          alert={referralOutgoing > totalMrr * 0.1}
        />
      </div>

      {/* SECTION 3: 6-month trend chart */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-serif text-xl font-medium">
            Omzet trend · 6 maanden
          </h2>
          <div className="flex gap-3 text-xs">
            <Legend color="bg-lime" label="Shifts" />
            <Legend color="bg-ink" label="Vacature match fees" />
          </div>
        </div>
        <div className="flex items-end gap-3 h-48">
          {monthlySeries.map((m) => {
            const shiftsPct = (m.shifts / maxMonthly) * 100;
            const vacPct = (m.vacancies / maxMonthly) * 100;
            return (
              <div
                key={m.label}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <div className="text-xs font-mono text-stone-600">
                  {m.total > 0 ? eurShort(m.total) : "—"}
                </div>
                <div className="w-full flex-1 flex flex-col-reverse min-h-[8px]">
                  {m.shifts > 0 && (
                    <div
                      className="w-full bg-lime rounded-t-sm"
                      style={{ height: `${shiftsPct}%`, minHeight: "2px" }}
                    />
                  )}
                  {m.vacancies > 0 && (
                    <div
                      className="w-full bg-ink"
                      style={{ height: `${vacPct}%`, minHeight: "2px" }}
                    />
                  )}
                </div>
                <div className="eyebrow text-[10px]">{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Customer growth */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <GrowthCard
          label="Werkgevers"
          value={String(totalEmployers ?? 0)}
          sublabel={`+${employersThisMonth ?? 0} deze maand`}
          trend={employerTrend}
        />
        <GrowthCard
          label="Werknemers"
          value={String(totalEmployees ?? 0)}
          sublabel={`+${employeesThisMonth ?? 0} deze maand`}
          trend={employeeTrend}
        />
        <GrowthCard
          label="Nieuw deze week"
          value={String(
            (employersThisWeek ?? 0) + (employeesThisWeek ?? 0)
          )}
          sublabel={`${employersThisWeek ?? 0} werkgevers · ${employeesThisWeek ?? 0} werknemers`}
        />
        <GrowthCard
          label="ARPA (avg/klant)"
          value={
            (totalEmployers ?? 0) > 0
              ? eur(Math.round(mrrVacatures / Math.max(1, totalEmployers ?? 1)))
              : "—"
          }
          sublabel="MRR per werkgever"
        />
      </div>

      {/* SECTION 5: Activation funnels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <FunnelCard
          title="Werkgever funnel"
          steps={[
            { label: "Aangemeld", count: totalEmployers ?? 0 },
            {
              label: "Overeenkomst getekend",
              count: employersSigned ?? 0,
            },
            {
              label: "≥ 1 vacature of shift",
              count: employersWithActivityComputed,
            },
          ]}
        />
        <FunnelCard
          title="Werknemer funnel"
          steps={[
            { label: "Aangemeld", count: totalEmployees ?? 0 },
            { label: "Profiel compleet", count: employeesWithProfile ?? 0 },
            {
              label: "≥ 1 reactie",
              count: employeesWithReaction ?? 0,
            },
            {
              label: "≥ 1 shift gedaan",
              count: employeesWithCompletedShift ?? 0,
            },
          ]}
        />
      </div>

      {/* SECTION 6: Activity 30d */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <h2 className="font-serif text-xl font-medium mb-4">
          Activiteit laatste 30 dagen
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActivityCard
            label="Shifts geplaatst"
            value={shiftsPosted30d ?? 0}
          />
          <ActivityCard
            label="Shifts voltooid"
            value={shiftsCompleted30d ?? 0}
            highlight={
              (shiftsCompleted30d ?? 0) > 0 &&
              (shiftsCompleted30d ?? 0) >= (shiftsPosted30d ?? 1) * 0.5
            }
          />
          <ActivityCard
            label="Vacatures geplaatst"
            value={vacanciesPosted30d ?? 0}
          />
          <ActivityCard
            label="Vacatures ingevuld"
            value={vacanciesFilled30d ?? 0}
            highlight={(vacanciesFilled30d ?? 0) > 0}
          />
        </div>
      </div>

      {/* SECTION 7: Top sectoren */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <h2 className="font-serif text-xl font-medium mb-4">
          Top sectoren ({topSectors.length} actief)
        </h2>
        {topSectors.length === 0 ? (
          <p className="text-sm text-stone-500 py-6 text-center">
            Geen sector data nog.
          </p>
        ) : (
          <div className="space-y-2">
            {topSectors.map(([sector, count]) => {
              const barPct = (count / maxSectorCount) * 100;
              const mrrPart = sectorMrr[sector] ?? 0;
              return (
                <div key={sector} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {SECTOR_LABELS[sector] ?? sector}
                    </span>
                    <span className="text-stone-500 font-mono text-xs">
                      {count} {count === 1 ? "werkgever" : "werkgevers"}
                      {mrrPart > 0 && ` · ${eur(mrrPart)}/m`}
                    </span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lime"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 8: Activation health */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <h2 className="font-serif text-xl font-medium mb-4">
          Activation health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthCard
            label="Werkgever activation"
            pct={employerActivation}
            target={80}
            help="Aandeel werkgevers met getekende overeenkomst"
          />
          <HealthCard
            label="Werknemer profiel-rate"
            pct={employeeProfileRate}
            target={70}
            help="Werknemers met geboortedatum ingevuld"
          />
          <HealthCard
            label="Werknemer activatie"
            pct={employeeActiveRate}
            target={40}
            help="Werknemers met minimaal 1 voltooide shift"
          />
        </div>
      </div>

      {/* ============ FORECAST ============ */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <h2 className="font-serif text-xl font-medium mb-1">
          Forecast — pad naar de doelen
        </h2>
        <p className="text-xs text-stone-500 mb-4">
          Hoe lang tot we elke milestone halen op verschillende groeicurves.
          &lsquo;Realistisch&rsquo; = jouw werkelijke MoM groei (
          {(realisticGrowth * 100).toFixed(0)}%/m).
        </p>

        {/* Scenarios tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left">
                <Th>Scenario</Th>
                <Th>MoM groei</Th>
                <Th>→ €15K</Th>
                <Th>→ €100K</Th>
                <Th>→ €1M</Th>
                <Th>MRR over 12mnd</Th>
              </tr>
            </thead>
            <tbody>
              {dynamicScenarios.map((sc) => {
                const m15k = monthsToTarget(totalMrr, TARGET_MRR_FIRST, sc.monthly);
                const m100k = monthsToTarget(totalMrr, TARGET_MRR_MID, sc.monthly);
                const m1m = monthsToTarget(totalMrr, TARGET_MRR_LONG, sc.monthly);
                const mrrIn12 = totalMrr * Math.pow(1 + sc.monthly, 12);
                return (
                  <tr key={sc.label} className="border-b border-stone-100">
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded ${sc.barClass}`} />
                        <span className={`font-semibold ${sc.textClass}`}>
                          {sc.label}
                        </span>
                      </div>
                    </Td>
                    <Td className="font-mono">
                      {(sc.monthly * 100).toFixed(0)}%/m
                    </Td>
                    <Td className="font-mono text-xs">{monthsLabel(m15k)}</Td>
                    <Td className="font-mono text-xs">{monthsLabel(m100k)}</Td>
                    <Td className="font-mono text-xs">{monthsLabel(m1m)}</Td>
                    <Td className="font-mono font-semibold">
                      {eurShort(mrrIn12)}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-stone-500 mt-3 italic">
          ⓘ Forecasts gaan uit van compound monthly growth. Werkelijke groei
          kan fluctueren — meer signups in marketing-piek, minder in zomer, etc.
        </div>
      </div>

      {/* ============ DAADWERKELIJKE PUNTEN — periode vergelijkingen ============ */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <h2 className="font-serif text-xl font-medium mb-1">
          Daadwerkelijke punten — periode vergelijkingen
        </h2>
        <p className="text-xs text-stone-500 mb-4">
          Concrete data: wat is er werkelijk gebeurd in elke periode + delta met
          vorige periode.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left">
                <Th>Metric</Th>
                <Th className="text-right">Vandaag</Th>
                <Th className="text-right">Gisteren</Th>
                <Th className="text-right">Deze week</Th>
                <Th className="text-right">Vorige week</Th>
                <Th className="text-right">Deze maand</Th>
                <Th className="text-right">Vorige maand</Th>
              </tr>
            </thead>
            <tbody>
              <PeriodRow label="Nieuwe werkgevers" data={periodMetrics.employers} />
              <PeriodRow label="Nieuwe werknemers" data={periodMetrics.employees} />
              <PeriodRow label="Shifts geplaatst" data={periodMetrics.shifts} />
              <PeriodRow label="Vacatures geplaatst" data={periodMetrics.vacancies} />
              <PeriodRow
                label="Omzet shifts"
                data={periodMetrics.revenue}
                isMoney
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ TOP 10 KLANTEN ============ */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <h2 className="font-serif text-xl font-medium mb-1">
          Top 10 klanten (op huidige MRR-bijdrage)
        </h2>
        <p className="text-xs text-stone-500 mb-4">
          Welke werkgevers leveren nu het meeste op. Vacature MRR + shift fees
          last 30d.
        </p>

        {topKlanten.length === 0 ? (
          <p className="text-sm text-stone-500 text-center py-6">
            Nog geen klanten met actieve MRR.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left">
                  <Th>#</Th>
                  <Th>Werkgever</Th>
                  <Th>Sector</Th>
                  <Th className="text-right">Vacatures MRR</Th>
                  <Th className="text-right">Shifts 30d</Th>
                  <Th className="text-right">Totaal</Th>
                  <Th className="text-right">% van MRR</Th>
                </tr>
              </thead>
              <tbody>
                {topKlanten.map((k, i) => {
                  const sharePct = totalMrr > 0 ? (k.total / totalMrr) * 100 : 0;
                  return (
                    <tr
                      key={k.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <Td className="font-mono text-stone-500">{i + 1}</Td>
                      <Td>
                        <Link
                          href={`/admin/klanten/${k.id}`}
                          className="font-medium hover:underline"
                        >
                          {k.name}
                        </Link>
                      </Td>
                      <Td className="text-stone-600">
                        {SECTOR_LABELS[k.sector] ?? k.sector}
                      </Td>
                      <Td className="text-right font-mono">
                        {eur(k.vacatureMrr)}
                      </Td>
                      <Td className="text-right font-mono">
                        {eur(k.shiftMrr30d)}
                      </Td>
                      <Td className="text-right font-mono font-semibold">
                        {eur(k.total)}
                      </Td>
                      <Td className="text-right">
                        <span className="font-mono text-xs bg-lime/20 text-lime-dark px-1.5 py-0.5 rounded">
                          {sharePct.toFixed(1)}%
                        </span>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============ RECORDS & MIJLPALEN ============ */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <h2 className="font-serif text-xl font-medium mb-4">
          🏆 Records & mijlpalen
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <RecordCard
            icon="🚀"
            label="Beste werkgever-dag"
            value={bestEmpDay ? `${bestEmpDay[1]} signups` : "—"}
            sublabel={bestEmpDay ? formatDate(bestEmpDay[0]) : "Nog geen data"}
          />
          <RecordCard
            icon="👥"
            label="Beste werknemer-dag"
            value={bestEmpeDay ? `${bestEmpeDay[1]} signups` : "—"}
            sublabel={bestEmpeDay ? formatDate(bestEmpeDay[0]) : "Nog geen data"}
          />
          <RecordCard
            icon="💰"
            label="Beste omzet-dag"
            value={bestRevDay ? eur(bestRevDay[1]) : "—"}
            sublabel={bestRevDay ? formatDate(bestRevDay[0]) : "Nog geen completed shifts"}
          />
          <RecordCard
            icon="⭐"
            label="Grootste klant"
            value={topKlanten[0]?.name ?? "—"}
            sublabel={
              topKlanten[0]
                ? `${eur(topKlanten[0].total)} MRR bijdrage`
                : "Geen actieve MRR"
            }
          />
          <RecordCard
            icon="💎"
            label="Hoogste single-shift"
            value={
              highestShift?.platform_fee_cents
                ? eur(highestShift.platform_fee_cents)
                : "—"
            }
            sublabel={highestShift?.title ?? ""}
          />
          <RecordCard
            icon="🎯"
            label="Volgende milestone"
            value={
              totalMrr < TARGET_MRR_FIRST
                ? `€${(TARGET_MRR_FIRST - totalMrr) / 100} te gaan`
                : totalMrr < TARGET_MRR_MID
                  ? `€${((TARGET_MRR_MID - totalMrr) / 100).toLocaleString("nl-NL")} naar €100K`
                  : `${((totalMrr / TARGET_MRR_LONG) * 100).toFixed(1)}% naar €1M`
            }
            sublabel={
              totalMrr < TARGET_MRR_FIRST
                ? "€15K MRR (eerste milestone)"
                : totalMrr < TARGET_MRR_MID
                  ? "€100K MRR"
                  : "€1M MRR (uiteindelijk doel)"
            }
          />
        </div>
      </div>

      {/* ============ KOSTEN VS OMZET ============ */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <h2 className="font-serif text-xl font-medium mb-1">
          Kosten vs Omzet
        </h2>
        <p className="text-xs text-stone-500 mb-4">
          Geschatte platform kosten per maand. Echte boekhouding komt via
          accounting koppeling.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <CostCard label="Bruto MRR" value={eur(totalMrr)} positive />
          <CostCard
            label="Vaste kosten"
            value={`- ${eur(FIXED_COSTS_CENTS)}`}
            sublabel="Supabase + Vercel + tooling"
          />
          <CostCard
            label="Variabel (0.5%)"
            value={`- ${eur(variableCosts)}`}
            sublabel="Mollie payment fees"
          />
          <CostCard
            label="Referrals payout"
            value={`- ${eur(referralOutgoing)}`}
            sublabel="Deze maand uitbetaald"
          />
        </div>

        <div className="bg-ink text-paper rounded-lg p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
            <div>
              <div className="eyebrow text-stone-400">Netto winst (geschat)</div>
              <div
                className={`font-serif text-3xl font-medium mt-1 ${
                  netProfit >= 0 ? "text-lime" : "text-red-400"
                }`}
              >
                {netProfit >= 0 ? "" : "-"}
                {eur(Math.abs(netProfit))}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Per maand bij huidige run-rate
              </div>
            </div>
            <div>
              <div className="eyebrow text-stone-400">Gross margin</div>
              <div className="font-serif text-3xl font-medium mt-1">
                {grossMargin.toFixed(0)}%
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Industry SaaS target: 70%+
              </div>
            </div>
            <div>
              <div className="eyebrow text-stone-400">Break-even MRR</div>
              <div className="font-serif text-3xl font-medium mt-1">
                {eur(Math.round(FIXED_COSTS_CENTS / (1 - VARIABLE_COST_RATE)))}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                {totalMrr >= FIXED_COSTS_CENTS ? "✓ Bereikt" : "Punt om winstgevend te zijn"}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-500 mt-3 italic">
          ⓘ Pas vaste kosten aan in <code>app/admin/kpi/page.tsx</code> constante{" "}
          <code>FIXED_COSTS_CENTS</code>. Variabele rate via{" "}
          <code>VARIABLE_COST_RATE</code>.
        </p>
      </div>

      {/* Footer */}
      <div className="text-xs text-stone-500 text-center">
        Laatste update:{" "}
        {now.toLocaleString("nl-NL", {
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        · refresh pagina voor nieuwe data ·{" "}
        <Link href="/admin/financien" className="underline">
          → Financiën
        </Link>{" "}
        ·{" "}
        <Link href="/admin/klanten" className="underline">
          Klanten
        </Link>
      </div>
    </div>
  );
}

// === Components ===

function RevenueCard({
  label,
  value,
  sublabel,
  trendText,
  trendPositive,
  alert = false,
}: {
  label: string;
  value: string;
  sublabel?: string;
  trendText?: string;
  trendPositive?: boolean;
  alert?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-lg border ${
        alert
          ? "bg-amber-50 border-amber-300"
          : "bg-paper border-stone-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="eyebrow">{label}</span>
        {trendText && (
          <span
            className={`text-xs font-bold ${
              trendPositive ? "text-lime-dark" : "text-red-700"
            }`}
          >
            {trendPositive ? "↑" : "↓"} {trendText}
          </span>
        )}
      </div>
      <div className="font-serif text-2xl font-medium tracking-tight mt-2">
        {value}
      </div>
      {sublabel && (
        <div className="text-xs text-stone-500 mt-1">{sublabel}</div>
      )}
    </div>
  );
}

function GrowthCard({
  label,
  value,
  sublabel,
  trend,
}: {
  label: string;
  value: string;
  sublabel?: string;
  trend?: { text: string; positive: boolean };
}) {
  return (
    <div className="p-5 rounded-lg border bg-paper border-stone-200">
      <div className="flex items-start justify-between gap-2">
        <span className="eyebrow">{label}</span>
        {trend && (
          <span
            className={`text-xs font-bold ${
              trend.positive ? "text-lime-dark" : "text-red-700"
            }`}
          >
            {trend.positive ? "↑" : "↓"} {trend.text}
          </span>
        )}
      </div>
      <div className="font-serif text-2xl font-medium tracking-tight mt-2">
        {value}
      </div>
      {sublabel && (
        <div className="text-xs text-stone-500 mt-1">{sublabel}</div>
      )}
    </div>
  );
}

function FunnelCard({
  title,
  steps,
}: {
  title: string;
  steps: { label: string; count: number }[];
}) {
  const max = Math.max(...steps.map((s) => s.count), 1);
  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-5">
      <h3 className="font-serif text-lg font-medium mb-4">{title}</h3>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const barPct = (step.count / max) * 100;
          const dropRate =
            i > 0 && steps[i - 1].count > 0
              ? Math.round((step.count / steps[i - 1].count) * 100)
              : 100;
          return (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">{step.label}</span>
                <span className="font-mono text-stone-600 text-xs">
                  {step.count}
                  {i > 0 && (
                    <span
                      className={`ml-2 text-[10px] ${
                        dropRate >= 60
                          ? "text-lime-dark"
                          : dropRate >= 30
                            ? "text-amber-700"
                            : "text-red-700"
                      }`}
                    >
                      ({dropRate}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    i === 0 ? "bg-ink" : "bg-lime"
                  }`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-lg ${
        highlight ? "bg-lime/10 border border-lime" : "bg-cream border border-stone-200"
      }`}
    >
      <div className="eyebrow text-[10px]">{label}</div>
      <div className="font-serif text-3xl font-medium mt-1">{value}</div>
    </div>
  );
}

function HealthCard({
  label,
  pct,
  target,
  help,
}: {
  label: string;
  pct: number;
  target: number;
  help: string;
}) {
  const isHealthy = pct >= target;
  return (
    <div className="bg-cream rounded-md p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow text-[10px]">{label}</span>
        <span className="text-[10px] font-mono text-stone-500">
          target {target}%
        </span>
      </div>
      <div className="font-serif text-2xl font-medium mb-1">{pct}%</div>
      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${isHealthy ? "bg-lime" : "bg-amber-400"}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <div className="text-[10px] text-stone-500">{help}</div>
    </div>
  );
}

function PeriodRow({
  label,
  data,
  isMoney = false,
}: {
  label: string;
  data: {
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
  };
  isMoney?: boolean;
}) {
  const fmt = (n: number) => (isMoney ? `€ ${(n / 100).toLocaleString("nl-NL", { maximumFractionDigits: 0 })}` : String(n));
  const delta = (cur: number, prev: number) => {
    if (prev === 0 && cur === 0) return null;
    if (prev === 0) return { txt: "Nieuw", pos: true };
    const pct = ((cur - prev) / prev) * 100;
    return {
      txt: `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`,
      pos: pct >= 0,
    };
  };
  return (
    <tr className="border-b border-stone-100">
      <Td className="font-medium">{label}</Td>
      <Td className="text-right font-mono">
        <div>{fmt(data.today)}</div>
      </Td>
      <Td className="text-right font-mono text-stone-500 text-xs">
        <div>{fmt(data.yesterday)}</div>
      </Td>
      <Td className="text-right font-mono">
        <div>{fmt(data.thisWeek)}</div>
        <DeltaPill d={delta(data.thisWeek, data.lastWeek)} />
      </Td>
      <Td className="text-right font-mono text-stone-500 text-xs">
        <div>{fmt(data.lastWeek)}</div>
      </Td>
      <Td className="text-right font-mono">
        <div>{fmt(data.thisMonth)}</div>
        <DeltaPill d={delta(data.thisMonth, data.lastMonth)} />
      </Td>
      <Td className="text-right font-mono text-stone-500 text-xs">
        <div>{fmt(data.lastMonth)}</div>
      </Td>
    </tr>
  );
}

function DeltaPill({ d }: { d: { txt: string; pos: boolean } | null }) {
  if (!d) return null;
  return (
    <span
      className={`text-[10px] font-bold ml-1 ${
        d.pos ? "text-lime-dark" : "text-red-700"
      }`}
    >
      {d.pos ? "↑" : "↓"} {d.txt}
    </span>
  );
}

function RecordCard({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: string;
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-cream rounded-lg p-4 flex items-start gap-3">
      <div className="text-3xl">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="eyebrow text-[10px]">{label}</div>
        <div className="font-serif text-lg font-medium tracking-tight mt-1 truncate">
          {value}
        </div>
        {sublabel && (
          <div className="text-xs text-stone-500 mt-0.5 truncate">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

function CostCard({
  label,
  value,
  sublabel,
  positive = false,
}: {
  label: string;
  value: string;
  sublabel?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-cream rounded-lg p-4">
      <div className="eyebrow text-[10px]">{label}</div>
      <div
        className={`font-serif text-xl font-medium mt-1 ${
          positive ? "text-lime-dark" : "text-ink"
        }`}
      >
        {value}
      </div>
      {sublabel && (
        <div className="text-xs text-stone-500 mt-0.5">{sublabel}</div>
      )}
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2 font-mono text-xs uppercase tracking-wider text-stone-600 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-stone-600">
      <span className={`inline-block w-2.5 h-2.5 rounded ${color}`} />
      {label}
    </span>
  );
}
