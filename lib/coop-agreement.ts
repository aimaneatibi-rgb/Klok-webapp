// Samenwerkingsovereenkomst KLOK Works ↔ Opdrachtgever
// Versie 1.0 — juridisch gereviewd en goedgekeurd 2026-05-22
// Versie 1.1 — 2026-08-01: nieuw prijsmodel (14 dagen proefperiode,
//   € 195 met staffel € 175 / € 149, betaling via incasso óf factuur).
//   LET OP: wijziging t.o.v. de goedgekeurde 1.0 — juridische hercheck aanbevolen.

export const KLOK_LEGAL_ENTITY = {
  name: "KLOK Works",
  address: "Jaarsveld 6",
  postcode: "6715 GE",
  city: "Ede",
  country: "Nederland",
  kvk: "[KvK-nummer in te vullen]",
  vat: "[BTW-nummer in te vullen]",
  email: "hallo@klokworks.nl",
} as const;

export type AgreementInput = {
  opdrachtgever: {
    company_name: string;
    legal_name: string | null;
    kvk_number: string | null;
    vat_number: string | null;
    address: Record<string, string> | null;
  };
  signedAt?: string;
  version: string;
};

export function generateCoopAgreement(input: AgreementInput): {
  title: string;
  body: string;
} {
  const o = input.opdrachtgever;
  const addrStr = o.address
    ? `${o.address.street ?? ""} ${o.address.house_number ?? ""}, ${o.address.postcode ?? ""} ${o.address.city ?? ""}`.trim()
    : "[adres opdrachtgever]";
  const partyName = o.legal_name ?? o.company_name;

  return {
    title: "Samenwerkingsovereenkomst KLOK Works",
    body: `SAMENWERKINGSOVEREENKOMST

Versie: ${input.version} · Datum: ${input.signedAt ? new Date(input.signedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }) : new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}

DE ONDERGETEKENDEN:

1. KLOK Works, gevestigd te ${KLOK_LEGAL_ENTITY.address}, ${KLOK_LEGAL_ENTITY.postcode} ${KLOK_LEGAL_ENTITY.city} (Nederland), ingeschreven bij de Kamer van Koophandel onder nummer ${KLOK_LEGAL_ENTITY.kvk}, hierna te noemen: "KLOK Works", "het Platform" of "wij";

2. ${partyName}${o.kvk_number ? `, KvK-nummer ${o.kvk_number}` : ""}${o.vat_number ? `, BTW-nummer ${o.vat_number}` : ""}, gevestigd te ${addrStr}, hierna te noemen: "Opdrachtgever" of "u";

OVERWEGENDE DAT:

a) KLOK Works een digitaal platform exploiteert waarmee Opdrachtgevers en
   Werknemers (zowel flex-werkers als kandidaten voor vaste banen) direct met
   elkaar in contact worden gebracht;

b) KLOK Works UITSLUITEND fungeert als technologische marktplaats en EXPLICIET
   GEEN uitzendonderneming, payroll-onderneming, detacheringsbureau of
   werkgever is in de zin van de Wet allocatie arbeidskrachten door
   intermediairs (WAADI) of Boek 7 BW;

c) KLOK Works geen partij is bij de arbeidsrelatie tussen Opdrachtgever en
   Werknemer; deze arbeidsrelatie wordt rechtstreeks aangegaan tussen
   Opdrachtgever en Werknemer (eventueel via een door Opdrachtgever zelf
   gekozen payroll-partij);

d) Opdrachtgever gebruik wenst te maken van het Platform onder de hierna
   omschreven voorwaarden;

KOMEN ALS VOLGT OVEREEN:

────────────────────────────────────────────────────────────
ARTIKEL 1 — DEFINITIES
────────────────────────────────────────────────────────────

1.1 "Platform": de software-as-a-service applicatie van KLOK Works, bereikbaar
    via app.klok.works en gerelateerde domeinen.
1.2 "Shift": een eenmalige werkopdracht voor flex-werk die Opdrachtgever via
    het Platform publiceert.
1.3 "Vacature": een vaste positie die Opdrachtgever via het Platform
    publiceert.
1.4 "Werknemer": een natuurlijk persoon die via het Platform reageert op
    Shifts en/of solliciteert op Vacatures, ongeacht de juridische
    arbeidsrelatie (loondienst, uitzendkracht, ZZP'er, payroll).
1.5 "Match": het succesvol koppelen van een Werknemer aan een Shift of
    Vacature via het Platform.

────────────────────────────────────────────────────────────
ARTIKEL 2 — AARD VAN DE SAMENWERKING
────────────────────────────────────────────────────────────

2.1 KLOK Works treedt UITSLUITEND op als digitale marktplaats. Wij brengen
    Opdrachtgevers en Werknemers met elkaar in contact, faciliteren
    communicatie, en bieden hulpmiddelen voor administratie (waaronder
    contracttemplates).

2.2 KLOK Works is NIET:
    (a) werkgever van de Werknemer;
    (b) uitzendonderneming in de zin van WAADI of overige wet- en regelgeving;
    (c) payroll-onderneming;
    (d) partij bij enige arbeidsovereenkomst of opdrachtovereenkomst tussen
        Opdrachtgever en Werknemer;
    (e) verantwoordelijk voor afdracht van loonbelasting, sociale lasten,
        pensioenpremies of vakantiegeld;
    (f) verplicht tot het garanderen van Werknemers, kwaliteit, beschikbaarheid
        of geschiktheid.

2.3 Opdrachtgever erkent dat zij ZELF de werkgever is (juridisch en
    operationeel) of zelf een payroll-partner kiest. Alle verplichtingen
    voortvloeiend uit de arbeidsrelatie rusten op Opdrachtgever.

2.4 Werknemer en Opdrachtgever sluiten zelfstandig een arbeids- of
    opdrachtovereenkomst. KLOK Works levert hierbij optioneel een
    templatecontract; aan deze template kunnen geen rechten worden ontleend.

────────────────────────────────────────────────────────────
ARTIKEL 3 — TARIEVEN
────────────────────────────────────────────────────────────

3.1 SHIFTS — Platformfee
    Voor elke Shift die via het Platform tot een Match leidt en wordt uitgevoerd,
    is Opdrachtgever een platformfee van 11,5% (elf en een half procent) van
    het bruto uurloon × gewerkte uren verschuldigd, exclusief BTW.

3.2 VACATURES — Maandelijkse fee
    Voor elke Vacature die zich in status "open" of "paused" op het Platform
    bevindt, is Opdrachtgever na afloop van de proefperiode (art. 3.3) een
    maandelijkse fee verschuldigd van € 195,- (honderdvijfennegentig euro)
    exclusief BTW, ongeacht of de Vacature daadwerkelijk wordt ingevuld.

    Volumekorting (staffel) is van toepassing; het staffeltarief geldt voor
    álle gelijktijdig actieve Vacatures:
    - 1 actieve Vacature: € 195 per maand per Vacature
    - 2-3 actieve Vacatures: € 175 per maand per Vacature
    - 4 of meer actieve Vacatures: € 149 per maand per Vacature

3.3 PROEFPERIODE & FACTURATIECYCLUS
    Elke Vacature kent een gratis proefperiode van 14 (veertien) dagen vanaf
    plaatsing. Wordt de Vacature binnen de proefperiode offline gehaald, dan
    is geen fee verschuldigd. Na afloop van de proefperiode wordt de
    maandelijkse fee per Vacature vooraf in rekening gebracht — naar keuze
    van Opdrachtgever via automatische SEPA-incasso (via Mollie) of op
    factuur — telkens per maand vanaf het einde van de proefperiode.

3.4 EINDE VACATURE
    Opdrachtgever is zélf verantwoordelijk voor het verwijderen of archiveren
    van Vacatures via het Platform. KLOK Works rekent de maandelijkse fee
    door zolang de Vacature de status "open" of "paused" heeft. Bij
    verwijdering halverwege een maand vindt GEEN restitutie plaats voor de
    resterende dagen.

3.5 BETAALTERMIJN
    Facturen dienen binnen 14 dagen na factuurdatum te worden voldaan via
    SEPA-incasso of overboeking. Bij niet-tijdige betaling is Opdrachtgever
    van rechtswege in verzuim en is wettelijke handelsrente verschuldigd
    (Wet betaalachterstanden bij handelstransacties).

3.6 KOSTENBEDING
    Bij verzuim worden buitengerechtelijke incassokosten conform de Wet
    Incassokosten (WIK) in rekening gebracht, met een minimum van € 40,-.

3.7 OPSCHORTING DIENST
    KLOK Works behoudt het recht de dienstverlening op te schorten of de
    accountstoegang te blokkeren bij betaalachterstand van meer dan 30 dagen,
    onverminderd het recht op vergoeding van alle openstaande bedragen.

────────────────────────────────────────────────────────────
ARTIKEL 4 — VERPLICHTINGEN OPDRACHTGEVER
────────────────────────────────────────────────────────────

4.1 Opdrachtgever:
    (a) is volledig verantwoordelijk voor naleving van Nederlandse
        arbeidswetgeving, fiscale verplichtingen, sociale zekerheidswetten en
        sectorale CAO's ten aanzien van zijn Werknemers;
    (b) verwerkt persoonsgegevens van Werknemers (waaronder BSN, IBAN,
        geboortedatum) conform de AVG/GDPR en deelt deze NIET met derden
        zonder grondslag;
    (c) draagt zorg voor een veilige werkomgeving conform de Arbowet;
    (d) gebruikt het Platform uitsluitend voor legitieme zakelijke doeleinden
        en verstrekt geen onjuiste of misleidende informatie;
    (e) is verantwoordelijk voor het tijdig en correct uitbetalen van loon /
        factuurbedragen aan Werknemers (eventueel via een door Opdrachtgever
        gekozen payroll-partij);
    (f) onthoudt zich van het benaderen van Werknemers buiten het Platform om
        de platformfee te omzeilen ("disintermediatie"); zie artikel 4.2.

4.2 ANTI-DISINTERMEDIATIE
    Indien Opdrachtgever binnen 12 maanden na een initiële Match (via het
    Platform) met dezelfde Werknemer een aanvullende werkrelatie aangaat
    BUITEN het Platform om platformfees te ontwijken, is Opdrachtgever een
    direct opeisbare boete verschuldigd van € 2.500,- per overtreding,
    onverminderd het recht van KLOK Works op aanvullende schadevergoeding.

────────────────────────────────────────────────────────────
ARTIKEL 5 — VERPLICHTINGEN KLOK WORKS
────────────────────────────────────────────────────────────

5.1 KLOK Works levert het Platform "as-is" en spant zich naar redelijkheid in
    om het Platform 24/7 beschikbaar te houden, met uitzondering van geplande
    onderhoud en overmacht.

5.2 KLOK Works draagt zorg voor passende technische en organisatorische
    maatregelen ter bescherming van Opdrachtgever-data conform de AVG.

5.3 KLOK Works verstrekt op verzoek facturen, betalingsoverzichten en
    relevante platformdata.

────────────────────────────────────────────────────────────
ARTIKEL 6 — AANSPRAKELIJKHEID
────────────────────────────────────────────────────────────

6.1 KLOK Works is niet aansprakelijk voor:
    (a) schade voortvloeiend uit handelen of nalaten van Werknemers (zoals
        no-shows, schade aan eigendommen Opdrachtgever, diefstal, etc.);
    (b) onjuiste of onvolledige informatie verstrekt door Werknemers;
    (c) schade voortvloeiend uit de arbeidsrelatie tussen Opdrachtgever en
        Werknemer;
    (d) gederfde omzet, gemiste kansen of indirecte schade;
    (e) onbeschikbaarheid van het Platform door overmacht of geplande
        onderhoud.

6.2 De totale aansprakelijkheid van KLOK Works jegens Opdrachtgever, uit
    welken hoofde dan ook, is beperkt tot het totaal van de platformfees
    die Opdrachtgever in de drie (3) kalendermaanden voorafgaand aan de
    schadeveroorzakende gebeurtenis aan KLOK Works heeft betaald, met een
    absoluut maximum van € 5.000,-.

6.3 De aansprakelijkheidsbeperking geldt niet bij opzet of bewuste
    roekeloosheid van KLOK Works.

────────────────────────────────────────────────────────────
ARTIKEL 7 — PERSOONSGEGEVENS (AVG)
────────────────────────────────────────────────────────────

7.1 KLOK Works is verwerkingsverantwoordelijke voor data op het Platform.

7.2 Voor zover Opdrachtgever in het kader van deze overeenkomst
    persoonsgegevens van zijn Werknemers via het Platform verwerkt, sluit
    Opdrachtgever met KLOK Works een aparte verwerkersovereenkomst die als
    bijlage geldt.

7.3 Beide partijen committeren zich aan naleving van de AVG/GDPR en de
    Uitvoeringswet AVG (UAVG).

────────────────────────────────────────────────────────────
ARTIKEL 8 — GEHEIMHOUDING
────────────────────────────────────────────────────────────

8.1 Beide partijen behandelen alle vertrouwelijke informatie die zij van
    elkaar ontvangen als strikt vertrouwelijk en gebruiken deze uitsluitend
    voor de doeleinden van deze overeenkomst.

8.2 Deze verplichting blijft van kracht tot 3 jaar na beëindiging van de
    overeenkomst.

────────────────────────────────────────────────────────────
ARTIKEL 9 — LOOPTIJD & BEËINDIGING
────────────────────────────────────────────────────────────

9.1 Deze overeenkomst geldt voor onbepaalde tijd en kan door beide partijen
    schriftelijk worden opgezegd met inachtneming van een opzegtermijn van
    1 (één) kalendermaand.

9.2 KLOK Works mag de overeenkomst per direct beëindigen bij:
    (a) ernstige overtreding van deze voorwaarden door Opdrachtgever;
    (b) betalingsachterstand van meer dan 60 dagen;
    (c) faillissement, surseance van betaling of liquidatie van Opdrachtgever.

9.3 Na beëindiging blijven openstaande facturen direct opeisbaar.

────────────────────────────────────────────────────────────
ARTIKEL 10 — WIJZIGINGEN
────────────────────────────────────────────────────────────

10.1 KLOK Works mag deze overeenkomst eenzijdig wijzigen, mits Opdrachtgever
     ten minste 30 dagen van tevoren schriftelijk wordt geïnformeerd.

10.2 Bij niet-akkoord met de wijziging heeft Opdrachtgever het recht de
     overeenkomst per direct kosteloos op te zeggen tot de ingangsdatum
     van de wijziging.

────────────────────────────────────────────────────────────
ARTIKEL 11 — TOEPASSELIJK RECHT EN GESCHILLEN
────────────────────────────────────────────────────────────

11.1 Op deze overeenkomst is uitsluitend Nederlands recht van toepassing.

11.2 Alle geschillen die voortvloeien uit of verband houden met deze
     overeenkomst worden bij uitsluiting voorgelegd aan de bevoegde
     rechter van de Rechtbank Gelderland, locatie Arnhem.

────────────────────────────────────────────────────────────
ARTIKEL 12 — SLOTBEPALINGEN
────────────────────────────────────────────────────────────

12.1 Indien een bepaling van deze overeenkomst nietig of vernietigbaar blijkt,
     blijven de overige bepalingen onverminderd van kracht.

12.2 Afwijkingen van deze overeenkomst zijn slechts geldig indien schriftelijk
     overeengekomen.

12.3 Door deze overeenkomst elektronisch te ondertekenen verklaart
     Opdrachtgever:
     (a) bevoegd te zijn de organisatie te vertegenwoordigen;
     (b) deze overeenkomst volledig te hebben gelezen en begrepen;
     (c) akkoord te zijn met alle voorwaarden zonder voorbehoud;
     (d) alle verstrekte bedrijfsgegevens correct te hebben opgegeven.

────────────────────────────────────────────────────────────
ALDUS OPGEMAAKT EN ELEKTRONISCH ONDERTEKEND
────────────────────────────────────────────────────────────

KLOK Works                          ${partyName}
${KLOK_LEGAL_ENTITY.address}                       ${addrStr}
${KLOK_LEGAL_ENTITY.postcode} ${KLOK_LEGAL_ENTITY.city}

Versie ${input.version}                          ${input.signedAt ? `Getekend: ${new Date(input.signedAt).toLocaleString("nl-NL")}` : "Nog niet ondertekend"}`,
  };
}
