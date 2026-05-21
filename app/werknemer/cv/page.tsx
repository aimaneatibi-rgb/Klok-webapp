import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CvBasicsForm from "./cv-basics-form";
import WorkHistorySection from "./work-history-section";
import PortfolioSection from "./portfolio-section";
import SocialLinksForm from "./social-links-form";

export type WorkHistoryItem = {
  id: string;
  company: string;
  role: string;
  start_year: number;
  end_year: number | null;
  description: string | null;
};

export type PortfolioItem = {
  id: string;
  image_url: string;
  title: string;
  description: string | null;
};

export type SocialLinks = {
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  github?: string;
  website?: string;
};

export default async function CvPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: employee } = await supabase
    .from("employees")
    .select(
      "id, profile_photo_url, bio, skills, social_links, work_history, portfolio, linkedin_url"
    )
    .eq("user_id", user!.id)
    .single();

  if (!employee) redirect("/werknemer/profiel");

  const { data: userRow } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", user!.id)
    .single();

  const fullName =
    [userRow?.first_name, userRow?.last_name].filter(Boolean).join(" ") ||
    "Mijn naam";

  const socialLinks: SocialLinks = {
    ...(employee.social_links as SocialLinks | null),
    linkedin:
      (employee.social_links as SocialLinks | null)?.linkedin ||
      employee.linkedin_url ||
      "",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <span className="eyebrow">— MIJN CV</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Bouw je CV.
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Werkgevers zien je CV bij elke sollicitatie. Een complete CV =
          significant meer kans op een match.
        </p>
      </div>

      <div className="space-y-6">
        <CvBasicsForm
          employeeId={employee.id}
          userId={user!.id}
          fullName={fullName}
          initial={{
            profile_photo_url: employee.profile_photo_url ?? "",
            bio: employee.bio ?? "",
            skills: (employee.skills as string[] | null) ?? [],
          }}
        />

        <SocialLinksForm
          employeeId={employee.id}
          initial={socialLinks}
        />

        <WorkHistorySection
          employeeId={employee.id}
          initial={
            ((employee.work_history as WorkHistoryItem[] | null) ?? []) as
              WorkHistoryItem[]
          }
        />

        <PortfolioSection
          employeeId={employee.id}
          userId={user!.id}
          initial={
            ((employee.portfolio as PortfolioItem[] | null) ?? []) as
              PortfolioItem[]
          }
        />
      </div>
    </div>
  );
}
