# TODO / actiepunten

## Openstaand — pagina-optimalisatie (loopt)
- [ ] **Validatie staat tijdelijk UIT** (`VALIDATIE_ACTIEF = false` in App.jsx) zodat je tijdens het
      testen niet elke keer alle verplichte velden opnieuw hoeft in te vullen na een refresh.
      Zet dit terug op `true` vlak voor de grote eindtest / productie.
- [x] Pagina 1 Contact: layout/velden geoptimaliseerd (Aanhef i.p.v. Geslacht, volgorde, tel-toetsenbord, datum aanpasbaar)
- [ ] Pagina 1 Contact: **Aanhef niet meer verplicht** bij het weer aanzetten van validatie.
      Verplicht wordt dan: Projectnummer, Naam, Adres, Postcode, Plaats, Telefoon, Mail.
      (Aanhef blijft wel gewoon een invulveld, alleen niet meer blokkerend.)
- [x] Pagina 2 Maatvoering: Diepte krijgt Buiten/Binnen (zoals Breedte), Hoogte altijd verplicht,
      Diepte/Breedte: minimaal buiten óf binnen verplicht, numeriek toetsenbord op mm-velden.
- [x] Pagina 3 Maatvoering Schets: schetsveld zo groot mogelijk (vierkant), grid van 15x15 vakjes
      (1 vakje = 1 meter). "Ongedaan maken" toegevoegd aan het tekenveld — werkt op alle
      schets-pagina's (Maatvoering, Kozijn 1/2/3, E-installatie, W-installatie).
- [x] Pagina 4 Voorbereidingen: "Heipalen" hernoemd naar "Bereikbaarheid" (naam klopte niet met de
      vraag), nutteloos "Foto bijgevoegd"-vinkje weggehaald, Bereikbaarheid toegevoegd aan de
      in-app samenvatting (stond er eerst niet in), numeriek toetsenbord bij Doorbraak.
- [x] Pagina 5 Voorbereiding Foto's: verwarrende "Vloeroplegging foto bijgevoegd"-optie weg, vervangen
      door simpel vinkje "Geen kruipruimte aanwezig" (fotobox verdwijnt dan). Bereikbaarheid-hint
      aangepast naar "Doorgang naar de tuin". Verplicht wordt (bij het aanzetten van validatie):
      Achtergevel Binnen, Achtergevel Buiten, Bereikbaarheid altijd; Kruipruimte-foto verplicht
      tenzij "Geen kruipruimte aanwezig" is aangevinkt.
- [x] Pagina 6 Wandafwerking & Gevelbekleding: samengevoegd tot 1 pagina (was 2 losse pagina's,
      binnen + buiten stonden origineel ook al samen). App heeft nu 18 pagina's i.p.v. 19.
- [x] Pagina 6 Gevelbekleding: echte foto's i.p.v. kleurvlakken bij Steenstrips en Composiet,
      plus foto bij Kerama en Hout (thermisch gemodificeerd). Nieuw veld "Voegkleur" bij
      Steenstrips, verplicht (bij aanzetten validatie) zodra een Steenstrip-optie is gekozen.
      Gevelbekleding en Binnenwandafwerking: bevestigd dat "1 optie verplicht" al klopte.
- [x] Pagina 7/9/11 Kozijn 1/2/3 (delen dezelfde component, dus in 1x geregeld): Glas nu
      alleen HR++/HR+++ (Triple weg). "Vast glas" toegevoegd als optie bij Schuifpui en
      Openslaande deuren, en als raamtype bij Raam. Zodra Vast glas gekozen is: verplichte
      Ja/Nee-vraag Ventilatierooster erbij. Raam heeft nu opties (Vast glas/Draaikiepraam/
      Uitzetraam), Harmonica wand heeft nu opties (aantal delen 3/4/5-delig + richting Links/
      Rechts) i.p.v. alleen een leeg opmerkingenveld.
- [x] Pagina 8/10/12 Kozijn 1/2/3 Schets: grid nu 10 x 4 meter (breed x hoog, i.p.v. het
      vierkante 15x15 grid van Maatvoering), met de vaste opmerking "Dit is het buitenaanzicht"
      boven de schets.
- [x] Pagina 13 Dak & Lichtstraat: flink herzien.
      Dakbedekking: EPDM/Sedum/Bitumen (Bitumen met hint "alleen bij aansluiting op bestaand
      bitumen dak"). Dakrand: "Modern zetwerk" (naam gefixt, was "Modern zw zetwerk") / Kraal
      zink — RAL-veld popt alleen op bij Modern zetwerk. Overstek Ja → Diepte (MM, numeriek) +
      RAL. Dakvorm is weg. Lichtstraat is nu N.V.T./Lessenaar/Zadeldak — bij Lessenaar of
      Zadeldak popt op: Lengte+Breedte (MM, numeriek), Kleur (Wit/Zwart/Wit binnen-Zwart
      buiten), Aantal delen glas (numeriek). Bij N.V.T. blijft alles dicht. Nieuw tekenvak op
      dezelfde pagina voor de positie van de lichtstraat op het dak (grid 20x20m, kleiner
      formaat zodat alles op 1 pagina past).
- [x] Pagina 13 fixes: "Zinken zetkap" toegevoegd naast Kraal zink bij Dakrand. Lichtstraat
      Lessenaar/Zadeldak tonen nu echte productfoto's (net als bij Gevelbekleding) i.p.v. platte
      radiokeuze. Tekenvak positie lichtstraat verschijnt nu pas ná het kiezen van Lessenaar of
      Zadeldak (niet meer altijd zichtbaar).
- [x] Pagina 6 Gevelbekleding: "Anders"-vakken bij Steenstrips en Composiet hebben nu een
      klikbare foto-upload (zoals bij de andere foto-velden) i.p.v. alleen een tekstveld.
- [x] Pagina 13 layout: Lichtstraat-foto's veel kleiner gemaakt (klein vierkantje naast het
      keuzerondje, i.p.v. groot fotokaartje), N.V.T. is nu gewoon een keuzerondje op dezelfde
      regel i.p.v. een los kaartje met plaatje.
- [x] Header-logo: linksboven staat nu het echte Add On-logo (afbeelding) i.p.v. tekst "AddOn".
- [x] Pagina 14 E-installaties: flink herzien.
      Stopcontacten/Binnen verlichting/Schakelaars/Buiten verlichting hebben nu per gekozen
      optie een Aantal-veld (numeriek). Merk-veld overal weg, Type omgezet naar gecombineerd
      Merk/Type-veld. Stopcontacten "Anders" heeft nu een omschrijvingsveld. Spotjes (binnen en
      buiten) hebben een kleurkeuze (binnen: Wit/Zwart, buiten: Wit/Zwart/Antraciet). Buiten
      verlichting is nu Spotjes/Up-Down lamp met eigen aantallen, net als de rest. WCD's zijn nu
      "Buitenstopcontact": alleen aanvinken + aantal 1 of 2, met vaste opmerking "NIKO 9005
      inbouw dubbel horizontaal" (geen losse merk/type/kleur-velden meer). Warmte/Koude toont nu
      alleen nog Airco (WTW-unit en Vloerverwarming weg).
- [x] Pagina 15 E-installatie Tekening: grid van 15x15 meter zoals bij Maatvoering Schets
      toegevoegd. Legenda-symbolen (Centraal doos/Spot/Schakelaar/Dimmer/Stopcontact) kunnen nu
      met de vinger/muis vanuit de legenda de tekening in gesleept worden (werkt op basis van
      pointer events, dus ook op tablet/touch) i.p.v. dat je ze zelf moest natekenen. Werkt samen
      met "Ongedaan maken". Hint-tekst bijgewerkt (WCD -> stopcontacten).
- [x] Pagina 4 Voorbereidingen: nieuwe regel "Rijplaten" (Benodigd / N.V.T.) direct onder
      Bereikbaarheid. Verplicht (bij aanzetten validatie), staat in de in-app samenvatting en in de
      PDF direct na Bereikbaarheid.
- [x] Pagina 14 E-installaties (ronde 2, deel 1): bovenaan nieuwe keuze "Uitvoering": AddOn levert en
      monteert alles incl. afmontage / AddOn verzorgt alleen leidingen en dozen (afmonteren door
      klant). Daaronder "Merk/Type:" met foto: Gira 55 (standaard) / Busch-Jaeger
      (modern) / Anders: met invulvak ernaast; daaronder altijd Kleur Wit/Zwart. Blok verdwijnt bij
      "alleen leidingen en dozen". Losse Merk/Type-velden bij Stopcontacten en Schakelaars weg.
      Validatie, samenvatting en PDF bijgewerkt.
- [x] E-installaties "alleen leidingen en dozen": garantietekst erbij ("Zodra er iets aan de elektra
      wordt gewijzigd ten opzichte van de staat waarin de aanbouw onze werkplaats verlaat, vervalt de
      garantie van AddOn op de elektra."), ook in de
      samenvatting en als opvallend kader in de PDF. PDF: lange waarden lopen niet meer over de rand.
- [x] Merknaam overal aan elkaar: "AddOn" (keuzes, PDF-voettekst/voorblad, browsertitel, logo-alt).
- [x] Pagina 14 Binnen verlichting: CD weg (vaste opmerking "AddOn past altijd een ingestucte
      centraaldoos toe"). Opties nu Spotjes (aantal + Wit/Zwart) / Hanglamp / Wandlampjes (nieuw).
      Hanglamp en Wandlampjes: aantal, opmerking "AddOn levert alleen de aansluiting en levert/monteert
      geen ..., tenzij de klant deze zelf aanlevert" en vinkje "... ophangen". Samenvatting + PDF bijgewerkt.
- [x] Pagina 14 Buiten E-installaties: staat nu boven Schakelaars, 3 opties onder elkaar, Merk/Type weg.
      Spotjes: aantal + kleur Wit/Zwart/Kleur van overstek (met RAL-veld). Up/Down lamp -> Wandlamp:
      aantal + rechts lijst met 9 standaard lampen (Reach/Levi/Noa, uit Wandlampjes_besteloverzicht.xlsx)
      met foto van gekozen lamp, plus Anders ("De klant levert zelf wandlampjes aan en AddOn monteert
      deze."). Buitenstopcontact toont "Dubbel NIKO inbouw horizontaal zwart" + aantal 1/2.
- [x] Wandlamp-foto's (alle 9) staan nu in de app zelf (src/assets/wandlamp), niet meer via ks-verlichting.nl.
- [x] Pagina 14: Merk/Type-vak bij Binnen verlichting weg. Schakelaars: nieuwe optie "Hotelschakeling
      gewenst" -> altijd dubbel (vaste opmerking) + lijst van alle binnen- en buitenverlichting om aan te vinken.
      Samenvatting + PDF bijgewerkt. Levi antraciet is RAL 7022; RAL 7021-opmerking alleen bij Noa.
- [x] Pagina 14 Warmte/Koude: Airco -> Alleen leidingwerk (voorbereiding) / Airco; bij Airco vermogen
      2,5 / 4,2 / 5 kW. Samenvatting + PDF bijgewerkt. Pagina 14 is hiermee helemaal doorgelopen.
- [x] Installatieblok: volgorde nu 14 E-installaties -> 15 W-installaties -> 16 Installatietekening
      (E + W op één tekening) -> 17 Samenvatting (app heeft nu 17 pagina's). Bovenaan het blok 3
      tabknoppen om vrij te wisselen zonder controle; pas bij "Volgende" op de tekening worden E en W
      samen gecontroleerd. PDF: één "Installatietekening (E + W)". Tekening wordt opgeslagen onder de
      bestaande naam Schets_Einstallatie (backend ongewijzigd); de losse W-tekening is vervallen.
- [x] Pagina 15 W-installaties: HWA PVC/Zink/Zwart-zink + aantal. Vorstvrije buitenkraan (direct onder
      HWA): 1 / N.V.T. (kleur en aantal weg). Warmte/Koude -> Vloerverwarming: N.V.T./Aanbouw/Gehele woning,
      dan (alleen bij Gehele woning) m² + Verdeler aanwezig (foto bestaande verdeler) of Verdeler ophangen (warmtebron CV-ketel/
      Warmtepomp/Stadsverwarming + LET OP-tekst stelpost/stopcontact € 300,-). Ketel-vinkje vervallen.
      Validatie, samenvatting en PDF bijgewerkt (m² toonde eerst als "MM").
- [ ] Backend (Azure Functions) opnieuw deployen zodat Foto_Verdeler ook als los bestand in SharePoint
      komt (api/src/graphHelpers.js is al aangepast). Tot die tijd staat de foto alleen in data.json en PDF.
- [x] W/K Water weggehaald (gebeurt altijd hetzelfde). Vloerverwarming m² alleen bij Gehele woning.
- [x] Pagina 16 Installatietekening: symbolen nu getekend volgens de eigen "Elektra Legenda" van AddOn
      (wandcontactdoos enkel/dubbel/drie dubbel, spotje, hanglamp, wandlamp, schakelaar, dimmer,
      sensor, hotelschakelaar, UTP, airco, HWA, buitenkraan, verdeler), één bron in src/symbolen.js.
      Onder de tekening + in de PDF een automatische legenda-tabel (symbool/omschrijving/kleur/type/
      aantal) vanuit E- en W-installaties. Kleur: Wit=RAL 9010, Zwart=RAL 9005. Hotelschakelaar-aantal
      = 2 per aangevinkte verlichtingsgroep.
- [x] Installatietekening (src/InstallatieCanvas.jsx): symbolen blijven losse, aanklikbare onderdelen.
      Tik op symbool -> letter A-E / verwijderen; symbool verslepen = verplaatsen. Nieuw gereedschap
      "Maatlijn": alleen horizontaal/verticaal, klikt vast op een symbool, met tekst (achteraf aan te
      tikken om te wijzigen/verwijderen). Ongedaan maken werkt voor alles. Opslag: schetsEinstallatie
      (platte PNG voor PDF/SharePoint) + schetsInstallatieStaat (pen-laag + objecten, om later verder
      te bewerken). Hotelschakelaar en Verdeler uit de symbolen en de legenda gehaald.
- [x] Navigatiebalk (Vorige/Volgende) staat nu onderaan de pagina i.p.v. vast over de inhoud heen (alle pagina's).
- [ ] Pagina 17 Samenvatting: nog doorlopen.

## Vóór overgang naar productie
- [ ] Custom domain instellen (bijv. inmeetformulier.addon.nl) i.p.v. het huidige Netlify-adres
      (steady-moxie-5e89b5.netlify.app).
- [ ] Client Secret vervaldatum checken: Azure Portal → App registrations → "Addon Inmeet Formulier" →
      Certificates & secrets. (Staat op 24 maanden geldig, exacte datum nog opzoeken.)
- [ ] SharePoint site-URL/testproject-nummer omzetten van testmap naar echte productiemap.
- [ ] **Netlify Private → Public beslissen.** Project staat nu op Private (alleen jij, via Netlify-login,
      kunt de site zien). Zodra collega's de site zonder Netlify-account moeten kunnen gebruiken, moet
      dit naar Public — maar de app heeft zelf geen inlog/toegangscode, dus dat betekent dat iedereen met
      de link (en elk ingevuld projectnummer) bij klantgegevens kan. Eerst een eigen toegangscode in de
      app overwegen vóór dit omgezet wordt.
- [ ] Netlify-abonnement: nu 1 maand op Pro (€20, 3000 credits) tijdens de bouwfase — na deze maand
      terugzetten naar Personal (€9, 1000 credits) voor regulier gebruik.

## Later / optioneel
- [ ] "Toevoegen aan beginscherm" (Add to Home Screen) instructie voor gebruikers, na afronden optimalisatieronde.
- [x] Echte foto's van gevelbekleding-materialen ter vervanging van de huidige kleurstalen — gedaan (zie pagina 6 hierboven).
- [ ] PDF (InmeetPdf.jsx) gebruikt bij Steenstrips/Composiet nog kleurvlakken i.p.v. de nieuwe foto's — optioneel later ook naar foto's.
