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
- [ ] Pagina 5 t/m 19: nog doorlopen en optimaliseren (zelfde aanpak als pagina 1-4).

## Vóór overgang naar productie
- [ ] Custom domain instellen (bijv. inmeetformulier.addon.nl) i.p.v. het huidige Azure-adres.
- [ ] Client Secret vervaldatum checken: Azure Portal → App registrations → "Addon Inmeet Formulier" →
      Certificates & secrets. (Staat op 24 maanden geldig, exacte datum nog opzoeken.)
- [ ] SharePoint site-URL/testproject-nummer omzetten van testmap naar echte productiemap.

## Later / optioneel
- [ ] "Toevoegen aan beginscherm" (Add to Home Screen) instructie voor gebruikers, na afronden optimalisatieronde.
- [ ] Echte foto's van gevelbekleding-materialen ter vervanging van de huidige kleurstalen (indien aangeleverd).
