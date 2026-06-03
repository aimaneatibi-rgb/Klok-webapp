import { createClient } from "@/lib/supabase/server";
import CrmStageForm, { type FunnelStage } from "./crm-stage-form";
import CrmNoteForm from "./crm-note-form";
import CrmActivityForm from "./crm-activity-form";

type TargetType = "employer" | "employee" | "prospect";

// Supabase returnt joined `users` als array of als object afhankelijk van de
// relatie-cardinality. Beide accepteren — formatAuthor() pakt het eerste
// element bij array.
type AuthorUser = { first_name: string | null; last_name: string | null };
type AuthorJoin = AuthorUser | AuthorUser[] | null;

type NoteRow = {
  id: string;
  body: string;
  created_at: string;
  author_user_id: string | null;
  users?: AuthorJoin;
};

type ActivityRow = {
  id: string;
  kind: string;
  summary: string;
  details: string | null;
  occurred_at: string;
  author_user_id: string | null;
  users?: AuthorJoin;
};

const KIND_META: Record<
  string,
  { icon: string; label: string; tone: string }
> = {
  note: { icon: "📝", label: "Notitie", tone: "bg-stone-100" },
  call_out: { icon: "📞", label: "Uitgaand", tone: "bg-blue-50" },
  call_in: { icon: "📞", label: "Inkomend", tone: "bg-blue-50" },
  email_out: { icon: "✉️", label: "Mail verstuurd", tone: "bg-indigo-50" },
  email_in: { icon: "📥", label: "Mail ontvangen", tone: "bg-indigo-50" },
  meeting: { icon: "🤝", label: "Meeting", tone: "bg-amber-50" },
  signup: { icon: "✨", label: "Signup", tone: "bg-lime/20" },
  shift_posted: { icon: "🕐", label: "Shift geplaatst", tone: "bg-lime/20" },
  vacancy_posted: { icon: "💼", label: "Vacature", tone: "bg-lime/20" },
  invoice_sent: { icon: "🧾", label: "Factuur verstuurd", tone: "bg-stone-100" },
  invoice_paid: { icon: "💶", label: "Factuur betaald", tone: "bg-lime/20" },
  support_ticket: { icon: "🆘", label: "Support", tone: "bg-red-50" },
  stage_change: { icon: "🔄", label: "Stadium gewijzigd", tone: "bg-stone-100" },
  custom: { icon: "•", label: "Activity", tone: "bg-stone-100" },
};

function formatAuthor(row: NoteRow | ActivityRow): string {
  const u = Array.isArray(row.users) ? row.users[0] : row.users;
  return (
    [u?.first_name, u?.last_name].filter(Boolean).join(" ") || "Admin"
  );
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "zojuist";
  if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} dagen geleden`;
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CrmPanel({
  targetType,
  targetId,
  initialStage,
  initialNextAction,
  initialNextActionDueAt,
  source,
  utmSource,
  utmMedium,
  utmCampaign,
}: {
  targetType: TargetType;
  targetId: string;
  initialStage: FunnelStage;
  initialNextAction: string | null;
  initialNextActionDueAt: string | null;
  source?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}) {
  const supabase = await createClient();

  const [{ data: notes }, { data: activities }] = await Promise.all([
    supabase
      .from("crm_notes")
      .select(
        `id, body, created_at, author_user_id,
         users:author_user_id (first_name, last_name)`
      )
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("crm_activities")
      .select(
        `id, kind, summary, details, occurred_at, author_user_id,
         users:author_user_id (first_name, last_name)`
      )
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .order("occurred_at", { ascending: false })
      .limit(50),
  ]);

  const isStageOnly = targetType === "prospect";

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Linker kolom: stadium + actie + source */}
        <div className="space-y-4 lg:col-span-1">
          {!isStageOnly && (
            <CrmStageForm
              targetType={targetType as "employer" | "employee"}
              targetId={targetId}
              initialStage={initialStage}
              initialNextAction={initialNextAction}
              initialNextActionDueAt={initialNextActionDueAt}
            />
          )}

          {(source || utmSource || utmMedium || utmCampaign) && (
            <div className="bg-paper border border-stone-200 rounded-lg p-5">
              <span className="eyebrow">CRM · attributie</span>
              <div className="mt-3 space-y-1.5 text-sm">
                {source && (
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500">Bron</span>
                    <span className="font-medium text-right">{source}</span>
                  </div>
                )}
                {utmSource && (
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500">utm_source</span>
                    <span className="font-mono text-xs text-right">
                      {utmSource}
                    </span>
                  </div>
                )}
                {utmMedium && (
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500">utm_medium</span>
                    <span className="font-mono text-xs text-right">
                      {utmMedium}
                    </span>
                  </div>
                )}
                {utmCampaign && (
                  <div className="flex justify-between gap-2">
                    <span className="text-stone-500">utm_campaign</span>
                    <span className="font-mono text-xs text-right">
                      {utmCampaign}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rechter kolom: notities + activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-paper border border-stone-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="eyebrow">
                Notities ({(notes ?? []).length})
              </span>
            </div>
            <CrmNoteForm targetType={targetType} targetId={targetId} />

            {(notes ?? []).length > 0 && (
              <div className="mt-4 space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {(notes as NoteRow[]).map((n) => (
                  <div
                    key={n.id}
                    className="bg-cream border border-stone-200 rounded-md p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-ink">
                        {formatAuthor(n)}
                      </span>
                      <span className="text-xs text-stone-400">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-stone-700 whitespace-pre-wrap">
                      {n.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-paper border border-stone-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className="eyebrow">
                Activity timeline ({(activities ?? []).length})
              </span>
              <CrmActivityForm targetType={targetType} targetId={targetId} />
            </div>

            {(activities ?? []).length === 0 ? (
              <div className="text-sm text-stone-500 py-6 text-center">
                Nog geen activity. Log een gesprek, mail of meeting hierboven.
              </div>
            ) : (
              <ol className="relative border-l-2 border-stone-100 ml-3 space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {(activities as ActivityRow[]).map((a) => {
                  const meta = KIND_META[a.kind] ?? KIND_META.custom;
                  return (
                    <li key={a.id} className="ml-4">
                      <span className="absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full bg-paper border-2 border-stone-200 text-[10px]">
                        {meta.icon}
                      </span>
                      <div
                        className={`rounded-md p-3 border border-stone-200 ${meta.tone}`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-0.5">
                          <span className="text-xs font-semibold uppercase tracking-wide text-ink">
                            {meta.label}
                          </span>
                          <span className="text-xs text-stone-500">
                            {new Date(a.occurred_at).toLocaleDateString(
                              "nl-NL",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}{" "}
                            · {timeAgo(a.occurred_at)}
                          </span>
                        </div>
                        <p className="text-sm text-stone-800 mt-0.5">
                          {a.summary}
                        </p>
                        {a.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-stone-500 hover:text-ink">
                              Meer details
                            </summary>
                            <p className="text-xs text-stone-700 whitespace-pre-wrap mt-1.5 bg-paper rounded p-2">
                              {a.details}
                            </p>
                          </details>
                        )}
                        <div className="text-xs text-stone-400 mt-1">
                          door {formatAuthor(a)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
