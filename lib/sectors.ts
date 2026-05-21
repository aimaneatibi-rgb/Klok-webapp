// Centrale sectorenlijst — gebruikt door signup, profiel, instellingen + admin views
// Sluit aan op de sector_type enum in supabase-schema.sql

export const SECTORS = [
  // Klassiek flex-werk
  { value: "horeca", label: "Horeca" },
  { value: "retail", label: "Retail / Detailhandel" },
  { value: "wholesale", label: "Groothandel" },
  { value: "logistics", label: "Logistiek & Transport" },
  { value: "delivery", label: "Bezorging" },
  // Vakwerk
  { value: "construction", label: "Bouw" },
  { value: "automotive", label: "Automotive" },
  { value: "manufacturing", label: "Industrie & Productie" },
  { value: "cleaning", label: "Schoonmaak" },
  { value: "security", label: "Beveiliging" },
  // Zorg & welzijn
  { value: "healthcare", label: "Zorg & Welzijn" },
  { value: "childcare", label: "Kinderopvang" },
  { value: "education", label: "Onderwijs" },
  // Dienstverlening
  { value: "ict", label: "ICT & Telecom" },
  { value: "finance", label: "Financieel & Verzekeringen" },
  { value: "marketing_media", label: "Marketing & Media" },
  { value: "real_estate", label: "Vastgoed" },
  { value: "government_nonprofit", label: "Overheid & Non-profit" },
  // Lifestyle
  { value: "beauty_wellness", label: "Schoonheid & Wellness" },
  { value: "personal_services", label: "Persoonlijke dienstverlening" },
  { value: "hospitality_lodging", label: "Hotel & Accommodatie" },
  { value: "culture_sports", label: "Cultuur, Sport & Recreatie" },
  { value: "events", label: "Evenementen" },
  // Overig
  { value: "agriculture", label: "Land- & Tuinbouw" },
  { value: "energy_utilities", label: "Energie & Nutsvoorzieningen" },
] as const;

export type SectorValue = (typeof SECTORS)[number]["value"];

export const SECTOR_LABELS: Record<string, string> = Object.fromEntries(
  SECTORS.map((s) => [s.value, s.label])
);

export function getSectorLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return SECTOR_LABELS[value] ?? value;
}
