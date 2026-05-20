import { createClient } from "@/lib/supabase/server";

export default async function InstellingenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: employer } = await supabase
    .from("employers")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <span className="eyebrow">— BEDRIJFSPROFIEL</span>
      <h1 className="font-serif text-4xl font-medium tracking-tight mt-2 mb-2">
        Instellingen
      </h1>
      <p className="text-stone-500 text-sm mb-8">
        Beheer je bedrijfsgegevens, notificaties en betalingen.
      </p>

      <div className="bg-paper border border-stone-200 rounded-lg p-6">
        <h2 className="font-serif text-xl font-medium mb-4">Bedrijfsgegevens</h2>
        <div className="space-y-3 text-sm">
          <Row label="Bedrijfsnaam" value={employer?.company_name || "—"} />
          <Row label="KvK-nummer" value={employer?.kvk_number || "—"} />
          <Row label="Sector" value={employer?.sector || "—"} />
          <Row label="Email" value={user?.email || "—"} />
        </div>
      </div>

      {/* Cursor: prompt 5.2 voor volledige instellingen met tabs */}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-stone-100 pb-2">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
