# Euro-Legend

**Walk the walk, if you talk the talk. Eurolegends aren't born. They are made.**

A React/Vite web-app for the Euro Summer crowd. Pick a city, walk its streets,
and earn the laurel — chapter by chapter. The first chapter ships with Zürich
(Old Town). More cities are coming.

Runs entirely in the browser (incl. iPad / iPhone), uses real GPS when
available, and feels like a native app once added to the home screen.

## Stack

- **React 18** + **Vite 5**
- **Tailwind CSS** (utilities inline in JSX)
- **lucide-react** for icons
- **OpenStreetMap** via Overpass-API for true street/building geometry
- Web Audio · Vibrate · Geolocation · Wake Lock · localStorage

## Run it locally

```bash
npm install
npm run dev
```

The dev server prints two URLs:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Open the **Network** URL from your phone on the same Wi-Fi to test on a
real device. iOS Safari requires HTTPS for live GPS — use the Demo Mode or
tap-to-walk simulation while on `http://`. Once deployed (Vercel, Netlify,
etc.) HTTPS is automatic and GPS works.

## Add to Home Screen (iOS)

1. Open the deployed URL in Safari.
2. Tap the Share button.
3. **Add to Home Screen**.

The app launches fullscreen (`display: standalone`), uses the laurel icon,
and persists progress in `localStorage`.

## Build

```bash
npm run build       # → dist/
npm run preview     # serve dist/ locally
```

## Project structure

```
euro-legend/
├── public/
│   ├── apple-touch-icon.png       iOS home-screen icon (laurel)
│   ├── icon-192.png · icon-512.png   PWA icons
│   ├── favicon.svg                laurel wreath SVG
│   └── manifest.webmanifest
├── src/
│   ├── App.jsx                    the whole app (~4000 lines)
│   ├── main.jsx                   React entry point
│   └── index.css                  Tailwind directives + reset + safe-area
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Notes

- **OSM data** is fetched from Overpass on first launch (5–20 s) and cached
  in `localStorage` for 30 days. Cache can exceed 5 MB — some browsers
  reject the write, in which case the app re-fetches next time.
- **UI is English; content stays local.** Street names, anecdotes, bar
  names etc. stay in the language of the city (German for Zürich). Future
  cities follow the same rule.
- **Multi-city wiring** is in place (`CITIES` object), the UI for switching
  is not — Zürich is the only chapter for now.

Walk the walk.
