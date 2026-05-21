import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ReferralRatingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: referredUserId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verifieer: deze user moet jouw referral zijn
  const { data: referredUser } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, referrer_id, created_at")
    .eq("id", referredUserId)
    .single();

  if (!referredUser) notFound();
  if (referredUser.referrer_id !== user!.id) notFound();

  const fullName =
    [referredUser.first_name, referredUser.last_name]
      .filter(Boolean)
      .join(" ") || referredUser.email.split("@")[0];

  const { data: employee } = await supabase
    .from("employees")
    .select("avg_rating, total_shifts")
    .eq("user_id", referredUserId)
    .maybeSingle();

  const { data: ratings, count } = await supabase
    .from("ratings")
    .select(
      `
      id,
      stars,
      review,
      created_at,
      shifts (
        title,
        starts_at,
        employers (
          company_name
        )
      )
    `,
      { count: "exact" }
    )
    .eq("rated_user_id", referredUserId)
    .order("created_at", { ascending: false });

  // Distribution
  const distribution = [0, 0, 0, 0, 0];
  for (const r of ratings ?? []) {
    if (r.stars >= 1 && r.stars <= 5) distribution[r.stars - 1]++;
  }
  const totalRatings = ratings?.length ?? 0;
  const avgRating = Number(employee?.avg_rating ?? 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        href="/werknemer/referrals"
        className="text-sm text-stone-600 hover:text-ink"
      >
        ← Terug naar referrals
      </Link>

      <div className="mt-3 mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">— REFERRAL · RATINGS</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            {fullName}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Aangemeld via jouw link op{" "}
            {new Date(referredUser.created_at).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {employee?.total_shifts ?? 0} shifts voltooid
          </p>
        </div>
      </div>

      <div className="bg-lime/10 border border-lime rounded-lg p-4 mb-6 text-sm">
        <strong>🔒 Privé inzicht.</strong> Als referrer mag je de toelichtingen
        lezen die werkgevers over deze persoon hebben geschreven. Behandel het
        vertrouwelijk.
      </div>

      {/* Rating overview */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
          <div className="text-center md:text-left md:border-r md:border-stone-200 md:pr-6">
            <div className="font-serif text-6xl font-medium text-ink">
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
            </div>
            <div className="mt-2 text-2xl leading-none">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={avgRating >= i ? "text-lime-dark" : "text-stone-300"}
                >
                  {avgRating >= i ? "★" : "☆"}
                </span>
              ))}
            </div>
            <div className="text-xs text-stone-500 mt-2">
              {totalRatings === 0
                ? "Nog geen ratings"
                : `${totalRatings} ${totalRatings === 1 ? "rating" : "ratings"}`}
            </div>
          </div>

          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const c = distribution[star - 1];
              const pct = totalRatings > 0 ? (c / totalRatings) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-stone-600">{star}★</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lime"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-stone-500 text-xs">
                    {c}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lijst */}
      <h2 className="font-serif text-xl font-medium mb-3">
        Reviews ({count ?? 0})
      </h2>

      {!ratings || ratings.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center text-stone-500">
          {fullName} heeft nog geen ratings ontvangen.
        </div>
      ) : (
        <div className="space-y-3">
          {ratings.map((r) => {
            const shift = Array.isArray(r.shifts) ? r.shifts[0] : r.shifts;
            const employer = shift
              ? Array.isArray(shift.employers)
                ? shift.employers[0]
                : shift.employers
              : null;
            return (
              <div
                key={r.id}
                className="bg-paper border border-stone-200 rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <div className="flex-1 min-w-[150px]">
                    <div className="inline-flex gap-0.5 text-base leading-none">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={
                            r.stars >= i ? "text-lime-dark" : "text-stone-300"
                          }
                        >
                          {r.stars >= i ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      {employer?.company_name ?? "Bedrijf"} ·{" "}
                      {shift?.title ?? "Shift"}
                    </div>
                  </div>
                  <div className="text-xs text-stone-500">
                    {new Date(r.created_at).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                {r.review ? (
                  <p className="text-sm text-stone-700 italic bg-cream rounded p-3 mt-2">
                    &ldquo;{r.review}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-stone-400 mt-2">
                    Geen toelichting gegeven.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
