// Voorbeeld-vacatures voor de publieke vacature-browser.
// Worden alleen getoond wanneer de database (nog) geen open vacatures
// teruggeeft — zo laat de marktplaats altijd zien hoe hij eruitziet
// zodra hij gevuld is. Kaarten dragen een "Voorbeeld"-label.

export type PublicVacancy = {
  id: string;
  title: string;
  description: string;
  companyName: string;
  sector: string; // sector_type value uit lib/sectors.ts
  city: string;
  hoursPerWeek: number;
  contractLabel: string;
  salaryMin: number | null; // per maand, euro's
  salaryMax: number | null;
  postedAgo: string;
  isDemo: boolean;
};

export const DEMO_VACANCIES: PublicVacancy[] = [
  {
    id: "demo-1",
    title: "Zelfstandig werkend kok",
    description:
      "Brasserie in het centrum zoekt een kok die zelfstandig de avondservice draait. Team van 6, verse kaart, 120+ couverts op piekdagen. Doorgroei naar souschef bespreekbaar.",
    companyName: "Brasserie Centro",
    sector: "horeca",
    city: "Amsterdam",
    hoursPerWeek: 36,
    contractLabel: "Vast contract",
    salaryMin: 2900,
    salaryMax: 3400,
    postedAgo: "2 uur geleden",
    isDemo: true,
  },
  {
    id: "demo-2",
    title: "Verzorgende IG (nacht)",
    description:
      "Kleinschalige woonzorglocatie zoekt verzorgenden IG voor nachtdiensten. Vast rooster, vast team, reiskostenvergoeding en nachttoeslag conform cao.",
    companyName: "ZorgVitaal",
    sector: "healthcare",
    city: "Rotterdam",
    hoursPerWeek: 28,
    contractLabel: "12 maanden",
    salaryMin: 2750,
    salaryMax: 3250,
    postedAgo: "5 uur geleden",
    isDemo: true,
  },
  {
    id: "demo-3",
    title: "Heftruckchauffeur dagdienst",
    description:
      "Distributiecentrum zoekt heftruckchauffeurs met geldig certificaat. Dagdienst ma-vr, moderne loods, gratis parkeren. Certificaat verlopen? Wij regelen de hercertificering.",
    companyName: "FastLane Logistics",
    sector: "logistics",
    city: "Eindhoven",
    hoursPerWeek: 40,
    contractLabel: "7 maanden",
    salaryMin: 2600,
    salaryMax: 2950,
    postedAgo: "vandaag",
    isDemo: true,
  },
  {
    id: "demo-4",
    title: "Verkoopmedewerker mode",
    description:
      "Boetiek zoekt een verkoper met gevoel voor stijl en service. Donderdag t/m zaterdag, personeelskorting en bonus op teamomzet.",
    companyName: "Mode & Meer",
    sector: "retail",
    city: "Utrecht",
    hoursPerWeek: 24,
    contractLabel: "6 maanden",
    salaryMin: 2200,
    salaryMax: 2500,
    postedAgo: "gisteren",
    isDemo: true,
  },
  {
    id: "demo-5",
    title: "Junior servicemonteur",
    description:
      "Installatiebedrijf leidt je in 12 maanden op tot zelfstandig servicemonteur. Rijbewijs B vereist, bus van de zaak, opleidingsbudget en doorgroeipad.",
    companyName: "TechFlow Installaties",
    sector: "construction",
    city: "Den Haag",
    hoursPerWeek: 40,
    contractLabel: "Vast contract",
    salaryMin: 2500,
    salaryMax: 3100,
    postedAgo: "gisteren",
    isDemo: true,
  },
  {
    id: "demo-6",
    title: "Pedagogisch medewerker BSO",
    description:
      "BSO met eigen moestuin en sportveld zoekt een enthousiaste pm'er voor ma/di/do-middagen. Diploma vereist, ruimte voor eigen activiteiten-ideeën.",
    companyName: "Kindercentrum De Boomhut",
    sector: "childcare",
    city: "Groningen",
    hoursPerWeek: 20,
    contractLabel: "12 maanden",
    salaryMin: 2350,
    salaryMax: 2700,
    postedAgo: "2 dagen geleden",
    isDemo: true,
  },
  {
    id: "demo-7",
    title: "Nachtreceptionist hotel",
    description:
      "Boutique-hotel (74 kamers) zoekt een nachtreceptionist. Je draait zelfstandig de nacht: check-ins, veiligheidsrondes en de dagafsluiting. Talenkennis is een plus.",
    companyName: "Hotel Meridiaan",
    sector: "hospitality_lodging",
    city: "Maastricht",
    hoursPerWeek: 32,
    contractLabel: "Vast contract",
    salaryMin: 2450,
    salaryMax: 2800,
    postedAgo: "3 dagen geleden",
    isDemo: true,
  },
  {
    id: "demo-8",
    title: "Bezorger e-bike (avond)",
    description:
      "Bezorghub zoekt avondbezorgers op e-bike, 17:00–22:00. Vast uurloon plus fooien, telefoonhouder en regenkleding van de zaak.",
    companyName: "Rappido Delivery",
    sector: "delivery",
    city: "Amsterdam",
    hoursPerWeek: 16,
    contractLabel: "6 maanden",
    salaryMin: 2100,
    salaryMax: 2300,
    postedAgo: "3 dagen geleden",
    isDemo: true,
  },
  {
    id: "demo-9",
    title: "Objectbeveiliger (ND-diploma)",
    description:
      "Beveiligingsdiensten op kantoorlocatie in de avond en het weekend. ND-diploma vereist. Vaste locatie, geen wisselende posten.",
    companyName: "SecureBase",
    sector: "security",
    city: "Utrecht",
    hoursPerWeek: 32,
    contractLabel: "12 maanden",
    salaryMin: 2550,
    salaryMax: 2900,
    postedAgo: "4 dagen geleden",
    isDemo: true,
  },
  {
    id: "demo-10",
    title: "Allround schoonmaakmedewerker",
    description:
      "Ochtenddiensten (06:00–10:00) op twee vaste kantoorlocaties. Reistijd tussen locaties wordt doorbetaald, ov-vergoeding inbegrepen.",
    companyName: "CleanCo Facilitair",
    sector: "cleaning",
    city: "Rotterdam",
    hoursPerWeek: 20,
    contractLabel: "12 maanden",
    salaryMin: 2150,
    salaryMax: 2400,
    postedAgo: "5 dagen geleden",
    isDemo: true,
  },
  {
    id: "demo-11",
    title: "Productiemedewerker 2-ploegen",
    description:
      "Voedingsmiddelenproducent zoekt productiemedewerkers voor de inpaklijn. Twee-ploegendienst met toeslag, gratis lunch en snel schakelen naar vast.",
    companyName: "Bakkerij Van Steen",
    sector: "manufacturing",
    city: "Tilburg",
    hoursPerWeek: 38,
    contractLabel: "7 maanden",
    salaryMin: 2400,
    salaryMax: 2750,
    postedAgo: "5 dagen geleden",
    isDemo: true,
  },
  {
    id: "demo-12",
    title: "Gastvrouw/gastheer congrescentrum",
    description:
      "Ontvang gasten bij zakelijke events: registratie, garderobe en zaalbegeleiding. Flexibel inzetbaar op doordeweekse dagen, representatief en gastgericht.",
    companyName: "Eventix Congressen",
    sector: "events",
    city: "Den Bosch",
    hoursPerWeek: 24,
    contractLabel: "6 maanden",
    salaryMin: 2250,
    salaryMax: 2550,
    postedAgo: "1 week geleden",
    isDemo: true,
  },
];
