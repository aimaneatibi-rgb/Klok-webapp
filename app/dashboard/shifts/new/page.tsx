import Link from "next/link";

export default function NewShiftPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/dashboard/shifts" className="eyebrow text-stone-500 hover:text-ink">
        ← Terug naar shifts
      </Link>
      <h1 className="font-serif text-4xl font-medium tracking-tight mt-4 mb-2">
        Nieuwe shift plaatsen
      </h1>
      <p className="text-stone-500 text-sm mb-8">
        Vul de details in. Je kunt later nog dingen aanpassen.
      </p>

      <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
        <p className="text-stone-700">
          📌 <strong>Cursor build instructie:</strong>
        </p>
        <p className="text-sm text-stone-500 mt-3 max-w-xl mx-auto">
          Open Cursor chat (Ctrl+L), kopieer prompt 3.3 uit{" "}
          <code className="bg-stone-100 px-1 rounded">CURSOR-PROMPTS.md</code>{" "}
          en laat Cursor het multi-step formulier voor je bouwen.
        </p>
      </div>
    </div>
  );
}
