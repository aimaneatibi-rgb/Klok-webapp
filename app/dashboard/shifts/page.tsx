import Link from "next/link";

export default function ShiftsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <span className="eyebrow">— FLEX-WERK</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Shifts
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Plaats shifts en zie wie er reageert.
          </p>
        </div>
        <Link
          href="/dashboard/shifts/new"
          className="bg-lime text-ink px-4 py-2 rounded-md font-semibold text-sm hover:bg-lime-dark"
        >
          + Nieuwe shift
        </Link>
      </div>

      <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
        <div className="font-serif text-2xl text-stone-700 mb-2">
          Nog geen shifts
        </div>
        <p className="text-stone-500 text-sm mb-6">
          Plaats je eerste shift en vul &apos;m vaak binnen het uur.
        </p>
        <Link
          href="/dashboard/shifts/new"
          className="inline-block bg-ink text-paper px-5 py-2.5 rounded-md font-medium text-sm hover:bg-ink-soft"
        >
          + Eerste shift plaatsen
        </Link>
      </div>

      {/* TIP: laat Cursor deze pagina compleet maken met:
          "Build a shifts list table with filters (alle/open/bevestigd/etc), 
          fetch from supabase, real-time updates" */}
    </div>
  );
}
