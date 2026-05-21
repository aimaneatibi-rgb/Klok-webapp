import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NewVacancyForm from "./new-vacancy-form";

export default async function NewVacancyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: employer } = await supabase
    .from("employers")
    .select("id, company_name, about, coop_agreement_signed_at")
    .eq("user_id", user!.id)
    .single();

  if (!employer) {
    redirect("/dashboard/instellingen");
  }

  // Block: vereist getekende samenwerkingsovereenkomst
  if (!employer.coop_agreement_signed_at) {
    redirect("/dashboard/overeenkomst");
  }

  // Actieve vacatures count voor staffel
  const { count: activeCount } = await supabase
    .from("vacancies")
    .select("*", { count: "exact", head: true })
    .eq("employer_id", employer.id)
    .in("status", ["open", "paused"]);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        href="/dashboard/vacatures"
        className="eyebrow text-stone-500 hover:text-ink"
      >
        ← Terug naar vacatures
      </Link>
      <h1 className="font-serif text-4xl font-medium tracking-tight mt-4 mb-2">
        Nieuwe vacature plaatsen
      </h1>
      <p className="text-stone-500 text-sm mb-8">
        Vaste positie. Werknemers kunnen solliciteren. Maandelijkse fee start
        bij plaatsing.
      </p>

      <NewVacancyForm
        employerId={employer.id}
        initialAbout={employer.about ?? ""}
        currentActiveCount={activeCount ?? 0}
      />
    </div>
  );
}
