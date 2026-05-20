export default function VacaturesPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <span className="eyebrow">— VASTE BANEN</span>
      <h1 className="font-serif text-4xl font-medium tracking-tight mt-2 mb-2">
        Vacatures
      </h1>
      <p className="text-stone-500 text-sm mb-8">
        Plaats vaste vacatures. €350 listing-fee + match-fee bij plaatsing.
      </p>

      <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
        <div className="font-serif text-2xl text-stone-700 mb-2">
          Nog geen vacatures
        </div>
        <p className="text-stone-500 text-sm mb-6">
          Open een vaste positie en bouw je team uit.
        </p>
        <button className="bg-lime text-ink px-5 py-2.5 rounded-md font-semibold text-sm hover:bg-lime-dark">
          + Vacature plaatsen
        </button>
      </div>

      {/* Cursor: prompt 4.1 + 4.2 voor volledige vacatures functionaliteit */}
    </div>
  );
}
