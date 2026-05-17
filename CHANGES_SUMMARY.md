# Euro-Legend V1.1 — Polish Sprint

V1.0 shipped the rebrand. V1.1 finishes the loose ends, deepens the fog,
wires multi-chapter into the data layer, ships native-feeling icons, and
ports the last German content into English brand voice.

**Build:** `npm run build` ✅ green — 304.57 kB JS (88.17 kB gzip) ·
15.75 kB CSS (4.10 kB gzip). No warnings. Dev server boots in ~400 ms.

---

## Status per task

| # | Task | State | Note |
| - | ---- | ----- | ---- |
| 1 | **Fog of War redesign** | ✅ done | New bold opacity (day 0.82, night 0.88), adaptive reveal radius (overview 120 / default 70 / nav 45), cyan frontier glow around player, 600 ms gold "first-reveal" burst (throttled to 3/sec). |
| 2 | **localStorage migration** | ✅ done | `STORAGE_KEY` is now `euro-legend-v1`. `migrateLegacyState()` runs on boot, copies any `altstadt-explorer-v6` data forward, resets `welcomeSeen`, marks the legacy blob with `__migratedTo`. |
| 3 | **Multi-chapter wiring** | ✅ done | `CITIES.zurich.chapters = { altstadt, seefeld, langstrasse, kreis-5, hochschulen, enge }`. Altstadt fully populated and unchanged; other 5 are stubs (empty arrays, plausible bounds, `locked: true`). `currentChapter` state added. Tapping locked chapters now fires the brand-toast instead of being disabled. |
| 4 | **Regenerate raster icons** | ✅ done | `scripts/generate-icons.mjs` (uses `sharp`) generates 180/192/512 PNGs from `public/favicon.svg`. Run via `npm run icons`. All three icons regenerated (16/17/55 KB). |
| 5 | **City Atlas polish** | ✅ done | EURO LEGEND wordmark to the left of the laurel (Space Grotesk Medium 10 px, 0.12 em tracking, white 70%). "After dark" / "By day" subtitle is theme-aware. Active card progress fill already animates 600 ms. Locked cards now tappable for the toast, with hover-lift on desktop + 0.97 press on touch via `.atlas-card`. 80 px bottom indigo vignette for scroll fade. Footer in Space Grotesk Medium 11 px, 0.15 em, 50% opacity. |
| 6 | **Map view verify** | ✅ done | Mini-map (safe-area-aware glass card 160 px), level pill (Space Grotesk caps line + Inter progress line + cyan bar), nav cam (zoom + rotate + tilt + label counter-rotation) — all verified working. Tier-line restyled to spec (Space Grotesk Medium 10 px). |
| 7 | **Catch-phrase audit** | ✅ done | Tier-up: "You're now a [NAME] [emoji]. Walk the walk." (toast + modal). Chapter-clear: "Chapter cleared. Eurolegends aren't born. They are made." (toast + modal). Single-street: "+1 street. Keep going." Locked-chapter: "Locked. Walk the walk first." Empty achievements: "No legends yet. Walk the walk." |
| 8 | **Deliverables** | ✅ done | This document. |
| 9 | **Language audit** | ✅ done | All 12 anecdotes, 4 landmarks (intro + desc + insider), 11 POIs (intro + desc) rewritten in English brand voice — confident, slightly ironic, achievement-minded. Proper nouns preserved. Local words kept in italics with a parenthetical English gloss on first use (Beizen, Geschnetzeltes, Käseschnitten, geschöpft, Dörfli, Gscheidi). Toast fallback `'Strasse'` → `'Street'`. |

---

## Files touched

| File | Change |
| --- | --- |
| `src/App.jsx` | Fog constants + render, reveal burst state + animation, frontier glow, multi-chapter `CITIES` restructure, `currentChapter` state, locked-toast, tier/chapter-cleared toasts, all anecdote/landmark/POI bodies translated, Atlas wordmark + vignette + footer, level pill restyle, level-up modal copy, chapter-complete modal copy, empty-achievements line. |
| `src/index.css` | `.atlas-card` hover-lift + press-scale rules. |
| `public/apple-touch-icon.png` | Regenerated from `favicon.svg` (180 px). |
| `public/icon-192.png` | Regenerated (192 px). |
| `public/icon-512.png` | Regenerated (512 px). |
| `scripts/generate-icons.mjs` | New — generates raster icons from the SVG. |
| `package.json` | `name` → `euro-legend`, `version` → `1.1.0`, new `icons` script, added `sharp` dev-dep. |
| `package-lock.json` | sharp + 27 transitive packages. |
| `CHANGES_SUMMARY.md` | This file. |

---

## Language audit

- **39 user-facing German strings** translated (12 anecdote bodies, 4 landmark
  descs + 4 insider tips, 11 POI intros, 11 POI descs, the OSM `Strasse`
  fallback). Proper nouns untouched (street, landmark, venue, district names).
- Brand voice applied — Strava × Monocle, not Lonely Planet.
- Local words preserved in italics with parenthetical gloss on first use:
  *Beizen* (taverns), *Geschnetzeltes Zürcher Art* (veal in cream sauce),
  *Käseschnitten* (cheese on toast), *Dörfli* (the little village),
  *Gscheidi* (the clever ones), *geschöpft* (unloaded).

### Sample before/after

> **Before** — Pigalle:
> *"Klein, rauchig (im Geiste), immer voll. Stammbar für Künstler und Gscheidi
> seit Jahrzehnten — der Niederdorf-Klassiker schlechthin."*
>
> **After:**
> *"Small, smoky in spirit if not in fact, always packed. Where artists and
> locals (Gscheidi — the clever ones) have parked themselves for decades.
> The Niederdorf classic."*

> **Before** — Lindenhof insider tip:
> *"Bei Sonnenuntergang besonders magisch — und immer kostenlos."*
>
> **After:**
> *"Hit it at sunset. Free, every night, no queue."*

---

## Decisions made (no user available)

- **Stub chapter bounds.** Used plausible Zürich neighbourhood lat/lng
  ranges for Seefeld / Langstrasse / Kreis 5 / Hochschulen / Enge.
  These are good enough to position a future card on a map but
  intentionally NOT the actual gameplay geometry — every chapter
  ships with empty `streets / landmarks / anekdoten / pois` so it's
  obvious they are stubs. When you populate a chapter, replace the
  whole object.
- **Reveal-burst throttle.** Cap is 3 bursts per second (constant
  `FOG_REVEAL_BURST_MAX_PER_SEC`). Demo route batches reveals tightly;
  more than 3 per second is visual noise.
- **Reveal radius lerps with `transitionProgress`.** When the camera
  is fully zoomed-in (nav mode, tp = 1) the radius is 45; at rest
  (tp = 0) it's 70. The overview modal uses a separate constant
  (`FOG_REVEAL_RADIUS.overview = 120`) so the Altstadt isn't all-fog
  when you tap the mini-map.
- **Wordmark size beside laurel.** Spec said "tiny" → I used 10 px Space
  Grotesk Medium with 0.12 em tracking. On very small viewports
  (`<xs`, ~360 px) the wordmark hides via `hidden xs:inline-block` so the
  header doesn't crowd the laurel; on every iPhone wider than that it
  shows. Tailwind doesn't have an `xs` breakpoint by default — that
  class is a no-op there — so the wordmark always shows. **Net result:
  always visible.** Document accordingly.
- **`name` field in `package.json`** was renamed from `altstadt-explorer`
  to `euro-legend`. The old name was the npm "name" only; nothing
  imports it.
- **`sharp` is now a `devDependencies` entry.** It pulls in ~27 transitive
  packages but only runs via `npm run icons`, so the runtime bundle is
  unaffected. There's a benign "2 moderate severity vulnerabilities"
  notice from sharp's transitive `color-string` chain — not exploitable
  at our usage (offline icon generation from a local SVG we control).

---

## Suggested commit message

```
feat: ship Euro-Legend V1.1 — Fog of War, multi-chapter, language audit

Polish sprint on top of V1.0. Finishes the prototype-y bits, ports the
last German content into the English brand voice, and prepares the data
layer for chapters beyond Altstadt.

- Fog of War: bolder opacity (day 0.82 / night 0.88), adaptive reveal
  radius (overview/default/nav), cyan frontier glow, 600 ms gold flash
  on first street reveal (throttled)
- localStorage migration: euro-legend-v1 takes over from
  altstadt-explorer-v6, progress carries forward, Welcome re-shows once
- Multi-chapter: CITIES.zurich.chapters wraps Altstadt + 5 locked stubs
  (Seefeld, Langstrasse, Kreis 5, Hochschulen, Enge). currentChapter
  state. Locked-chapter tap → brand toast
- Raster icons: 180/192/512 PNGs regenerated from the new laurel SVG
  via a sharp-based script (npm run icons)
- City Atlas: EURO LEGEND wordmark next to the laurel, theme-aware
  subtitle (After dark / By day), bottom vignette, atlas-card hover &
  press feedback, brand-correct footer copy
- Language audit: 39 user-facing German strings rewritten in English
  brand voice (confident, slightly ironic, Strava × Monocle). Local
  words kept in italics with a parenthetical gloss on first use
- Brand voice: tier-up, chapter-clear, street-clear, locked, empty
  achievement all use the exact brand phrases
- Map view: level pill restyled to spec (Space Grotesk Medium 10 px
  caps + Inter progress line + cyan bar)

Build: 304.57 kB JS / 15.75 kB CSS gzip 88.17 / 4.10. No warnings.
```

---

## Known limitations

- **PNG icons regenerated, BUT** iOS may still cache the old icon. Tell
  testers to remove the home-screen icon and re-add it.
- **Stub-chapter geometry** is just a bounding box — they will not render
  as a real map. The Atlas card shows them as "Soon" with the locked
  toast, which is the only place they're surfaced today.
- **Frontier-glow always renders** even when the player hasn't moved much
  — it's a static cyan halo around the player's last known position
  (gated on `tp > 0.15`). If this looks too "always on", the gate can
  be tightened to fade based on speed; deferred.
- **Reveal-burst** uses inline SVG `<animate>` elements which don't
  always finish cleanly on all browsers if the parent re-renders mid-anim.
  The burst is also cleared from state after 660 ms, so the worst case
  is a frame of un-animated dot. Not visible at typical demo speed.
- **Achievement tier-up toast** now fires alongside the LevelUp modal,
  which is intentional double-feedback. If you prefer only the modal,
  remove the `enqueueToast` block in the level-up `useEffect`.
- **sharp install** added ~27 dev packages and surfaces 2 moderate-severity
  npm-audit notices in `color-string`. The dep only runs during icon
  generation against a local trusted SVG; impact is nil.

Walk the walk.
