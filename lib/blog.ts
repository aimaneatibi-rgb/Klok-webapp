// Blog-content — statisch beheerd in code (geen CMS nodig voor de start).
// Nieuwe post toevoegen = nieuw object bovenaan POSTS. Slug = URL.

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Werknemers" | "Werkgevers" | "Platform" | "App";
  tint: "lime" | "sky" | "peach" | "lilac" | "mint" | "sand";
  emoji: string;
  date: string; // ISO
  readingMinutes: number;
  author: string;
  blocks: BlogBlock[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "de-klok-app-komt-eraan",
    title: "De KLOK-app komt eraan: solliciteren en shifts vanuit je broekzak",
    excerpt:
      "We bouwen aan een mobiele app voor iOS en Android. Dit kun je verwachten — en zo krijg je als eerste toegang.",
    category: "App",
    tint: "lime",
    emoji: "📱",
    date: "2026-07-28",
    readingMinutes: 4,
    author: "Team KLOK",
    blocks: [
      {
        type: "p",
        text: "Werk zoeken doe je niet achter een bureau. Je scrolt in de trein, checkt je telefoon in de pauze en beslist in dertig seconden of iets bij je past. Daarom bouwen we de KLOK-app: de volledige marktplaats voor werk, geoptimaliseerd voor je telefoon.",
      },
      { type: "h2", text: "Wat kan de app straks?" },
      {
        type: "list",
        items: [
          "Vacatures en shifts zoeken met filters op afstand, sector en salaris",
          "Solliciteren met één tik — je profiel en cv staan al klaar",
          "Push-notificaties zodra er werk verschijnt dat bij je past",
          "Je uren, uitbetalingen en referral-inkomsten live volgen",
          "Voor werkgevers: reacties beoordelen en shifts vullen vanaf je telefoon",
        ],
      },
      { type: "h2", text: "Wanneer komt hij?" },
      {
        type: "p",
        text: "De app verschijnt in de App Store en Google Play zodra de marktplaats goed gevuld is — de webversie is en blijft altijd volledig bruikbaar. Wil je er als eerste bij zijn? Maak een gratis account aan: iedereen op de wachtlijst krijgt vroege toegang tot de app.",
      },
      {
        type: "quote",
        text: "Eén profiel, overal werken: web vandaag, app binnenkort.",
      },
    ],
  },
  {
    slug: "cv-dat-werkgevers-echt-lezen",
    title: "Zo schrijf je een cv dat werkgevers écht lezen",
    excerpt:
      "Werkgevers scannen een cv in zes seconden. Met deze vijf aanpassingen kom jij door die eerste scan heen.",
    category: "Werknemers",
    tint: "sky",
    emoji: "📄",
    date: "2026-07-21",
    readingMinutes: 5,
    author: "Team KLOK",
    blocks: [
      {
        type: "p",
        text: "Een werkgever die twintig reacties krijgt, leest niet twintig levensverhalen. De eerste scan duurt zes seconden: wie ben je, wat heb je gedaan, kun je beginnen? Je cv heeft één taak — die scan overleven.",
      },
      { type: "h2", text: "1. Begin met wat je nú kunt" },
      {
        type: "p",
        text: "Zet bovenaan drie regels: je rol, je ervaring in jaren en je beschikbaarheid. \"Horecamedewerker, 4 jaar ervaring, per direct beschikbaar in Utrecht\" zegt meer dan een halve pagina introductie.",
      },
      { type: "h2", text: "2. Cijfers verslaan bijvoeglijke naamwoorden" },
      {
        type: "p",
        text: "\"Verantwoordelijk en gemotiveerd\" schrijft iedereen. \"Draaide zelfstandig avonddiensten met 120+ couverts\" schrijft bijna niemand — en dát blijft hangen.",
      },
      { type: "h2", text: "3. Kort is een feature" },
      {
        type: "p",
        text: "Eén pagina volstaat vrijwel altijd. Schrap bijbanen van tien jaar geleden die niets toevoegen. Elke regel die blijft staan, moet de vraag beantwoorden: helpt dit mij aan dít werk?",
      },
      { type: "h2", text: "4. Maak je beschikbaarheid concreet" },
      {
        type: "p",
        text: "Werkgevers op KLOK zoeken vaak op korte termijn. \"Beschikbaar ma/di/do en in het weekend\" maakt het verschil tussen een reactie en een match.",
      },
      { type: "h2", text: "5. Vul je KLOK-profiel volledig in" },
      {
        type: "p",
        text: "Op KLOK reageer je alleen met een compleet profiel — dat is bewust. Een compleet profiel met foto, ervaring en beschikbaarheid wordt aanzienlijk vaker bekeken én serieuzer genomen.",
      },
    ],
  },
  {
    slug: "flexwerk-of-vast-contract",
    title: "Flexwerk of vast contract: wat past bij jou?",
    excerpt:
      "Losse shifts of zekerheid voor de lange termijn? Zo kies je wat past bij je leven — en waarom het geen definitieve keuze is.",
    category: "Werknemers",
    tint: "mint",
    emoji: "⚖️",
    date: "2026-07-14",
    readingMinutes: 6,
    author: "Team KLOK",
    blocks: [
      {
        type: "p",
        text: "De arbeidsmarkt is geen keuzemenu met één goed antwoord. Flexwerk en vaste contracten hebben allebei échte voordelen — de vraag is wat past bij jouw fase, agenda en portemonnee.",
      },
      { type: "h2", text: "Wanneer flexwerk wint" },
      {
        type: "list",
        items: [
          "Je studeert of combineert werk met zorg — jij bepaalt wanneer je werkt",
          "Je wilt sectoren uitproberen voordat je ergens vast gaat",
          "Je wilt snel verdienen zonder lang sollicitatietraject",
          "Je hebt al een baan en wilt er losse diensten naast",
        ],
      },
      { type: "h2", text: "Wanneer vast wint" },
      {
        type: "list",
        items: [
          "Je wilt een hypotheek of huurcontract — vast inkomen telt zwaarder",
          "Je wilt groeien binnen één team of bedrijf",
          "Je vindt rust belangrijker dan flexibiliteit",
        ],
      },
      { type: "h2", text: "Het eerlijke antwoord: het is geen eindkeuze" },
      {
        type: "p",
        text: "Veel mensen beginnen flexibel en rollen via een shift een vast contract in — de werkgever kent je dan al. Op KLOK staan beide werkvormen op één marktplaats, met één profiel. Je hoeft dus niet te kiezen voordat je begint.",
      },
    ],
  },
  {
    slug: "wat-kost-een-uitzendbureau-echt",
    title: "Wat kost een uitzendbureau je écht als werkgever?",
    excerpt:
      "Marges van 25 tot 30% zijn normaal in de uitzendbranche. We rekenen voor wat dat betekent — en hoe een marktplaats dat anders doet.",
    category: "Werkgevers",
    tint: "peach",
    emoji: "🧮",
    date: "2026-07-07",
    readingMinutes: 5,
    author: "Team KLOK",
    blocks: [
      {
        type: "p",
        text: "Een uitzendkracht van € 14 per uur kost je bij een klassiek uitzendbureau al snel € 24 tot € 28 per uur. Het verschil? De marge van het bureau — doorgaans 25 tot 30% bovenop de volledige loonkosten.",
      },
      { type: "h2", text: "Waar betaal je eigenlijk voor?" },
      {
        type: "p",
        text: "Deels voor echte diensten: werving, contracten, verloning, risico-afdekking. Maar een groot deel zit in overhead — vestigingen, accountmanagers, marketing. Kosten die weinig te maken hebben met jouw vacature.",
      },
      { type: "h2", text: "De rekensom bij 1 fulltimer per jaar" },
      {
        type: "list",
        items: [
          "Uitzendbureau, 30% marge: ruim € 15.000 marge per jaar per kracht",
          "KLOK-marktplaats: 11,5% platformfee — de contract-partner regelt verloning",
          "Vaste vacature op KLOK: € 195 per maand, opzegbaar, geen succes-fee",
        ],
      },
      {
        type: "p",
        text: "Het verschil loopt per medewerker in de duizenden euro's per jaar. Vermenigvuldig dat met je flexibele schil en je begrijpt waarom marktplaatsen de uitzendbranche aan het opschudden zijn.",
      },
      { type: "h2", text: "Wanneer is een bureau wél logisch?" },
      {
        type: "p",
        text: "Volledige ontzorging heeft waarde als je geen tijd hebt om ook maar íets zelf te doen. Maar plaatsen op KLOK kost een kwartier — en je kiest per match alsnog een contract-partner die de administratie regelt.",
      },
    ],
  },
  {
    slug: "personeelstekort-horeca-5-tactieken",
    title: "Personeelstekort in de horeca: 5 tactieken die nú werken",
    excerpt:
      "Wachten tot de arbeidsmarkt ontspant is geen strategie. Vijf dingen die horecaondernemers vandaag anders kunnen doen.",
    category: "Werkgevers",
    tint: "sand",
    emoji: "🍽️",
    date: "2026-06-30",
    readingMinutes: 6,
    author: "Team KLOK",
    blocks: [
      {
        type: "p",
        text: "Elke horecaondernemer kent het: de zaak zit vol, het rooster niet. Structureel personeelstekort los je niet op met één vacaturetekst — wel met een andere aanpak van werven en behouden.",
      },
      { type: "h2", text: "1. Reageer binnen 24 uur" },
      {
        type: "p",
        text: "Goede kandidaten zijn binnen dagen weg. Wie binnen een dag reageert, wint het vaker van het bedrijf dat 'volgende week even belt'. Zet notificaties aan en behandel reacties als reserveringen: direct bevestigen.",
      },
      { type: "h2", text: "2. Schrijf de dienst, niet de functie" },
      {
        type: "p",
        text: "\"Allround horecamedewerker m/v\" zegt niets. \"Vrijdag- en zaterdagavond, terras van 80 plekken, team van 6, € 15,50 per uur\" — dáár reageren mensen op. Concreet wint van compleet.",
      },
      { type: "h2", text: "3. Zet je eigen team in als wervingskanaal" },
      {
        type: "p",
        text: "Je beste mensen kennen mensen zoals zijzelf. Op KLOK verdient een aanbrenger levenslang € 1 per gewerkt uur mee — je team heeft dus een echte reden om vrienden aan te dragen.",
      },
      { type: "h2", text: "4. Denk in schillen, niet in vacatures" },
      {
        type: "p",
        text: "Een vaste kern plus een flexibele schil van bekende gezichten is stabieler dan telkens nieuwe fulltimers zoeken. Bouw een poule op van mensen die je zaak al kennen.",
      },
      { type: "h2", text: "5. Wees eerlijk over je prijs" },
      {
        type: "p",
        text: "Salarissen verzwijgen kost reacties. Vacatures met een concreet bedrag krijgen aantoonbaar meer én betere reacties. Kun je niet boven de markt betalen? Compenseer zichtbaar: vaste vrije dagen, fooi-verdeling, maaltijden.",
      },
    ],
  },
  {
    slug: "levenslang-meeverdienen-met-referrals",
    title: "Zo werkt levenslang meeverdienen met referrals bij KLOK",
    excerpt:
      "Breng iemand aan en verdien € 1 per gewerkt uur of € 100+ per maand — zolang die persoon werkt. Geen MLM, wél netwerk-economie.",
    category: "Platform",
    tint: "lilac",
    emoji: "💶",
    date: "2026-06-23",
    readingMinutes: 4,
    author: "Team KLOK",
    blocks: [
      {
        type: "p",
        text: "De meeste platforms betalen een eenmalige tekenbonus en klaar. Wij draaien het om: wie het netwerk sterker maakt, verdient structureel mee. Zo bouwt iedereen aan hetzelfde platform — en profiteert iedereen.",
      },
      { type: "h2", text: "De regeling in het kort" },
      {
        type: "list",
        items: [
          "Shifts: € 1 per uur dat jouw aangebrachte persoon werkt — levenslang",
          "Vaste contracten: € 100+ per maand zolang het contract loopt",
          "Onbeperkt aanbrengen: elke plaatsing is een aparte bonus",
          "Uitbetaling in cash of credits, inzichtelijk in je dashboard",
        ],
      },
      { type: "h2", text: "Waarom dit geen MLM is" },
      {
        type: "p",
        text: "Er zijn geen lagen, geen inleg en geen doorverkoop. Je verdient alleen aan mensen die jij persoonlijk hebt aangebracht en die écht werken. De werkgever betaalt de referral als onderdeel van de transparante fee — niemand betaalt om mee te doen.",
      },
      { type: "h2", text: "Rekenvoorbeeld" },
      {
        type: "p",
        text: "Breng vijf vrienden aan die gemiddeld 44 uur per maand werken: dat is € 220 per maand passief — elke maand opnieuw, zolang ze actief zijn. Wie vroeg netwerkt op een groeiende marktplaats, plukt daar het langst de vruchten van.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
