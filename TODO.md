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
- [ ] Pagina 8, 10, 12 t/m 18: nog doorlopen en optimaliseren (zelfde aanpak als pagina 1-7).

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
