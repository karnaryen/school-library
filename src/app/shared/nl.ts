/**
 * All user-facing text, in Dutch. The customer is a leescoördinator or
 * leesouder at a basisschool, so Dutch is the only language for now; when a
 * second language is needed this file becomes the source for Angular i18n.
 */
export const T = {
  appName: 'Biebouders',

  nav: {
    borrow: 'Lenen',
    return: 'Inleveren',
    loans: 'Overzicht',
    books: 'Boeken',
    students: 'Leerlingen',
    settings: 'Instellingen',
    labels: 'Etiketten',
    print: 'Afdrukken',
    logout: 'Uitloggen',
    login: 'Inloggen',
    register: 'Gratis starten',
    back: 'Terug',
  },

  /** Header and footer links shared by the public pages. */
  publicNav: {
    tour: 'Rondleiding',
    about: 'Over Biebouders',
    privacy: 'Privacy',
    toApp: 'Naar de bieb',
    email: 'Mail ons: info@biebouders.nl',
    openMenu: 'Menu openen',
    closeMenu: 'Menu sluiten',
  },

  landing: {
    eyebrow: 'Voor de eigen boeken van de schoolbieb',
    heroTitle: 'Weg met het papieren lijstje',
    heroText:
      'Scan het ISBN met de camera van je telefoon of de schooltablet. Lenen en inleveren in twee tikken, ook voor de boeken die niet in het grote bibliotheeksysteem passen.',
    heroNote: 'Geen installatie, geen scanner, geen accounts voor leerlingen.',
    heroAlt: 'Een telefoon scant de streepjescode van een kinderboek. Ernaast ligt een papieren uitleenlijst.',
    cta: 'Gratis starten',
    ctaSecondary: 'Bekijk de rondleiding',

    problemTitle: 'Herken je dit?',
    problemIntro:
      'Naast de boeken van de bibliotheek heeft bijna elke basisschool een kast met eigen boeken: gekregen, gekocht van de ouderbijdrage of overgebleven van een project. Die hebben geen sticker van de bibliotheek en passen dus niet in het systeem.',
    problems: [
      {
        title: 'Een lijstje op papier',
        text: 'Titels in de ene kolom, namen in de andere. Doorstrepen bij inleveren, en na drie weken weet niemand meer wat er staat.',
      },
      {
        title: 'Geen sticker, geen systeem',
        text: 'Zonder chip of code van de bibliotheek kun je eigen boeken niet in het bibliotheeksysteem zetten. Ze blijven buiten beeld.',
      },
      {
        title: 'Waar is dat boek?',
        text: 'Aan het eind van het schooljaar mist er van alles en weet niemand wie het als laatste had.',
      },
    ],
    problemAlt: 'Papieren uitleenlijst met doorgestreepte namen en een koffiekring.',

    featuresTitle: 'Wat Biebouders doet',
    featuresIntro: 'Elk boek heeft al een streepjescode op de achterkant: het ISBN. Meer heb je niet nodig.',
    features: [
      {
        icon: 'photo_camera',
        title: 'Scannen met de camera',
        text: 'Richt de camera van je telefoon of tablet op de achterkant van het boek. Geen losse scanner, geen etiketten plakken.',
      },
      {
        icon: 'auto_stories',
        title: 'Boekgegevens vanzelf',
        text: 'Titel en auteur worden opgehaald zodra je scant. Het AVI-niveau vul je zelf in als je wilt.',
      },
      {
        icon: 'import_contacts',
        title: 'Lenen in twee tikken',
        text: 'Scan het boek en tik op de naam van het kind. Inleveren is zelfs één tik minder.',
      },
      {
        icon: 'list_alt',
        title: 'Overzicht per groep',
        text: 'Wie heeft wat, sinds wanneer en wat is te laat. Live op elk apparaat, of afgedrukt voor in de klas.',
      },
      {
        icon: 'groups',
        title: 'Leerlingen in één keer',
        text: 'Plak de leerlingenlijst uit ParnasSys, ESIS of Excel. Alleen voornaam en groep, meer bewaren we niet.',
      },
      {
        icon: 'label',
        title: 'Boek zonder barcode?',
        text: 'Voor oude of zelfgemaakte boeken maak je een eigen code en druk je een etiket af.',
      },
    ],

    howTitle: 'Zo werkt het',
    how: [
      { title: 'Maak een account', text: 'Vul de naam van je school in. Collega’s sluiten aan met een toegangscode.' },
      { title: 'Zet de leerlingen erin', text: 'Plak de lijst uit het leerlingvolgsysteem of typ ze in. Een paar minuten werk.' },
      { title: 'Scan de boeken', text: 'Boek voor boek, tien seconden per stuk. Met meerdere ouders tegelijk gaat het nog sneller.' },
      { title: 'Lenen en inleveren', text: 'Scan, tik op de naam, klaar. Het overzicht houdt zichzelf bij.' },
    ],

    devicesTitle: 'Werkt op wat je al hebt',
    devicesText:
      'Biebouders is een website. Je opent hem op je eigen telefoon, op de schooltablet of op de laptop in de bieb. Niets installeren, niets kopen.',
    devicesAlt: 'Een telefoon, een tablet en een laptop met dezelfde schoolbieb-app.',

    fitTitle: 'Naast de grote bieb, niet in plaats van',
    fitText:
      'Werkt je school met de Bibliotheek op school of een ander uitleensysteem? Prima. Biebouders is er voor de boeken die daar niet in passen: de eigen kast van de school.',

    trustTitle: 'Zuinig met gegevens',
    trust: [
      'Van leerlingen alleen de voornaam en de groep.',
      'Geen accounts of wachtwoorden voor kinderen.',
      'Gegevens staan in de Europese Unie en zijn altijd te exporteren.',
    ],

    ctaTitle: 'Klaar om het lijstje weg te gooien?',
    ctaText: 'Maak een account, scan het eerste boek en zie hoe het werkt.',
  },

  about: {
    title: 'Over Biebouders',
    intro: 'Biebouders is ontstaan in een schoolbieb, niet op een kantoor.',
    name: 'Natalia',
    role: 'Frontend developer en biebouder',
    photoAlt: 'Natalia, de maker van Biebouders',
    story: [
      'Ik ben Natalia. Als vrijwilliger help ik in de schoolbibliotheek van de basisschool van mijn dochter.',
      'Het grootste deel van onze bieb draait op het systeem van de bibliotheek. Maar er staat ook een kast met eigen boeken van de school. Die hebben geen sticker van de bibliotheek, en die sticker kun je er niet zomaar bij laten maken. Ze passen dus niet in het systeem.',
      'Daarom werkten we met een lijst op papier: de titel in de ene kolom, de naam van het kind in de andere. Doorstrepen bij inleveren. Dat werkt, tot het niet meer werkt.',
      'Ik ben frontend developer van beroep. Op een dag dacht ik: elk boek heeft al een streepjescode, en iedereen heeft een telefoon met een camera. Zo ontstond Biebouders: scan het ISBN, kies het kind, klaar. Op je eigen telefoon of op de schooltablet.',
      'Biebouders is gemaakt voor onze eigen bieb en staat nu open voor andere scholen. Loop je ergens tegenaan of heb je een idee? Ik hoor het graag.',
    ],
    portfolio: 'Meer over mijn werk',
    portfolioUrl: 'https://karnaryen.com/',
    contact: 'Stuur een e-mail',
    cta: 'Bekijk de rondleiding',
  },

  tour: {
    title: 'Rondleiding',
    intro: 'Zo ziet Biebouders eruit als je bent ingelogd: vijf schermen, één balk bovenin, en de instellingen achter het tandwiel. Op een telefoon staan dezelfde knoppen, alleen wat dichter op elkaar.',
    disclaimer:
      'De school, de namen en de boeken op deze schermafbeeldingen zijn verzonnen. Het zijn voorbeeldgegevens, geen echte leerlingen.',
    screens: [
      {
        id: 'lenen',
        icon: 'import_contacts',
        title: 'Lenen',
        image: '/assets/images/demo/lenen.png',
        alt: 'Het scherm Lenen met de knop Scan ISBN met camera en een veld om het ISBN te typen.',
        text: 'Tik op Scan ISBN met camera en richt op de achterkant van het boek, of typ het ISBN. Daarna kies je de leerling uit de lijst, eventueel gefilterd op groep. Het boek staat meteen op naam, met de inleverdatum erbij.',
      },
      {
        id: 'inleveren',
        icon: 'assignment_return',
        title: 'Inleveren',
        image: '/assets/images/demo/inleveren.png',
        alt: 'Het scherm Inleveren, met dezelfde scanknop en een knop Inleveren.',
        text: 'Scan het boek dat terugkomt. Biebouders zoekt zelf op wie het had en zet het weer in de kast. Zijn er meerdere exemplaren van hetzelfde boek uitgeleend, dan kies je welk kind inlevert.',
      },
      {
        id: 'overzicht',
        icon: 'list_alt',
        title: 'Overzicht',
        image: '/assets/images/demo/overzicht.png',
        alt: 'Het scherm Overzicht met een uitgeleend boek, de naam van de leerling en de inleverdatum.',
        text: 'Alles wat uitgeleend is, per groep te filteren. Te laat staat in het rood. Inleveren kan ook direct vanuit dit scherm, en met de printknop druk je een lijst af voor in de klas.',
      },
      {
        id: 'boeken',
        icon: 'menu_book',
        title: 'Boeken',
        image: '/assets/images/demo/boeken.png',
        alt: 'Het scherm Boeken met een zoekveld en een lijst titels met het aantal exemplaren.',
        text: 'De hele kast in één lijst, met een zoekveld. Per titel zie je hoeveel exemplaren er zijn en hoeveel er in de kast staan. Een boek toevoegen gaat door te scannen; voor boeken zonder barcode druk je een eigen etiket af.',
      },
      {
        id: 'leerlingen',
        icon: 'groups',
        title: 'Leerlingen',
        image: '/assets/images/demo/leerlingen.png',
        alt: 'Het scherm Leerlingen met de namen per groep en de knoppen Lijst importeren en Leerling toevoegen.',
        text: 'Leerlingen staan per groep. Plak een lijst uit ParnasSys, ESIS of Excel, of voeg ze één voor één toe. Aan het eind van het schooljaar schuif je alle groepen in één keer door.',
      },
      {
        id: 'instellingen',
        icon: 'settings',
        title: 'Instellingen',
        image: '/assets/images/demo/instellingen.png',
        alt: 'Het scherm Instellingen met de naam van de school, de uitleentermijn, de groepen, de toegangscode voor collega’s, exportknoppen en de knop Groepen doorschuiven.',
        text: 'Naam van de school, uitleentermijn en groepen. Collega’s sluiten aan met de toegangscode. Alle gegevens zijn als CSV te downloaden, en bij een nieuw schooljaar schuif je alle groepen met één knop door.',
      },
    ],
    ctaTitle: 'Zelf proberen?',
    ctaText: 'Bij het aanmaken van een school kun je de bieb vullen met voorbeeldgegevens om rond te kijken.',
  },

  auth: {
    loginTitle: 'Inloggen',
    registerTitle: 'Account aanmaken',
    email: 'E-mailadres',
    password: 'Wachtwoord',
    passwordHint: 'Minimaal 8 tekens',
    loginButton: 'Inloggen',
    registerButton: 'Account aanmaken',
    google: 'Doorgaan met Google',
    forgot: 'Wachtwoord vergeten?',
    resetSent: 'We hebben een e-mail gestuurd om je wachtwoord opnieuw in te stellen.',
    noAccount: 'Nog geen account?',
    hasAccount: 'Al een account?',
    toRegister: 'Gratis starten',
    toLogin: 'Inloggen',
    or: 'of',
    errors: {
      invalidCredential: 'E-mailadres of wachtwoord klopt niet.',
      emailInUse: 'Er bestaat al een account met dit e-mailadres.',
      weakPassword: 'Kies een wachtwoord van minimaal 8 tekens.',
      invalidEmail: 'Dit is geen geldig e-mailadres.',
      popupClosed: 'Het Google-venster is gesloten voordat je was ingelogd.',
      recentLogin: 'Log om veiligheidsredenen opnieuw in en probeer het daarna meteen opnieuw.',
      generic: 'Inloggen is niet gelukt. Probeer het opnieuw.',
    },
  },

  onboarding: {
    title: 'Welkom bij Biebouders',
    intro: 'Maak een nieuwe schoolbieb aan, of sluit je aan bij een school die al met Biebouders werkt.',
    createTitle: 'Nieuwe school',
    schoolName: 'Naam van de school',
    createButton: 'Schoolbieb aanmaken',
    demoData: 'Vul de bieb met voorbeeldgegevens (12 leerlingen, 8 boeken) om rond te kijken',
    joinTitle: 'Aansluiten bij een school',
    joinText: 'Vraag de beheerder van de schoolbieb om de toegangscode. Die staat bij Instellingen.',
    joinCode: 'Toegangscode',
    joinButton: 'Aansluiten',
    unknownCode: 'Deze toegangscode bestaat niet. Controleer de code bij de beheerder.',
    alreadyMember: 'Je bent al lid van deze school.',
    failed: 'Dat is niet gelukt. Probeer het opnieuw.',
  },

  fields: {
    isbn: 'ISBN',
    title: 'Titel',
    author: 'Auteur',
    avi: 'AVI-niveau',
    copies: 'Aantal exemplaren',
    location: 'Locatie (optioneel)',
    allLocations: 'Alle locaties',
    firstName: 'Voornaam',
    lastName: 'Achternaam (optioneel)',
    group: 'Groep',
    search: 'Zoeken',
    required: 'Dit veld is verplicht',
    invalidIsbn: 'Dit is geen geldig ISBN',
    min1: 'Minimaal 1',
  },

  scanner: {
    scan: 'Scan ISBN met camera',
    scanAgain: 'Opnieuw scannen',
    stop: 'Camera stoppen',
    scannedIsbn: 'Gescand ISBN:',
    noPermission: 'Geef de browser toegang tot de camera om te scannen.',
    noCamera: 'Geen camera gevonden op dit apparaat.',
    failed: 'De camera kon niet worden gestart.',
  },

  borrow: {
    title: 'Lenen',
    step1: 'Scan of typ het ISBN',
    step2: 'Kies de leerling',
    lookup: 'Zoek boek',
    unknownTitle: 'Dit boek staat nog niet in de bieb.',
    addIt: 'Boek toevoegen',
    noCopy: 'Alle exemplaren van dit boek zijn uitgeleend.',
    availableCopies: (n: number) => (n === 1 ? '1 exemplaar beschikbaar' : `${n} exemplaren beschikbaar`),
    allGroups: 'Alle groepen',
    noStudents: 'Geen leerlingen gevonden. Voeg leerlingen toe bij Leerlingen.',
    done: (title: string, child: string, due: string) => `"${title}" is uitgeleend aan ${child}, terug op ${due}.`,
    failed: 'Lenen is niet gelukt. Probeer het opnieuw.',
    other: 'Ander boek',
  },

  return: {
    title: 'Inleveren',
    step1: 'Scan of typ het ISBN van het boek dat terugkomt',
    notOnLoan: 'Dit boek is niet uitgeleend.',
    chooseLoan: 'Er zijn meerdere exemplaren uitgeleend. Welk exemplaar komt terug?',
    done: (title: string, child: string) => `"${title}" is ingeleverd door ${child}.`,
    failed: 'Inleveren is niet gelukt. Probeer het opnieuw.',
    button: 'Inleveren',
  },

  loans: {
    title: 'Uitgeleende boeken',
    empty: 'Er is op dit moment niets uitgeleend.',
    overdue: 'Te laat',
    dueOn: 'Terug op',
    since: 'Sinds',
    returnButton: 'Inleveren',
    allGroups: 'Alle groepen',
    count: (n: number) => (n === 1 ? '1 boek uitgeleend' : `${n} boeken uitgeleend`),
    overdueCount: (n: number) => (n === 1 ? '1 te laat' : `${n} te laat`),
  },

  books: {
    title: 'Boeken',
    add: 'Boek toevoegen',
    empty: 'Nog geen boeken. Scan het eerste boek om te beginnen.',
    noResults: 'Geen boeken gevonden.',
    copies: (total: number, available: number) =>
      total === 1 ? (available === 1 ? '1 exemplaar, in de kast' : '1 exemplaar, uitgeleend') : `${total} exemplaren, ${available} in de kast`,
    addCopy: 'Exemplaar erbij',
    markLost: 'Exemplaar kwijt',
    markRemoved: 'Exemplaar afvoeren',
    copyStatus: {
      available: 'In de kast',
      onLoan: 'Uitgeleend',
      lost: 'Kwijt',
      removed: 'Afgevoerd',
    } as Record<string, string>,
    saved: 'Opgeslagen.',
    labels: 'Etiketten',
  },

  addBook: {
    title: 'Boek toevoegen',
    step1: 'Scan of typ het ISBN',
    lookingUp: 'Boekgegevens ophalen…',
    found: 'Gevonden. Controleer en pas aan waar nodig.',
    notFound: 'Geen gegevens gevonden voor dit ISBN. Vul titel en auteur zelf in.',
    alreadyHave: (n: number) =>
      n === 1 ? 'Dit boek staat al in de bieb met 1 exemplaar.' : `Dit boek staat al in de bieb met ${n} exemplaren.`,
    submit: 'Toevoegen',
    done: (title: string, n: number) => (n === 1 ? `"${title}" is toegevoegd.` : `"${title}" is toegevoegd (${n} exemplaren).`),
    failed: 'Toevoegen is niet gelukt. Probeer het opnieuw.',
    another: 'Volgend boek',
    noBarcode: 'Geen barcode? Maak een eigen code',
    internalCode: 'Eigen code van de school. Vul titel en auteur zelf in en druk daarna een etiket af bij Boeken → Etiketten.',
  },

  students: {
    title: 'Leerlingen',
    add: 'Leerling toevoegen',
    import: 'Lijst importeren',
    importHelp:
      'Plak hier de leerlingenlijst uit ParnasSys, ESIS of Excel (kolommen voornaam, achternaam, groep), of kies een CSV-bestand.',
    importFile: 'Bestand kiezen',
    importPreview: (n: number) => (n === 1 ? '1 leerling gevonden' : `${n} leerlingen gevonden`),
    importButton: 'Importeren',
    imported: (n: number) => (n === 1 ? '1 leerling toegevoegd.' : `${n} leerlingen toegevoegd.`),
    importedNone: 'Geen nieuwe leerlingen: ze stonden er allemaal al in.',
    empty: 'Nog geen leerlingen. Voeg ze toe of importeer een lijst.',
    added: (name: string) => `${name} is toegevoegd.`,
    deactivate: 'Van school',
    remove: 'Verwijderen',
    confirmRemove: (name: string) => `${name} verwijderen? Uitleengeschiedenis blijft bewaard.`,
    failed: 'Opslaan is niet gelukt. Probeer het opnieuw.',
    countInGroup: (n: number) => (n === 1 ? '1 leerling' : `${n} leerlingen`),
  },

  settings: {
    title: 'Instellingen',
    school: 'School',
    schoolName: 'Naam van de school',
    loanDays: 'Uitleentermijn (dagen)',
    groups: 'Groepen',
    groupsHint: 'Gescheiden door komma’s, van laag naar hoog. Bijvoorbeeld: 1/2A, 1/2B, 3, 4, 5, 6, 7, 8',
    save: 'Opslaan',
    saved: 'Instellingen opgeslagen.',
    team: 'Medewerkers',
    joinCode: 'Toegangscode voor collega’s',
    joinCodeHelp: 'Collega’s maken een account aan en vullen deze code in om bij deze school te horen.',
    copy: 'Kopiëren',
    copied: 'Gekopieerd.',
    roles: { beheerder: 'Beheerder', medewerker: 'Medewerker' } as Record<string, string>,
    newYear: 'Nieuw schooljaar',
    newYearText: 'Schuift alle leerlingen één groep door. Leerlingen uit de hoogste groep gaan van school.',
    newYearButton: 'Groepen doorschuiven',
    newYearConfirm: 'Alle leerlingen één groep doorschuiven? Dit kun je niet ongedaan maken.',
    newYearDone: (promoted: number, left: number) => `${promoted} leerlingen doorgeschoven, ${left} van school.`,
    planName: { free: 'Gratis (klassenbieb)', trial: 'Proefperiode', paid: 'Schoolbieb', locked: 'Alleen-lezen' } as Record<string, string>,
    readOnlyHint: 'Alleen de beheerder kan deze instellingen wijzigen.',
    logout: 'Uitloggen',
  },

  plan: {
    title: 'Abonnement',
    status: {
      trial: (days: number, until: string) => `Proefperiode: nog ${days} dagen, tot ${until}.`,
      paid: (until: string) => `Schoolbieb, betaald tot ${until}.`,
      free: (count: number, max: number) => `Gratis klassenbieb: ${count} van ${max} boeken.`,
      locked: (count: number, max: number) =>
        `De proefperiode is voorbij en de bieb heeft ${count} boeken, meer dan de ${max} van de gratis klassenbieb. Lenen en toevoegen staan uit tot het abonnement is geregeld.`,
    } as const,
    bannerTrial: (days: number) => (days === 1 ? 'De proefperiode eindigt morgen.' : `De proefperiode eindigt over ${days} dagen.`),
    bannerLocked: 'De bieb staat op alleen-lezen. Regel het abonnement bij Instellingen.',
    price: 'Neem contact op om de mogelijkheden voor een grotere schoolbieb te bespreken.',
    request: 'Schoolbieb aanvragen',
    requestSubject: (school: string) => `Schoolbieb aanvragen voor ${school}`,
    requestBody: (school: string, count: number) =>
      `Hallo,\n\nWij willen graag een Schoolbieb-abonnement voor ${school} (${count} boeken).\n\nMet vriendelijke groet,`,
    lockedTitle: 'Alleen-lezen',
    lockedText: 'Deze actie is niet beschikbaar zolang het abonnement niet is geregeld. Bekijken en inleveren kan wel.',
  },

  /** Instellingen → Verwijderen: the irreversible actions. */
  danger: {
    title: 'Verwijderen',
    schoolTitle: 'School verwijderen',
    schoolText: (name: string) =>
      `Verwijdert ${name} met alle boeken, leerlingen, uitleningen en medewerkers. Dit kan niet ongedaan worden gemaakt. Exporteer eerst je gegevens als je ze wilt bewaren.`,
    schoolButton: 'School verwijderen',
    schoolConfirm: (name: string) => `Typ de naam van de school (${name}) om te bevestigen.`,
    schoolDone: 'De school is verwijderd.',
    accountTitle: 'Account verwijderen',
    accountText:
      'Verwijdert je inlogaccount. Ben je het enige lid van een school, dan wordt die school met alle gegevens ook verwijderd. Bij andere scholen word je alleen als medewerker verwijderd.',
    accountButton: 'Account verwijderen',
    accountConfirm: 'Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
    accountPassword: 'Vul ter bevestiging je wachtwoord in.',
    accountDone: 'Je account is verwijderd.',
    adminWithMembers: (name: string) =>
      `Je bent beheerder van ${name} en er zijn nog andere medewerkers. Verwijder eerst de school, of vraag de medewerkers om hun account te verwijderen.`,
    typeToConfirm: 'Naam van de school',
    mismatch: 'De naam klopt niet.',
  },

  export: {
    title: 'Exporteren',
    text: 'Download alle gegevens van je school als CSV (opent in Excel). Handig voor een back-up of als je overstapt.',
    books: 'Boeken',
    students: 'Leerlingen',
    loans: 'Uitleningen',
  },

  labels: {
    title: 'Etiketten',
    text: 'Voor boeken met een eigen code van de school. Print op etikettenvellen met 3 × 8 etiketten (bijvoorbeeld Avery L7160, 63,5 × 38,1 mm) of op gewoon papier en knip ze uit.',
    empty: 'Er zijn nog geen boeken met een eigen code. Maak er een bij Boek toevoegen → Geen barcode?',
    selectAll: 'Alles selecteren',
    selectNone: 'Niets selecteren',
    selected: (n: number) => (n === 1 ? '1 etiket' : `${n} etiketten`),
  },

  privacy: {
    title: 'Privacy',
    text: [
      'Biebouders verwerkt zo min mogelijk persoonsgegevens. Van leerlingen slaan we alleen de voornaam, eventueel de achternaam en de groep op, plus welke boeken zij geleend hebben. Geen geboortedata, geen BSN, geen e-mailadressen van kinderen.',
      'Van medewerkers slaan we het e-mailadres op waarmee zij inloggen.',
      'Gegevens staan bij Google Cloud (Firebase) in de Europese Unie. De school is verwerkingsverantwoordelijke; Biebouders is verwerker. Een verwerkersovereenkomst is op aanvraag beschikbaar.',
      'Je kunt alle gegevens van je school op elk moment exporteren en laten verwijderen.',
    ],
  },

  common: {
    close: 'Sluiten',
    cancel: 'Annuleren',
    confirm: 'Bevestigen',
    loading: 'Laden…',
    today: 'vandaag',
    genericError: 'Er ging iets mis. Probeer het opnieuw.',
  },
} as const;

/** dd-mm-yyyy, the way Dutch schools write dates. */
export function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}
