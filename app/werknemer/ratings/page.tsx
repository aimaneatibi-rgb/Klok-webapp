import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function WerknemerRatingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: employee } = await supabase
    .from("employees")
    .select("avg_rating, total_shifts")
    .eq("user_id", user!.id)
    .single();

  const { data: ratings, count } = await supabase
    .from("ratings")
    .select(
      `
      id,
      stars,
      review,
      created_at,
      shifts (
        id,
        title,
        starts_at,
        employers (
          company_name,
          sector
        )
      )
    `,
      { count: "exact" }
    )
    .eq("rated_user_id", user!.id)
    .order("created_at", { ascending: false });

  // Verdeling per ster (1-5)
  const distribution = [0, 0, 0, 0, 0]; // index 0 = 1 ster, index 4 = 5 sterren
  for (const r of ratings ?? []) {
    if (r.stars >= 1 && r.stars <= 5) {
      distribution[r.stars - 1]++;
    }
  }
  const totalRatings = ratings?.length ?? 0;
  const avgRating = Number(employee?.avg_rating ?? 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— MIJN RATINGS</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Hoe vinden werkgevers je?
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Ratings van werkgevers na voltooide shifts. Een hogere rating = meer
          kansen op nieuwe shifts.
        </p>
      </div>

      {/* Big rating display */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
          {/* Big number */}
          <div className="text-center md:text-left md:border-r md:border-stone-200 md:pr-6">
            <div className="font-serif text-6xl font-medium text-ink">
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
            </div>
            <div className="mt-2">
              <Stars value={avgRating} size="lg" />
            </div>
            <div className="text-xs text-stone-500 mt-2">
              {totalRatings === 0
                ? "Nog geen ratings"
                : `${totalRatings} ${totalRatings === 1 ? "rating" : "ratings"}`}
            </div>
          </div>

          {/* Distribution bars */}
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star - 1];
              const pct =
                totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              return (
                <div
                  key={star}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="w-6 text-stone-600">{star}★</span>
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lime"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-stone-500 text-xs">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual ratings list */}
      <div>
        <h2 className="font-serif text-xl font-medium mb-3">
          Recente ratings ({count ?? 0})
        </h2>

        {!ratings || ratings.length === 0 ? (
          <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
            <div className="font-serif text-lg text-stone-700 mb-2">
              Nog geen ratings ontvangen.
            </div>
            <p className="text-sm text-stone-500 mb-4">
              Werkgevers kunnen je een rating geven nadat je een shift voltooid hebt.
            </p>
            <Link
              href="/werknemer/zoeken"
              className="inline-block bg-lime text-ink px-4 py-2 rounded-md text-sm font-semibold hover:bg-lime-dark"
            >
              Shifts zoeken →
            </Link>
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
                      <Stars value={r.stars} />
                      <div className="text-xs text-stone-500 mt-1">
                        {employer?.company_name ?? "Onbekend bedrijf"} ·{" "}
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
                  {r.review && (
                    <p className="text-sm text-stone-700 italic bg-cream rounded p-3 mt-2">
                      &ldquo;{r.review}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stars({
  value,
  size = "md",
}: {
  value: number;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "text-2xl" : "text-base";
  return (
    <div className={`inline-flex gap-0.5 ${sizeClass} leading-none`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i;
        const half = !filled && value >= i - 0.5;
        return (
          <span
            key={i}
            className={
              filled || half ? "text-lime-dark" : "text-stone-300"
            }
            title={`${i} ster${i === 1 ? "" : "ren"}`}
          >
            {filled ? "★" : half ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
}
