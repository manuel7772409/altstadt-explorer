# Altstadt-Entdecker

Erkunde Zürich Gasse für Gasse — eine Stadt aus Wolken, die nur deine Schritte vertreiben können.

Eine React/Vite-Web-App, die direkt im Browser läuft (auch auf dem iPad), GPS nutzt und sich wie eine echte App anfühlt, wenn sie zum Home-Bildschirm hinzugefügt wird.

## Voraussetzungen

- **Node.js 18+** ([nodejs.org](https://nodejs.org) — die LTS-Version reicht).
- Ein Computer mit Mac, Windows oder Linux fürs Bauen.
- Ein iPad (oder iPhone, Android-Phone, beliebiger Browser) zum Ausprobieren.

## In 5 Minuten lokal starten

```bash
# 1. In den Projektordner wechseln
cd altstadt-explorer

# 2. Abhängigkeiten installieren (einmalig, dauert 1–2 Minuten)
npm install

# 3. Entwicklungsserver starten
npm run dev
```

Der Output zeigt zwei URLs, etwa:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.42:5173/
```

- **Local** → im Browser auf demselben Computer öffnen.
- **Network** → diese URL kannst du im **iPad-Safari** öffnen, wenn iPad und Computer im selben WLAN sind. Schon hast du die App live auf dem iPad mit funktionierendem GPS.

## Auf den iPad-Home-Screen legen (Pseudo-App)

1. Im Safari die Network-URL öffnen.
2. Teilen-Symbol unten antippen.
3. **„Zum Home-Bildschirm"** wählen.
4. Name bestätigen, fertig.

Das App-Icon erscheint wie eine native App. Beim Tippen öffnet sie sich **im Vollbild ohne Browser-Leiste** (`display: standalone` im manifest), nutzt das eigene Icon und behält ihren Speicher (Fortschritt, Karten-Cache) in `localStorage`.

## Ins Internet stellen (damit du die App auch ausserhalb deines WLANs nutzen kannst)

### Schnellster Weg: Vercel (kostenlos, ~3 Minuten)

1. **GitHub-Account erstellen** (falls nicht vorhanden) und ein neues Repository anlegen.
2. Code lokal in das Repo schieben:
   ```bash
   git init
   git add .
   git commit -m "initial"
   git branch -M main
   git remote add origin https://github.com/DEIN-USER/altstadt-explorer.git
   git push -u origin main
   ```
3. Auf [vercel.com](https://vercel.com) einloggen (mit GitHub).
4. **„New Project"** → das eben erstellte Repo auswählen → **„Deploy"**.

Vercel erkennt Vite automatisch, baut die App und gibt dir eine URL wie `altstadt-explorer-DEINNAME.vercel.app`. Diese URL kannst du auf jedem Gerät öffnen.

### Alternative: Netlify

1. `npm run build` ausführen (erzeugt `dist/`-Ordner).
2. Auf [netlify.com](https://app.netlify.com/drop) den `dist/`-Ordner per Drag-and-Drop hochladen.
3. URL ist sofort live.

## Echte App im App Store (optional, fortgeschritten)

Wenn du die App nicht nur als Web-App, sondern als echte iOS-App (mit Push-Notifications, App-Store-Listing usw.) haben willst, geht das mit **Capacitor**. Das setzt einen Mac, Xcode und einen Apple-Developer-Account ($99/Jahr) voraus.

```bash
npm install @capacitor/core @capacitor/ios
npx cap init "Altstadt-Entdecker" "ch.dein.altstadt"
npm run build
npx cap add ios
npx cap sync
npx cap open ios
```

In Xcode dann auf „Run" klicken — die App installiert sich auf dem angeschlossenen iPad. Für die App Store Veröffentlichung brauchst du den Developer-Account und musst durch den Review-Prozess.

## Bekannte Hinweise

- **GPS auf iPad**: Funktioniert nur über **HTTPS** oder über `localhost`. Im lokalen Netzwerk (`192.168.x.x`) verlangt iOS Safari https. Lokal kannst du trotzdem testen — die App hat einen Demo- und Tap-to-Walk-Modus, die ohne GPS auskommen. Sobald du die App auf Vercel oder Netlify deployst, ist HTTPS automatisch dabei und GPS funktioniert.
- **OSM-Daten beim ersten Start**: Beim allerersten Öffnen lädt die App die Karten-Geometrie (Häuser, Strassen, Wasser, Parks) von Overpass-API. Das dauert 5–20 Sekunden. Danach wird alles 30 Tage lang im `localStorage` gecached.
- **Speicherplatz**: Der OSM-Cache kann bis zu ~5 MB im `localStorage` belegen. Manche Browser begrenzen das. Wenn das Speichern fehlschlägt, lädt die App die Daten beim nächsten Mal einfach neu.

## Tech-Stack

- **React 18** mit Hooks
- **Vite 5** als Build-Tool
- **Tailwind CSS** für Styling (alle Klassen sind im JSX inline)
- **lucide-react** für Icons
- **OpenStreetMap** via Overpass-API für Karten-Geometrie
- Web Audio API · Vibrate API · Geolocation API · Wake Lock API · localStorage

## Projekt-Struktur

```
altstadt-explorer/
├── public/
│   ├── apple-touch-icon.png      iOS Home-Screen-Icon
│   ├── icon-192.png · icon-512.png   PWA-Icons
│   ├── favicon.svg
│   └── manifest.webmanifest
├── src/
│   ├── App.jsx                   die ganze App (~3500 Zeilen)
│   ├── main.jsx                  React-Einstiegspunkt
│   └── index.css                 Tailwind-Direktiven + Reset
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

Viel Spass beim Erkunden!
