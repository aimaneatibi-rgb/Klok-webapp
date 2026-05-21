import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./profile-form";

export default async function WerknemerProfielPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userProfile } = await supabase
    .from("users")
    .select("first_name, last_name, phone, iban")
    .eq("id", user!.id)
    .single();

  const { data: employee } = await supabase
    .from("employees")
    .select("date_of_birth, sectors, search_radius_km, hours_per_week, linkedin_url")
    .eq("user_id", user!.id)
    .single();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— MIJN PROFIEL</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Wie ben je?
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Hoe completer je profiel, hoe beter we shifts kunnen voorstellen die bij je passen.
        </p>
      </div>

      <ProfileForm
        email={user!.email ?? ""}
        initial={{
          first_name: userProfile?.first_name ?? "",
          last_name: userProfile?.last_name ?? "",
          phone: userProfile?.phone ?? "",
          iban: userProfile?.iban ?? "",
          date_of_birth: employee?.date_of_birth ?? "",
          sectors: (employee?.sectors as string[] | null) ?? [],
          search_radius_km: employee?.search_radius_km ?? 10,
          hours_per_week: employee?.hours_per_week ?? null,
          linkedin_url: employee?.linkedin_url ?? "",
        }}
      />
    </div>
  );
}
