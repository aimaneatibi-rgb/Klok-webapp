export default function PoolPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <span className="eyebrow">— FAVORIETE WERKNEMERS</span>
      <h1 className="font-serif text-4xl font-medium tracking-tight mt-2 mb-2">
        Mijn pool
      </h1>
      <p className="text-stone-500 text-sm mb-8">
        Werknemers die je eerder hebt ingehuurd. Markeer favorieten voor snelle
        herinhuur.
      </p>

      <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
        <div className="font-serif text-2xl text-stone-700 mb-2">
          Nog geen pool
        </div>
        <p className="text-stone-500 text-sm">
          Werknemers verschijnen hier zodra ze hun eerste shift bij jou voltooien.
        </p>
      </div>

      {/* Cursor: prompt 5.1 voor pool functionaliteit */}
    </div>
  );
}
