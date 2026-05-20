import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: employer } = await supabase
    .from("employers")
    .select("*")
    .eq("user_id", user!.id)
    .single();

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
          {greeting}, {employer?.company_name || "team"}.
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Welkom op je werkgevers-dashboard. Plaats je eerste shift om te beginnen.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Shifts vandaag" value="0" dark />
        <StatCard label="Open vacatures" value="0" />
        <StatCard label="Uren deze maand" value="0" />
        <StatCard label="KLOK kosten MTD" value="€ 0" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-paper border border-stone-200 rounded-lg p-6">
          <h2 className="font-serif text-xl font-medium mb-4">Live activity</h2>
          <div className="text-stone-500 text-sm py-12 text-center">
            Nog geen activiteit. Plaats een shift om te starten.
          </div>
        </div>
        <div className="bg-paper border border-stone-200 rounded-lg p-6">
          <h2 className="font-serif text-xl font-medium mb-4">Snelle acties</h2>
          <div className="space-y-2">
            <ActionButton href="/dashboard/shifts/new" lime>
              + Plaats nieuwe shift
            </ActionButton>
            <ActionButton href="/dashboard/vacatures">
              + Plaats vacature
            </ActionButton>
            <ActionButton href="/dashboard/instellingen">
              Bedrijfsprofiel completen
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
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-lg border ${
        dark
          ? "bg-ink text-paper border-ink"
          : "bg-paper border-stone-200"
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
