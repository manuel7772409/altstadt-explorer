import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Compass, MapPin, Trophy, Sparkles, Play, Pause, Footprints, Mountain,
  Crown, Award, RefreshCw, Navigation, Clock, Route, X, Wand2,
  Star, Lock, CheckCircle2, Moon, ArrowUpRight, ArrowLeft,
  BookOpen, Feather, Building2, Trees, Music2, GraduationCap, Waves,
  Settings as SettingsIcon, Volume2, VolumeX, Vibrate, NotebookPen, Sun,
  Martini, UtensilsCrossed, Disc3, Wine, ChefHat, Loader2,
} from 'lucide-react';

/* ============================================================================
   GEO BOUNDS — Zürich Altstadt
============================================================================ */

const BOUNDS = { minLat: 47.3650, maxLat: 47.3775, minLng: 8.5378, maxLng: 8.5478 };
const VIEWPORT = { width: 1000, height: 820 };

/* Erweiterter Render-Bereich: 4000×4000-Polster um das Altstadt-Zentrum.
   Deckt jede mögliche Kombination aus Zoom, Rotation (0-360°) und Tilt ab,
   damit beim Rotieren keine leeren Container-Ecken sichtbar werden.
   Nur Hintergrund + Fog werden auf EXTENT vergrössert — Strassen/Häuser/POIs
   bleiben in ihren echten geographischen Positionen innerhalb von VIEWPORT. */
const EXTENT_HALF = 2000;
const EXTENT = {
  x: VIEWPORT.width / 2 - EXTENT_HALF,    // -1500
  y: VIEWPORT.height / 2 - EXTENT_HALF,   // -1590
  w: 2 * EXTENT_HALF,                      // 4000
  h: 2 * EXTENT_HALF,                      // 4000
};

const STREETS_RAW = [
  { id: 'limmatquai', name: 'Limmatquai', side: 'east',
    points: [[47.3674,8.5418],[47.3690,8.5424],[47.3705,8.5430],[47.3722,8.5432],[47.3738,8.5428],[47.3748,8.5420]] },
  { id: 'niederdorfstr', name: 'Niederdorfstrasse', side: 'east',
    points: [[47.3700,8.5439],[47.3712,8.5438],[47.3724,8.5436],[47.3736,8.5434],[47.3744,8.5432]] },
  { id: 'munstergasse', name: 'Münstergasse', side: 'east',
    points: [[47.3702,8.5435],[47.3702,8.5444],[47.3702,8.5455]] },
  { id: 'kirchgasse', name: 'Kirchgasse', side: 'east',
    points: [[47.3699,8.5440],[47.3697,8.5450]] },
  { id: 'spiegelgasse', name: 'Spiegelgasse', side: 'east',
    points: [[47.3713,8.5440],[47.3708,8.5442],[47.3704,8.5444]] },
  { id: 'marktgasse', name: 'Marktgasse', side: 'east',
    points: [[47.3727,8.5435],[47.3722,8.5438],[47.3716,8.5440]] },
  { id: 'rindermarkt', name: 'Rindermarkt', side: 'east',
    points: [[47.3713,8.5438],[47.3713,8.5446]] },
  { id: 'neumarkt', name: 'Neumarkt', side: 'east',
    points: [[47.3713,8.5446],[47.3716,8.5455],[47.3719,8.5462]] },
  { id: 'predigerplatz', name: 'Predigerplatz', side: 'east',
    points: [[47.3735,8.5440],[47.3735,8.5450],[47.3736,8.5458]] },
  { id: 'muhlegasse', name: 'Mühlegasse', side: 'east',
    points: [[47.3744,8.5435],[47.3750,8.5440]] },
  { id: 'obere-zaune', name: 'Obere Zäune', side: 'east',
    points: [[47.3712,8.5448],[47.3708,8.5458],[47.3702,8.5468]] },
  { id: 'froschaugasse', name: 'Froschaugasse', side: 'east',
    points: [[47.3735,8.5440],[47.3740,8.5448]] },
  { id: 'stussihofstatt', name: 'Stüssihofstatt', side: 'east',
    points: [[47.3722,8.5440],[47.3725,8.5444]] },
  { id: 'rosengasse', name: 'Rosengasse', side: 'east',
    points: [[47.3718,8.5443],[47.3722,8.5447]] },
  { id: 'hirschenplatz', name: 'Hirschenplatz', side: 'east',
    points: [[47.3727,8.5435],[47.3729,8.5440]] },
  { id: 'bahnhofstr', name: 'Bahnhofstrasse', side: 'west',
    points: [[47.3760,8.5398],[47.3742,8.5400],[47.3722,8.5402],[47.3700,8.5404],[47.3683,8.5410],[47.3672,8.5417]] },
  { id: 'rennweg', name: 'Rennweg', side: 'west',
    points: [[47.3722,8.5398],[47.3722,8.5408],[47.3720,8.5414]] },
  { id: 'storchengasse', name: 'Storchengasse', side: 'west',
    points: [[47.3702,8.5410],[47.3700,8.5417]] },
  { id: 'augustinergasse', name: 'Augustinergasse', side: 'west',
    points: [[47.3727,8.5403],[47.3720,8.5408],[47.3712,8.5413]] },
  { id: 'munsterhof', name: 'Münsterhof', side: 'west',
    points: [[47.3702,8.5410],[47.3705,8.5414]] },
  { id: 'weinplatz', name: 'Weinplatz', side: 'west',
    points: [[47.3705,8.5418],[47.3708,8.5420]] },
  { id: 'lindenhof', name: 'Lindenhof', side: 'west',
    points: [[47.3725,8.5407],[47.3722,8.5413],[47.3718,8.5414]] },
  { id: 'schipfe', name: 'Schipfe', side: 'west',
    points: [[47.3722,8.5418],[47.3712,8.5418],[47.3705,8.5418]] },
  { id: 'strehlgasse', name: 'Strehlgasse', side: 'west',
    points: [[47.3712,8.5408],[47.3712,8.5414]] },
  { id: 'st-peterhofstatt', name: 'St. Peterhofstatt', side: 'west',
    points: [[47.3712,8.5414],[47.3712,8.5418]] },
  { id: 'fortunagasse', name: 'Fortunagasse', side: 'west',
    points: [[47.3727,8.5402],[47.3722,8.5407]] },
  { id: 'munsterbrucke', name: 'Münsterbrücke', side: 'bridge',
    points: [[47.3700,8.5418],[47.3700,8.5430]] },
  { id: 'rathausbrucke', name: 'Rathausbrücke', side: 'bridge',
    points: [[47.3712,8.5420],[47.3712,8.5432]] },
  { id: 'rudolf-brun-brucke', name: 'Rudolf-Brun-Brücke', side: 'bridge',
    points: [[47.3735,8.5420],[47.3735,8.5430]] },
  { id: 'quaibrucke', name: 'Quaibrücke', side: 'bridge',
    points: [[47.3666,8.5417],[47.3665,8.5443]] },
  // Niederdorf side — narrow alleys
  { id: 'brunngasse', name: 'Brunngasse', side: 'east',
    points: [[47.3717,8.5443],[47.3719,8.5450]] },
  { id: 'haringstr', name: 'Häringstrasse', side: 'east',
    points: [[47.3737,8.5430],[47.3739,8.5438]] },
  { id: 'krongasse', name: 'Krongasse', side: 'east',
    points: [[47.3711,8.5440],[47.3711,8.5446]] },
  { id: 'zahringerstr', name: 'Zähringerstrasse', side: 'east',
    points: [[47.3744,8.5424],[47.3744,8.5435]] },
  { id: 'untere-zaune', name: 'Untere Zäune', side: 'east',
    points: [[47.3702,8.5468],[47.3695,8.5470]] },
  { id: 'spital-steig', name: 'Spitalgasse', side: 'east',
    points: [[47.3706,8.5455],[47.3712,8.5453]] },
  { id: 'schiffl', name: 'Schifflände', side: 'east',
    points: [[47.3690,8.5424],[47.3683,8.5419]] },
  // Lindenhof side — alleys & connectors
  { id: 'in-gassen', name: 'In Gassen', side: 'west',
    points: [[47.3705,8.5410],[47.3702,8.5413]] },
  { id: 'kuttelgasse', name: 'Kuttelgasse', side: 'west',
    points: [[47.3712,8.5407],[47.3712,8.5402]] },
  { id: 'pfalzgasse', name: 'Pfalzgasse', side: 'west',
    points: [[47.3724,8.5413],[47.3722,8.5418]] },
  { id: 'glockengasse', name: 'Glockengasse', side: 'west',
    points: [[47.3717,8.5408],[47.3712,8.5404]] },
  { id: 'wuhre', name: 'Wühre', side: 'west',
    points: [[47.3700,8.5418],[47.3690,8.5419]] },
  { id: 'stadthausquai', name: 'Stadthausquai', side: 'west',
    points: [[47.3680,8.5417],[47.3666,8.5418]] },
  { id: 'beatengasse', name: 'Beatengasse', side: 'west',
    points: [[47.3717,8.5402],[47.3722,8.5402]] },
  { id: 'talacker', name: 'Talacker', side: 'west',
    points: [[47.3692,8.5400],[47.3700,8.5402]] },
  // North — Hauptbahnhof connectors
  { id: 'bahnhofquai', name: 'Bahnhofquai', side: 'north',
    points: [[47.3760,8.5398],[47.3762,8.5410],[47.3760,8.5418],[47.3754,8.5421]] },
  { id: 'bahnhofstr-platz', name: 'Bahnhofplatz', side: 'north',
    points: [[47.3762,8.5398],[47.3768,8.5392]] },
];

/* Limmat — south to north, denser polyline for smoother curve */
const RIVER_PATH = [
  [47.3666,8.5417],[47.3672,8.5418],[47.3680,8.5421],[47.3686,8.5423],
  [47.3692,8.5424],[47.3698,8.5424],[47.3705,8.5425],[47.3712,8.5425],
  [47.3720,8.5425],[47.3728,8.5425],[47.3736,8.5424],[47.3744,8.5422],
  [47.3750,8.5418],[47.3754,8.5414],[47.3758,8.5410]
];

/* River widens at the lake mouth */
const LAKE_PATH = [
  [47.3672,8.5410],[47.3666,8.5417],[47.3658,8.5430],[47.3658,8.5460],
  [47.3658,8.5475],[47.3666,8.5475],[47.3666,8.5443],[47.3666,8.5417],
];

/* Hauptbahnhof — building footprint + track lines */
const HBF_BUILDING = [
  [47.3768, 8.5388], [47.3768, 8.5402], [47.3760, 8.5402], [47.3760, 8.5388],
];
const HBF_TRACKS = [
  [[47.3768, 8.5392], [47.3768, 8.5380]],
  [[47.3766, 8.5392], [47.3766, 8.5380]],
  [[47.3764, 8.5392], [47.3764, 8.5380]],
  [[47.3762, 8.5392], [47.3762, 8.5380]],
];

/* Tram tracks — parallel pairs running along main streets */
const TRAM_LINES = [
  // Bahnhofstrasse
  [[47.3760,8.5398],[47.3742,8.5400],[47.3722,8.5402],[47.3700,8.5404],[47.3683,8.5410],[47.3672,8.5417]],
  // Limmatquai
  [[47.3674,8.5418],[47.3690,8.5424],[47.3705,8.5430],[47.3722,8.5432],[47.3738,8.5428],[47.3748,8.5420]],
];

/* Building blocks — polygons of city blocks (negative space between streets).
   These give the map "body" — like a vintage cartographer's map. */
const BLOCKS = [
  // Niederdorf side blocks
  { id: 'b-niederdorf-s1', poly: [[47.3700,8.5430],[47.3702,8.5435],[47.3702,8.5440],[47.3700,8.5440],[47.3700,8.5435]] },
  { id: 'b-niederdorf-s2', poly: [[47.3704,8.5435],[47.3712,8.5435],[47.3712,8.5439],[47.3705,8.5439],[47.3704,8.5436]] },
  { id: 'b-niederdorf-m1', poly: [[47.3713,8.5435],[47.3722,8.5435],[47.3722,8.5439],[47.3713,8.5439]] },
  { id: 'b-niederdorf-m2', poly: [[47.3713,8.5440],[47.3719,8.5440],[47.3719,8.5446],[47.3713,8.5446]] },
  { id: 'b-niederdorf-m3', poly: [[47.3713,8.5447],[47.3717,8.5448],[47.3722,8.5455],[47.3713,8.5453]] },
  { id: 'b-niederdorf-n1', poly: [[47.3722,8.5435],[47.3735,8.5434],[47.3735,8.5439],[47.3722,8.5440]] },
  { id: 'b-niederdorf-n2', poly: [[47.3736,8.5434],[47.3744,8.5432],[47.3744,8.5438],[47.3737,8.5439]] },
  { id: 'b-niederdorf-n3', poly: [[47.3736,8.5440],[47.3744,8.5439],[47.3744,8.5448],[47.3736,8.5448]] },
  { id: 'b-niederdorf-e1', poly: [[47.3702,8.5444],[47.3708,8.5444],[47.3708,8.5455],[47.3702,8.5455]] },
  { id: 'b-niederdorf-e2', poly: [[47.3719,8.5440],[47.3727,8.5440],[47.3729,8.5444],[47.3722,8.5447]] },
  { id: 'b-niederdorf-e3', poly: [[47.3729,8.5440],[47.3735,8.5440],[47.3735,8.5448],[47.3729,8.5446]] },
  { id: 'b-niederdorf-river', poly: [[47.3700,8.5425],[47.3712,8.5430],[47.3712,8.5434],[47.3700,8.5430]] },

  // Lindenhof side blocks
  { id: 'b-lindenhof-hill', poly: [[47.3725,8.5407],[47.3722,8.5413],[47.3718,8.5414],[47.3712,8.5413],[47.3712,8.5408],[47.3717,8.5403],[47.3722,8.5403]] },
  { id: 'b-stpeter', poly: [[47.3712,8.5408],[47.3712,8.5413],[47.3712,8.5418],[47.3705,8.5418],[47.3705,8.5414],[47.3705,8.5410]] },
  { id: 'b-bahnhof-rennweg', poly: [[47.3722,8.5398],[47.3722,8.5403],[47.3712,8.5403],[47.3705,8.5404],[47.3700,8.5404],[47.3700,8.5398]] },
  { id: 'b-bahnhof-fraumuenster', poly: [[47.3700,8.5404],[47.3702,8.5410],[47.3700,8.5413],[47.3690,8.5410],[47.3683,8.5410],[47.3690,8.5404]] },
  { id: 'b-fraumuenster-river', poly: [[47.3700,8.5413],[47.3702,8.5414],[47.3705,8.5418],[47.3700,8.5418],[47.3690,8.5419],[47.3690,8.5413]] },
  { id: 'b-rennweg-augustiner', poly: [[47.3722,8.5398],[47.3727,8.5402],[47.3722,8.5407],[47.3722,8.5403]] },
  { id: 'b-augustiner-lindenhof', poly: [[47.3727,8.5403],[47.3730,8.5398],[47.3742,8.5400],[47.3725,8.5407]] },
  { id: 'b-bahnhof-north', poly: [[47.3742,8.5400],[47.3760,8.5398],[47.3760,8.5402],[47.3742,8.5402]] },
  { id: 'b-bahnhof-quai', poly: [[47.3754,8.5408],[47.3760,8.5410],[47.3758,8.5418],[47.3744,8.5417]] },
  { id: 'b-schipfe', poly: [[47.3722,8.5413],[47.3718,8.5414],[47.3712,8.5418],[47.3712,8.5421],[47.3722,8.5421]] },
];

/* Plazas — open named squares (lighter, no buildings) */
const PLAZAS = [
  { id: 'p-lindenhof', name: 'Lindenhof', poly: [[47.3725,8.5403],[47.3727,8.5408],[47.3725,8.5413],[47.3722,8.5413],[47.3720,8.5408],[47.3722,8.5403]], type: 'park' },
  { id: 'p-muensterhof', name: 'Münsterhof', poly: [[47.3700,8.5410],[47.3705,8.5410],[47.3705,8.5414],[47.3700,8.5414],[47.3698,8.5412]], type: 'paved' },
  { id: 'p-hirschenplatz', name: 'Hirschenplatz', poly: [[47.3727,8.5435],[47.3729,8.5440],[47.3725,8.5441],[47.3725,8.5436]], type: 'paved' },
  { id: 'p-weinplatz', name: 'Weinplatz', poly: [[47.3705,8.5418],[47.3708,8.5420],[47.3705,8.5422],[47.3702,8.5420]], type: 'paved' },
  { id: 'p-burkliplatz', name: 'Bürkliplatz', poly: [[47.3666,8.5410],[47.3672,8.5410],[47.3672,8.5418],[47.3666,8.5418]], type: 'paved' },
  { id: 'p-stpeterhof', name: 'St. Peterhofstatt', poly: [[47.3711,8.5414],[47.3714,8.5414],[47.3714,8.5417],[47.3711,8.5417]], type: 'paved' },
];

/* Fountains — Zürich's iconic brunnen */
const FOUNTAINS = [
  { id: 'f-lindenhof', coords: [47.3724, 8.5408] },
  { id: 'f-hirschenplatz', coords: [47.3728, 8.5438] },
  { id: 'f-muensterhof', coords: [47.3702, 8.5412] },
  { id: 'f-weinplatz', coords: [47.3706, 8.5419] },
  { id: 'f-rindermarkt', coords: [47.3713, 8.5443] },
  { id: 'f-stpeter', coords: [47.3713, 8.5416] },
  { id: 'f-rathausbruke', coords: [47.3712, 8.5426] },
];

/* ============================================================================
   POIs — Top bars, restaurants, clubs in Altstadt
============================================================================ */

const POIS = [
  // Bars
  { id: 'b-widder', kind: 'bar', name: 'Widder Bar', coords: [47.3724, 8.5413],
    intro: 'A whisky temple inside the Widder Hotel',
    desc: 'Five-star hotel bar with 850+ whiskies on the shelf and live jazz most nights. Routinely named one of the best hotel bars in Europe.' },
  { id: 'b-kronenhalle', kind: 'bar', name: 'Kronenhalle Bar', coords: [47.3699, 8.5447],
    intro: 'Picasso on the wall, cocktail in hand',
    desc: 'Real Picassos, Chagalls, Mirós and Matisses on the walls. Classic bar etiquette, world-famous Ladykiller cocktail. No phones, no shouting, no excuses.' },
  { id: 'b-pigalle', kind: 'bar', name: 'Pigalle', coords: [47.3725, 8.5436],
    intro: 'Niederdorf institution',
    desc: 'Small, smoky in spirit if not in fact, always packed. Where artists and locals (Gscheidi — the clever ones) have parked themselves for decades. The Niederdorf classic.' },
  { id: 'b-oldcrow', kind: 'bar', name: 'Old Crow', coords: [47.3702, 8.5417],
    intro: 'Hidden speakeasy cocktail bar',
    desc: 'Tucked into a back courtyard — hard to find, always full. Serious cocktails, low light, low ceiling. Worth the hunt.' },
  { id: 'b-bar63', kind: 'bar', name: 'Bar 63 (Storchen)', coords: [47.3706, 8.5419],
    intro: 'Hotel terrace on the Limmat',
    desc: 'Right on the river at Hotel Storchen — probably the best terrace in town, looking straight at the Grossmünster towers.' },

  // Restaurants
  { id: 'r-kronenhalle', kind: 'restaurant', name: 'Kronenhalle', coords: [47.3697, 8.5448],
    intro: 'Swiss classic since 1924',
    desc: 'Joyce, Picasso and Stravinsky ate here. White tablecloths, classic kitchen, Geschnetzeltes Zürcher Art (veal in cream sauce) and Crêpes Suzette done the way they were done a century ago.' },
  { id: 'r-zeughauskeller', kind: 'restaurant', name: 'Zeughauskeller', coords: [47.3712, 8.5402],
    intro: 'Medieval beer hall',
    desc: 'Set in Zürich\'s 15th-century armoury — giant Bratwurst (sausage), Rösti, beer in stoneware mugs, halberds on the walls. Tourist trap, sure. Also: actually good.' },
  { id: 'r-swisschuchi', kind: 'restaurant', name: 'Swiss Chuchi', coords: [47.3719, 8.5444],
    intro: 'Landmark fondue',
    desc: 'Inside Hotel Adler. The cliché Niederdorf fondue night — loud, crowded, exactly what you came for. Don\'t fight it.' },
  { id: 'r-dezaley', kind: 'restaurant', name: 'Le Dézaley', coords: [47.3713, 8.5448],
    intro: 'Bistro from the Vaud',
    desc: 'A wood-beamed Beiz (Swiss-German for old-school tavern) doing Käseschnitten (cheese on toast, taken seriously), perch fillets and Lavaux wine. Lake-Geneva energy, dropped into Zürich.' },
  { id: 'r-rueden', kind: 'restaurant', name: 'Haus zum Rüden', coords: [47.3713, 8.5430],
    intro: 'Gothic guildhall, white linen',
    desc: 'A 1348 guildhall — refined Swiss cooking under a wooden vault that looks like an upside-down church. Dress for it.' },

  // Clubs
  { id: 'c-mascotte', kind: 'club', name: 'Mascotte', coords: [47.3674, 8.5462],
    intro: 'Zürich\'s oldest music club',
    desc: 'On Bellevue since 1917. Concerts, live bands, indie-disco nights. Sunday karaoke ("Heaven") is famously, gloriously, a mess.' },
  { id: 'c-kaufleuten', kind: 'club', name: 'Kaufleuten', coords: [47.3704, 8.5392],
    intro: 'The cult stage in town',
    desc: 'Madonna, Bowie and Iggy Pop all played here. Now a club / theatre / restaurant hybrid — one of the most important cultural addresses in Switzerland.' },
];

const POI_RADIUS_M = 28;

/* Tree clusters — Lindenhof park & along quais */
const TREES = [
  // Lindenhof park trees
  { c: [47.37245, 8.54068] }, { c: [47.37238, 8.54072] }, { c: [47.37232, 8.54078] },
  { c: [47.37227, 8.54085] }, { c: [47.37222, 8.54093] }, { c: [47.37232, 8.54095] },
  { c: [47.37240, 8.54088] }, { c: [47.37242, 8.54080] }, { c: [47.37236, 8.54065] },
  // Bürkliplatz / lake side
  { c: [47.36680, 8.54160] }, { c: [47.36680, 8.54200] }, { c: [47.36680, 8.54240] },
  // North — bahnhofquai
  { c: [47.37580, 8.54100] }, { c: [47.37580, 8.54140] }, { c: [47.37580, 8.54180] },
  // Predigerplatz area
  { c: [47.37345, 8.54450] }, { c: [47.37355, 8.54470] },
];

/* ============================================================================
   LANDMARKS — must-sees with star unlock mechanic
============================================================================ */

const LANDMARKS = [
  { id: 'grossmuenster', name: 'Grossmünster', coords: [47.3702, 8.5443],
    intro: 'Zürich\'s twin-towered icon',
    desc: 'A 12th-century Romanesque church, supposedly founded by Charlemagne himself. Huldrych Zwingli started preaching here in 1519 — the spark of the Swiss Reformation.',
    insider: 'Climb the Karlsturm tower for the best view in the Old Town.' },
  { id: 'fraumuenster', name: 'Fraumünster', coords: [47.3700, 8.5413],
    intro: 'The Chagall windows',
    desc: 'A former abbey of women, now home to five stained-glass windows by Marc Chagall (1970) and one by Augusto Giacometti. One of Zürich\'s genuine treasures.',
    insider: 'Late morning is when the light through the windows really sings.' },
  { id: 'lindenhof-hill', name: 'Lindenhof', coords: [47.3724, 8.5408],
    intro: 'View hill with Roman roots',
    desc: 'A Roman customs post sat on this hill, then an imperial palace. Today: locals playing chess under linden trees, panoramic views over Niederdorf and the Limmat.',
    insider: 'Hit it at sunset. Free, every night, no queue.' },
  { id: 'st-peter', name: 'St. Peter', coords: [47.3713, 8.5413],
    intro: 'Europe\'s biggest clock face',
    desc: 'Zürich\'s oldest parish church, with the largest church-tower clock face in Europe — 8.7 m across. The tower used to be a fire watch; the tower-keeper\'s flat is still up there.',
    insider: 'The minute hand alone is 5.7 m long.' },
];

/* ============================================================================
   ANEKDOTEN — lore discoveries (no star, just atmosphere)
============================================================================ */

const ANEKDOTEN = [
  { id: 'cabaret-voltaire', name: 'Cabaret Voltaire', coords: [47.3713, 8.5441],
    intro: 'Where Dada was born',
    desc: '1916. Hugo Ball, Tristan Tzara and friends founded the Cabaret Voltaire here — ground zero for the Dada movement. The First World War raged outside; inside, the avant-garde screamed back.' },
  { id: 'lenin', name: 'Lenin\'s flat', coords: [47.3708, 8.5443],
    intro: 'Spiegelgasse 14 (1916–1917)',
    desc: 'Lenin and his wife Krupskaya lived right here in 1916–17. Next door to the Cabaret Voltaire — political revolutionaries and art revolutionaries, side by side, neither knowing the other existed.' },
  { id: 'schipfe-craft', name: 'Schipfe', coords: [47.3714, 8.5418],
    intro: 'The oldest part of Zürich',
    desc: 'Boats were unloaded ("geschöpft") on this stretch of the Limmat from the Middle Ages on. Today it\'s one of the most charming craft and workshop quarters in town.' },
  { id: 'lindenhof-rome', name: 'Roman traces', coords: [47.3724, 8.5410],
    intro: 'Castellum Turicum',
    desc: 'A Roman customs fort called "Turicum" stood on the Lindenhof until the 4th century — that\'s where Zürich gets its name. Pieces of the old wall are still visible in the park.' },
  { id: 'augustiner-erker', name: 'Painted bay windows', coords: [47.3720, 8.5407],
    intro: 'Augustinergasse',
    desc: 'The whimsical painted bay windows here went up in the 17th and 18th centuries — each one told you what the resident did for a living, or how much money they had. Fairy-tale stage set, but real.' },
  { id: 'doerfli', name: 'Das Dörfli', coords: [47.3722, 8.5437],
    intro: 'Niederdorf',
    desc: 'Locals call Niederdorf "Dörfli" (the little village) — the village inside the city. Medieval alleys, old taverns (Beizen), street music until late. Where you end up at 1 AM.' },
  { id: 'muensterhof-platz', name: 'Münsterhof', coords: [47.3703, 8.5410],
    intro: 'Medieval market square',
    desc: 'One of the oldest squares in Zürich — pigs, salt and cloth were sold here in the Middle Ages. Now: car-free, no stalls, perfect for doing nothing for an hour.' },
  { id: 'wasserkirche', name: 'Wasserkirche', coords: [47.3700, 8.5435],
    intro: 'Felix and Regula',
    desc: 'Legend says the patron saints Felix and Regula were beheaded right here around 286 AD — and then carried their own heads forty paces up the hill to where the Grossmünster now stands.' },
  { id: 'bahnhofstr-history', name: 'Bahnhofstrasse', coords: [47.3722, 8.5402],
    intro: 'From city moat to luxury mile',
    desc: 'Bahnhofstrasse was laid down in 1864 on top of a filled-in city moat. Today: one of the most expensive shopping streets in the world. Same dirt, more diamonds.' },
  { id: 'keller-rindermarkt', name: 'Gottfried Keller', coords: [47.3713, 8.5444],
    intro: 'Rindermarkt 9',
    desc: 'The Swiss writer Gottfried Keller lived here from 1855 to 1861, working on "Der grüne Heinrich". The alley is still small, still quiet, still full of bookshops and hidden cafés.' },
  { id: 'predigerkirche', name: 'Predigerkirche', coords: [47.3735, 8.5443],
    intro: 'Former Dominican monastery',
    desc: '13th century. The choir, with its stained-glass windows, is one of the most beautiful Gothic rooms in Switzerland. Walk through quietly.' },
  { id: 'hirschen-platz', name: 'Hirschenplatz', coords: [47.3728, 8.5437],
    intro: 'A stag and a mosaic',
    desc: 'A small charming square with a fountain and the old "Hirschen" inn, once a market. Look up at the façades — the mosaics tell city stories.' },
];

/* ============================================================================
   LEVELS
============================================================================ */

/* 8 tiers — Newbie → Legend. Emoji is part of the display name (bold-friendly). */
const LEVELS = [
  { name: 'Rookie',   emoji: '🐣', threshold: 0,  color: '#7B8BAE', accent: '#B8C5DB', icon: Footprints, desc: 'You just stepped off the train.' },
  { name: 'Wanderer', emoji: '🧭', threshold: 5,  color: '#5B7BBF', accent: '#9CB4DE', icon: MapPin,     desc: 'Direction unclear, vibes immaculate.' },
  { name: 'Explorer', emoji: '🗺️', threshold: 10, color: '#3C66D6', accent: '#8FA8E8', icon: Compass,    desc: 'Getting the lay of the land.' },
  { name: 'Local',    emoji: '🍷', threshold: 20, color: '#7A4A8C', accent: '#C39AD0', icon: Mountain,   desc: 'You order the wine, not the menu.' },
  { name: 'Native',   emoji: '🎩', threshold: 35, color: '#A2376B', accent: '#D88FB1', icon: Sparkles,   desc: 'You walk like you live here.' },
  { name: 'Insider',  emoji: '🥂', threshold: 55, color: '#C76A2E', accent: '#E8B58A', icon: Award,      desc: 'You know the back doors.' },
  { name: 'Veteran',  emoji: '🏛️', threshold: 75, color: '#B8862C', accent: '#E6CB7E', icon: Trophy,     desc: 'Few have walked this far.' },
  { name: 'Legend',   emoji: '👑', threshold: 90, color: '#D4A93C', accent: '#F2D88A', icon: Crown,      desc: 'Walk the walk. They\'ll talk the talk.' },
];

/* ============================================================================
   DISTRICTS / CHAPTERS
============================================================================ */

/* Districts — Roman-numeral chapters. Names stay local (Altstadt, Seefeld…),
   subtitles are English for the traveler. */
const DISTRICTS = [
  { id: 'altstadt',    roman: 'I',   name: 'Altstadt',           subtitle: 'Medieval alleys along the Limmat',
    icon: Building2,   color: '#D4A93C', accent: '#F2D88A', available: true },
  { id: 'seefeld',     roman: 'II',  name: 'Seefeld & Bellevue', subtitle: 'The lakefront promenade',
    icon: Waves,       color: '#00B5C9', accent: '#8FD4DE', available: false },
  { id: 'langstrasse', roman: 'III', name: 'Langstrasse',        subtitle: 'Multikulti, bars, street art',
    icon: Music2,      color: '#A2376B', accent: '#D88FB1', available: false },
  { id: 'kreis-5',     roman: 'IV',  name: 'Industriequartier',  subtitle: 'Hipster scene, Frau Gerolds Garten',
    icon: Feather,     color: '#7A4A8C', accent: '#C39AD0', available: false },
  { id: 'hochschulen', roman: 'V',   name: 'Hochschulen',        subtitle: 'ETH, terraces, skyline views',
    icon: GraduationCap, color: '#3C66D6', accent: '#8FA8E8', available: false },
  { id: 'enge',        roman: 'VI',  name: 'Enge & Botanik',     subtitle: 'Villas, park, Zürichhorn',
    icon: Trees,       color: '#5B8C5C', accent: '#A6BC9A', available: false },
];

const UNLOCK_RADIUS_M = 22;
const STAR_RADIUS_M = 32;
const ANEKDOTE_RADIUS_M = 28;
const SEGMENT_MAX_LENGTH_M = 25;
const NEAR_STAR_HINT_M = 90;

/* ============================================================================
   GEO UTILS
============================================================================ */

const LAT_M = 111000;
const LNG_M = 75500;

const distanceM = (a, b) => {
  const dy = (a[0] - b[0]) * LAT_M;
  const dx = (a[1] - b[1]) * LNG_M;
  return Math.sqrt(dx * dx + dy * dy);
};

const pointToSegmentM = (p, a, b) => {
  const ax = a[1] * LNG_M, ay = a[0] * LAT_M;
  const bx = b[1] * LNG_M, by = b[0] * LAT_M;
  const px = p[1] * LNG_M, py = p[0] * LAT_M;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
};

const subdivideStreet = (street) => {
  const out = [street.points[0]];
  for (let i = 1; i < street.points.length; i++) {
    const a = street.points[i - 1], b = street.points[i];
    const len = distanceM(a, b);
    const n = Math.max(1, Math.ceil(len / SEGMENT_MAX_LENGTH_M));
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return { ...street, points: out };
};

const STREETS = STREETS_RAW.map(subdivideStreet);

const SEGMENTS = (() => {
  const segs = [];
  STREETS.forEach((s) => {
    for (let i = 1; i < s.points.length; i++) {
      segs.push({ id: `${s.id}__${i - 1}`, streetId: s.id, streetName: s.name, side: s.side, a: s.points[i - 1], b: s.points[i] });
    }
  });
  return segs;
})();

const TOTAL_SEGMENTS = SEGMENTS.length;

const SEGMENTS_BY_SIDE = {
  east:   SEGMENTS.filter((s) => s.side === 'east').map((s) => s.id),
  west:   SEGMENTS.filter((s) => s.side === 'west').map((s) => s.id),
  bridge: SEGMENTS.filter((s) => s.side === 'bridge').map((s) => s.id),
};

const project = (lat, lng) => ({
  x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * VIEWPORT.width,
  y: VIEWPORT.height - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * VIEWPORT.height,
});

const unproject = (x, y) => [
  BOUNDS.minLat + ((VIEWPORT.height - y) / VIEWPORT.height) * (BOUNDS.maxLat - BOUNDS.minLat),
  BOUNDS.minLng + (x / VIEWPORT.width) * (BOUNDS.maxLng - BOUNDS.minLng),
];

const getLevel = (pct) => {
  let current = LEVELS[0], next = LEVELS[1] || null;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (pct >= LEVELS[i].threshold) { current = LEVELS[i]; next = LEVELS[i + 1] || null; break; }
  }
  return { current, next, index: LEVELS.indexOf(current) };
};

/* ============================================================================
   ACHIEVEMENTS
============================================================================ */

const ACHIEVEMENTS = [
  { id: 'first-step',    name: 'First Step',          desc: 'Cleared your first street',
    icon: Footprints, color: '#3C66D6',
    check: (s) => s.unlocked.size >= 1 },
  { id: 'first-star',    name: 'Star Power',          desc: 'Visited your first landmark',
    icon: Star, color: '#D4A93C',
    check: (s) => s.stars.size >= 1 },
  { id: 'first-anekdote', name: 'Story Time',         desc: 'Uncovered your first anecdote',
    icon: BookOpen, color: '#7A4A8C',
    check: (s) => s.anekdoten.size >= 1 },
  { id: 'km-half',       name: 'Warm-up',             desc: 'Walked 500 m through town',
    icon: Route, color: '#3C66D6',
    check: (s) => s.distance >= 500 },
  { id: 'three-stars',   name: 'Star Collector',      desc: 'Visited three landmarks',
    icon: Sparkles, color: '#D4A93C',
    check: (s) => s.stars.size >= 3 },
  { id: 'all-stars',     name: 'Stargazer',           desc: 'All four landmarks of the chapter',
    icon: Crown, color: '#D4A93C',
    check: (s) => s.stars.size >= LANDMARKS.length },
  { id: 'bridges',       name: 'Bridge Master',       desc: 'Crossed every bridge in town',
    icon: Mountain, color: '#00B5C9',
    check: (s) => SEGMENTS_BY_SIDE.bridge.every((id) => s.unlocked.has(id)) },
  { id: 'km-one',        name: 'Wanderer',            desc: 'Walked a full kilometre',
    icon: Award, color: '#3C66D6',
    check: (s) => s.distance >= 1000 },
  { id: 'east-side',     name: 'East Side Story',     desc: 'Every alley on the east bank',
    icon: Award, color: '#7A4A8C',
    check: (s) => SEGMENTS_BY_SIDE.east.every((id) => s.unlocked.has(id)) },
  { id: 'west-side',     name: 'West Side Story',     desc: 'Every alley on the west bank',
    icon: Award, color: '#7A4A8C',
    check: (s) => SEGMENTS_BY_SIDE.west.every((id) => s.unlocked.has(id)) },
  { id: 'half-anekdoten', name: 'Half the Story',     desc: 'Half of all anecdotes uncovered',
    icon: BookOpen, color: '#7A4A8C',
    check: (s) => s.anekdoten.size >= Math.ceil(ANEKDOTEN.length / 2) },
  { id: 'all-anekdoten', name: 'Chronicler',          desc: 'Every anecdote in this chapter',
    icon: Feather, color: '#D4A93C',
    check: (s) => s.anekdoten.size >= ANEKDOTEN.length },
  { id: 'first-bar',     name: 'Apéro',               desc: 'First bar in the book',
    icon: Martini, color: '#A2376B',
    check: (s) => [...s.pois].some((id) => POIS.find((p) => p.id === id)?.kind === 'bar') },
  { id: 'all-bars',      name: 'Bar-Hopper',          desc: 'Every bar visited',
    icon: Wine, color: '#A2376B',
    check: (s) => POIS.filter((p) => p.kind === 'bar').every((p) => s.pois.has(p.id)) },
  { id: 'all-restaurants', name: 'Gourmand',          desc: 'Every restaurant visited',
    icon: ChefHat, color: '#C76A2E',
    check: (s) => POIS.filter((p) => p.kind === 'restaurant').every((p) => s.pois.has(p.id)) },
  { id: 'all-clubs',     name: 'Night Owl',           desc: 'Every club visited',
    icon: Disc3, color: '#3F4A8F',
    check: (s) => POIS.filter((p) => p.kind === 'club').every((p) => s.pois.has(p.id)) },
  { id: 'half-altstadt', name: 'Half the City',       desc: '50% of streets cleared',
    icon: Trophy, color: '#C76A2E',
    check: (s) => s.unlocked.size >= TOTAL_SEGMENTS * 0.5 },
  { id: 'legende',       name: 'Living Legend',       desc: '90% exploration reached',
    icon: Crown, color: '#D4A93C',
    check: (s) => s.unlocked.size >= TOTAL_SEGMENTS * 0.9 },
];

/* ============================================================================
   DEMO ROUTE — passes near landmarks AND most anekdoten
============================================================================ */

const DEMO_ROUTE = [
  // Start at Hauptbahnhof
  [47.3768,8.5392],[47.3762,8.5398],[47.3760,8.5402],
  [47.3760,8.5410],[47.3758,8.5418],
  // Bahnhofstrasse southward — past Kaufleuten (Pelikanstrasse 18)
  [47.3742,8.5400],[47.3722,8.5402],
  [47.3712,8.5400],[47.3704,8.5392],          // Kaufleuten (club)
  [47.3712,8.5400],[47.3712,8.5402],          // Zeughauskeller
  // Lindenhof loop — Widder Bar at Rennweg 7
  [47.3717,8.5408],[47.3722,8.5408],
  [47.3724,8.5413],                             // Widder Bar
  [47.3725,8.5407],[47.3722,8.5413],[47.3720,8.5408],
  [47.3717,8.5402],[47.3722,8.5402],
  [47.3712,8.5407],[47.3712,8.5413],[47.3712,8.5418],
  [47.3705,8.5418],                             // near Münsterhof
  [47.3706,8.5419],                             // Bar 63 (Storchen)
  [47.3702,8.5417],                             // Old Crow
  [47.3702,8.5410],[47.3700,8.5413],
  // Down to lake — Mascotte (Theaterstrasse 10)
  [47.3700,8.5404],[47.3692,8.5400],[47.3680,8.5417],[47.3666,8.5417],
  [47.3674,8.5462],                             // Mascotte (club)
  [47.3666,8.5443],
  // Back up via Limmatquai
  [47.3674,8.5418],[47.3690,8.5424],
  [47.3697,8.5447],                             // Kronenhalle (restaurant + bar pin nearby)
  [47.3699,8.5447],                             // Kronenhalle Bar
  [47.3700,8.5430],
  // Grossmünster
  [47.3702,8.5443],[47.3702,8.5455],
  [47.3713,8.5430],                             // Haus zum Rüden
  // Spiegelgasse / Lenin / Cabaret Voltaire / Le Dézaley
  [47.3704,8.5444],[47.3708,8.5443],[47.3713,8.5441],
  [47.3713,8.5446],[47.3713,8.5448],            // Le Dézaley
  [47.3719,8.5462],
  // Niederdorf weave — Pigalle, Swiss Chuchi
  [47.3719,8.5444],                             // Swiss Chuchi
  [47.3722,8.5436],[47.3725,8.5436],            // Pigalle
  [47.3728,8.5437],[47.3735,8.5443],
  [47.3737,8.5438],[47.3744,8.5432],[47.3750,8.5440],
  // North weave to Mühlegasse and back
  [47.3744,8.5422],[47.3744,8.5435],
  [47.3735,8.5428],[47.3722,8.5432],
  [47.3705,8.5430],
];

/* ============================================================================
   PERSISTENCE
============================================================================ */

const STORAGE_KEY = 'euro-legend-v1';
const LEGACY_STORAGE_KEY = 'altstadt-explorer-v6';
const OSM_CACHE_KEY = 'altstadt-osm-features-v3';
const OSM_CACHE_TTL_MS = 30 * 86400 * 1000; // 30 days

/* One-shot migration: copy progress from the V1.0 key, then mark the legacy
   record as migrated so we never overwrite the v1 key from it again.
   The user's "welcomeSeen" flag is intentionally reset so returning users
   see the new Welcome screen once. */
const migrateLegacyState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const rawNew = window.localStorage.getItem(STORAGE_KEY);
    if (rawNew) return JSON.parse(rawNew);
    const rawLegacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!rawLegacy) return null;
    const legacy = JSON.parse(rawLegacy);
    if (legacy && legacy.__migratedTo === STORAGE_KEY) return null;
    const migrated = {
      ...legacy,
      welcomeSeen: false,           // re-show the new Welcome screen
      __migratedFrom: LEGACY_STORAGE_KEY,
      migratedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    /* Safety: keep the legacy blob but flag it. We don't delete in case the
       user needs to roll back. */
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({
      ...legacy, __migratedTo: STORAGE_KEY, __migratedAt: Date.now(),
    }));
    return migrated;
  } catch (e) {
    return null;
  }
};

const OVERPASS_QUERY = `[out:json][timeout:90];
(
  way["highway"~"^(primary|secondary|tertiary|residential|pedestrian|footway|service|living_street|unclassified|cycleway|track|steps|path)$"](47.3650,8.5378,47.3775,8.5478);
  way["building"](47.3650,8.5378,47.3775,8.5478);
  relation["building"](47.3650,8.5378,47.3775,8.5478);
  way["building:part"](47.3650,8.5378,47.3775,8.5478);
  way["natural"="water"](47.3650,8.5378,47.3775,8.5478);
  relation["natural"="water"](47.3650,8.5378,47.3775,8.5478);
  way["leisure"~"^(park|garden|playground|pitch)$"](47.3650,8.5378,47.3775,8.5478);
  way["landuse"~"^(grass|forest|recreation_ground|cemetery|residential|commercial|retail)$"](47.3650,8.5378,47.3775,8.5478);
  way["railway"="rail"](47.3650,8.5378,47.3775,8.5478);
  way["amenity"~"^(parking|place_of_worship|university|school|hospital)$"](47.3650,8.5378,47.3775,8.5478);
  way["barrier"~"^(wall|fence|hedge|city_wall|retaining_wall)$"](47.3650,8.5378,47.3775,8.5478);
  way["man_made"~"^(bridge|pier|tower)$"](47.3650,8.5378,47.3775,8.5478);
);
out geom;`;

const fetchOSMFeatures = async () => {
  // Try cache
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(OSM_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.fetchedAt && (Date.now() - parsed.fetchedAt < OSM_CACHE_TTL_MS) && parsed.features) {
          return { features: parsed.features, fromCache: true };
        }
      }
    } catch (e) { /* ignore */ }
  }

  // Fetch fresh from Overpass (try mirrors in sequence)
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.fr/api/interpreter',
  ];

  let data = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(OVERPASS_QUERY),
      });
      if (!res.ok) continue;
      data = await res.json();
      break;
    } catch (e) { /* try next */ }
  }
  if (!data || !Array.isArray(data.elements)) throw new Error('Overpass unavailable');

  const features = {
    streets: [], buildings: [], buildingParts: [],
    water: [], parks: [], rail: [], parking: [], barriers: [], churches: [],
  };

  const pushBuilding = (id, kind, points) => {
    if (!points || points.length < 4) return;
    // Need closed polygon
    const isClosed = points[0][0] === points[points.length - 1][0] && points[0][1] === points[points.length - 1][1];
    if (!isClosed) return;
    features.buildings.push({ id, kind, points });
  };

  for (const el of data.elements) {
    const tags = el.tags || {};

    // RELATION — typically multipolygon buildings/water
    if (el.type === 'relation' && Array.isArray(el.members)) {
      const isBuilding = !!tags.building;
      const isWater = tags.natural === 'water';
      if (!isBuilding && !isWater) continue;
      // Each outer member becomes its own polygon (simple approach — visual outcome is fine)
      let outerIdx = 0;
      for (const m of el.members) {
        if (m.type !== 'way' || !Array.isArray(m.geometry) || m.geometry.length < 4) continue;
        if (m.role !== 'outer' && m.role !== '') continue; // skip inner (holes) for simplicity
        const points = m.geometry.map((g) => [g.lat, g.lon]);
        if (isBuilding) {
          pushBuilding(`osm-br-${el.id}-${outerIdx++}`, tags.building, points);
        } else if (isWater) {
          features.water.push({ id: `osm-wr-${el.id}-${outerIdx++}`, points });
        }
      }
      continue;
    }

    if (el.type !== 'way' || !Array.isArray(el.geometry) || el.geometry.length < 2) continue;
    const points = el.geometry.map((g) => [g.lat, g.lon]);

    if (tags.highway) {
      features.streets.push({
        id: 'osm-s-' + el.id,
        name: tags.name || tags['name:de'] || tags.ref || tags.highway || 'Street',
        highway: tags.highway,
        isBridge: tags.bridge && tags.bridge !== 'no',
        isPedestrian: tags.highway === 'pedestrian' || tags.highway === 'footway' || tags.highway === 'path' || tags.foot === 'designated',
        isSteps: tags.highway === 'steps',
        points,
      });
    } else if (tags.building) {
      pushBuilding('osm-b-' + el.id, tags.building, points);
    } else if (tags['building:part']) {
      const isClosed = points.length >= 4 && points[0][0] === points[points.length - 1][0] && points[0][1] === points[points.length - 1][1];
      if (isClosed) features.buildingParts.push({ id: 'osm-bp-' + el.id, points });
    } else if (tags.natural === 'water') {
      features.water.push({ id: 'osm-w-' + el.id, points });
    } else if (tags.leisure || tags.landuse) {
      features.parks.push({
        id: 'osm-p-' + el.id,
        kind: tags.leisure || tags.landuse,
        points,
      });
    } else if (tags.railway === 'rail') {
      features.rail.push({ id: 'osm-r-' + el.id, points });
    } else if (tags.amenity === 'parking') {
      const isClosed = points.length >= 4 && points[0][0] === points[points.length - 1][0] && points[0][1] === points[points.length - 1][1];
      if (isClosed) features.parking.push({ id: 'osm-pk-' + el.id, points });
    } else if (tags.amenity === 'place_of_worship') {
      features.churches.push({ id: 'osm-c-' + el.id, points });
    } else if (tags.barrier) {
      features.barriers.push({ id: 'osm-bar-' + el.id, kind: tags.barrier, points });
    }
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(OSM_CACHE_KEY, JSON.stringify({ features, fetchedAt: Date.now() }));
    } catch (e) { /* ignore — likely quota exceeded; OSM data can be > 5MB */ }
  }
  return { features, fromCache: false };
};

const loadState = async () => {
  if (typeof window === 'undefined') return null;
  /* If euro-legend-v1 is missing but altstadt-explorer-v6 has data, migrate. */
  const migrated = migrateLegacyState();
  if (migrated) return migrated;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
};

const saveState = async (state) => {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { /* ignore — quota or private mode */ }
};

/* ============================================================================
   HELPERS
============================================================================ */

const starPath = (size) => {
  const o = size, i = size * 0.4;
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const r = k % 2 === 0 ? o : i;
    const a = (-Math.PI / 2) + (Math.PI / 5) * k;
    pts.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

const STAR_PATH_LG = starPath(13);
const STAR_PATH_SM = starPath(8);   // kompakter Stern für engen Zoom

const fmtTime = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
};
const fmtDist = (m) => m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`;

/* ============================================================================
   AUDIO & HAPTICS
============================================================================ */

let _audioCtx = null;
const getAudioCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!_audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try { _audioCtx = new Ctor(); } catch (e) { return null; }
  }
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
};

const playTone = (freq, dur = 0.18, type = 'sine', vol = 0.13) => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch (e) { /* ignore */ }
};

const playSequence = (notes) => {
  // notes: [{ freq, dur?, type?, vol?, delay }]
  notes.forEach((n) => {
    setTimeout(() => playTone(n.freq, n.dur ?? 0.18, n.type ?? 'sine', n.vol ?? 0.13), n.delay ?? 0);
  });
};

const SFX = {
  street: () => playTone(523.25, 0.14, 'sine', 0.10),
  star: () => playSequence([
    { freq: 523.25, dur: 0.16, type: 'triangle', vol: 0.13, delay: 0 },
    { freq: 659.25, dur: 0.16, type: 'triangle', vol: 0.13, delay: 80 },
    { freq: 783.99, dur: 0.28, type: 'triangle', vol: 0.16, delay: 160 },
  ]),
  anekdote: () => playTone(220, 0.36, 'sine', 0.10),
  poi_bar: () => playSequence([
    { freq: 392, dur: 0.10, type: 'sine', vol: 0.10, delay: 0 },
    { freq: 587.33, dur: 0.20, type: 'sine', vol: 0.12, delay: 60 },
  ]),
  poi_restaurant: () => playSequence([
    { freq: 440, dur: 0.10, type: 'triangle', vol: 0.10, delay: 0 },
    { freq: 554.37, dur: 0.20, type: 'triangle', vol: 0.12, delay: 60 },
  ]),
  poi_club: () => playSequence([
    { freq: 196, dur: 0.08, type: 'sawtooth', vol: 0.07, delay: 0 },
    { freq: 392, dur: 0.10, type: 'sawtooth', vol: 0.07, delay: 50 },
    { freq: 783.99, dur: 0.16, type: 'sawtooth', vol: 0.08, delay: 110 },
  ]),
  achievement: () => playSequence([
    { freq: 880, dur: 0.14, type: 'sine', vol: 0.13, delay: 0 },
    { freq: 1108.73, dur: 0.22, type: 'sine', vol: 0.13, delay: 100 },
  ]),
  level: () => playSequence([
    { freq: 659.25, dur: 0.14, type: 'triangle', vol: 0.16, delay: 0 },
    { freq: 880, dur: 0.14, type: 'triangle', vol: 0.16, delay: 90 },
    { freq: 1046.5, dur: 0.30, type: 'triangle', vol: 0.18, delay: 180 },
  ]),
  chapter: () => playSequence([
    { freq: 523.25, dur: 0.22, type: 'triangle', vol: 0.16, delay: 0 },
    { freq: 659.25, dur: 0.22, type: 'triangle', vol: 0.16, delay: 130 },
    { freq: 783.99, dur: 0.22, type: 'triangle', vol: 0.16, delay: 260 },
    { freq: 1046.5, dur: 0.36, type: 'triangle', vol: 0.18, delay: 390 },
    { freq: 1318.51, dur: 0.50, type: 'triangle', vol: 0.18, delay: 600 },
  ]),
};

const supportsVibrate = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

const haptic = (pattern) => {
  if (!supportsVibrate()) return;
  try { navigator.vibrate(pattern); } catch (e) {}
};

const HAPTIC = {
  street: 25,
  star: [60, 30, 100],
  anekdote: 50,
  poi_bar: [40, 20, 60],
  poi_restaurant: [40, 20, 60],
  poi_club: [30, 20, 30, 20, 60],
  achievement: [40, 30, 40],
  level: [40, 20, 40, 20, 60],
  chapter: [80, 40, 80, 40, 120],
};

const DEFAULT_SETTINGS = { soundOn: true, hapticsOn: true, themeMode: 'auto' };

/* ============================================================================
   THEMING — Day / Night palette
============================================================================ */

/* ============================================================================
   EURO-LEGEND PALETTE
   ----------------------------------------------------------------------------
   Brand:      deep indigo primary (day-bg #0A1F4F, night-bg #050C24)
   Accent 1:   Electric Blue #00E5FF  — CTAs, player marker, pulses, highlights
   Accent 2:   Antique Gold  #D4A93C  — laurel, landmark stars, achievement glow
   Surface:    translucent white over a warm off-white map (day),
               dark frosted glass over indigo (night).
   Map base:   warm off-white #F5F3EE (day) / deep indigo #101830 (night)
   Water:      soft cyan #A8D5E8 (day) / steel #1E3A5F (night)
   Parks:      muted sage #B8C9A8 (day) / dark moss #2A3B2D (night)
   Streets:    off-white with soft shadow (day) / lighter blue-grey (night)
============================================================================ */

const PALETTES = {
  day: {
    name: 'day',
    /* Page background — warm off-white wash, very subtle radial. */
    pageBg: 'radial-gradient(circle at 30% 20%, #FAF8F2 0%, #F5F3EE 45%, #ECE7D9 100%)',
    /* Map base — warm off-white, never blank-white. */
    mapBg: '#F5F3EE',
    paperFill: '#F5F3EE',
    paperNoiseColor: '0 0 0 0 0.96  0 0 0 0 0.95  0 0 0 0 0.93  0 0 0 0.04 0',
    paperNoiseOpacity: 0.35,
    starfieldVisible: false,
    /* Foreground text — deep indigo for legibility on warm paper. */
    text: '#0A1F4F',
    textMuted: 'rgba(10,31,79,0.6)',
    /* Frosted-glass surface for cards / pills / modals. */
    cardBg: 'rgba(255,255,255,0.72)',
    cardBorder: 'rgba(10,31,79,0.14)',
    cardShadow: '0 8px 32px rgba(10,31,79,0.10), 0 2px 6px rgba(10,31,79,0.05)',
    /* Generic stroke for street lines / outlines. */
    streetStroke: '#0A1F4F',
    streetGhostStroke: '#B5AFA0',
    streetGhostOpacity: 0.32,
    bridgeAccent: '#D4A93C',
    /* Water — soft cyan-blue. */
    riverTop: '#A8D5E8',
    riverBottom: '#5E9CB8',
    riverHighlight: '#D7ECF5',
    riverOpacity: 0.95,
    /* Walk trail — electric-blue dotted line. */
    trailStroke: '#00E5FF',
    trailOpacity: 0.55,
    compassStroke: '#0A1F4F',
    compassOpacity: 0.45,
    vignette: 'rgba(10,31,79,0.10)',
    /* User marker — electric blue. */
    userMarkerInner: '#00E5FF',
    userMarkerStroke: '#00E5FF',
    userMarkerFill: '#FFFFFF',
    userPulseColor: '#00E5FF',
    /* Star landmarks. */
    starLockedStroke: '#0A1F4F',
    starLockedFill: 'rgba(255,255,255,0.6)',
    anekdoteLockedFill: 'rgba(255,255,255,0.55)',
    anekdoteLockedStroke: '#0A1F4F',
    anekdoteUnlockedFill: '#7A4A8C',
    anekdoteUnlockedStroke: '#FFFFFF',
    anekdoteIconColor: '#FFFFFF',
    landmarkLabelStroke: 'rgba(255,255,255,0.90)',
    bottomBarBg: 'rgba(255,255,255,0.62)',
    bottomBarBorder: 'rgba(10,31,79,0.10)',
    headerBorder: 'rgba(10,31,79,0.10)',
    iconBtnBg: 'rgba(10,31,79,0.06)',
    simModeOnBg: 'rgba(0,229,255,0.85)',
    simModeOffBg: 'rgba(10,31,79,0.06)',
    /* City-block fill — cream-ivory, sits next to off-white streets. */
    blockFill: '#ECE7D9',
    blockStroke: 'rgba(10,31,79,0.18)',
    blockShadow: 'rgba(10,31,79,0.10)',
    plazaPaved: '#F0EDE2',
    plazaPark: '#B8C9A8',
    plazaStroke: 'rgba(10,31,79,0.18)',
    fountainOuter: '#0A1F4F',
    fountainInner: '#5E9CB8',
    treeColor: '#7BA67C',
    treeShadow: 'rgba(10,31,79,0.16)',
    /* Lake — soft cyan. */
    lakeTop: '#C6E2EE',
    lakeBottom: '#5E9CB8',
    hbfFill: '#E2DCC8',
    hbfStroke: '#0A1F4F',
    tramTrack: 'rgba(10,31,79,0.28)',
    contour: 'rgba(10,31,79,0.10)',
    /* Streets — off-white with crisp edge. */
    streetFill: '#FFFFFF',
    streetOutline: '#0A1F4F',
    streetShine: 'rgba(255,255,255,0.65)',
    streetShadow: 'rgba(10,31,79,0.18)',
    osmGhost: '#FFFFFF',           // OSM backdrop streets — off-white
    osmGhostOutline: 'rgba(10,31,79,0.22)',
    /* POI accent colours. */
    poiBarBg: '#A2376B',
    poiBarRing: '#F5C9DC',
    poiRestaurantBg: '#C76A2E',
    poiRestaurantRing: '#F5D2A8',
    poiClubBg: '#3F4A8F',
    poiClubRing: '#C9D2F5',
    poiPinShadow: 'rgba(10,31,79,0.28)',
    poiLockedDesat: 0.55,
    /* Fog-of-War — moody cool overcast. */
    fogColor: '#C5CFE0',
    fogHighlight: '#DDE4ED',
    fogShadow: '#8E97A8',
    fogTextureTint: '0 0 0 0 0.96  0 0 0 0 0.97  0 0 0 0 1  0 0 0 0.55 -0.18',
    /* OSM features. */
    osmBuildingFill: '#E8E3D2',
    osmBuildingStroke: 'rgba(10,31,79,0.40)',
    osmBuildingShadow: 'rgba(10,31,79,0.16)',
    osmBuildingChurch: '#D7CFB7',
    osmBuildingPart: 'rgba(10,31,79,0.14)',
    osmParkFill: '#C9DAB0',
    osmParkStroke: 'rgba(60,110,60,0.32)',
    osmWaterFill: '#A8D5E8',
    osmRailStroke: 'rgba(10,31,79,0.38)',
    osmParkingFill: '#E0D9C6',
    osmParkingStroke: 'rgba(10,31,79,0.22)',
    osmBarrierStroke: 'rgba(10,31,79,0.42)',
    /* Bridges — same warm tone as streets so they read as continuation. */
    bridgeFill: '#F5F3EE',
    bridgeRail: 'rgba(10,31,79,0.45)',
    bridgeEdge: 'rgba(10,31,79,0.32)',
    buildingEastShadow: 'rgba(10,31,79,0.26)',
    parkTexture: 'rgba(60,110,60,0.40)',
    /* Mini-map — frosted-glass card. */
    miniBg: 'rgba(255,255,255,0.78)',
    miniStreet: 'rgba(10,31,79,0.30)',
    miniStreetMain: 'rgba(10,31,79,0.55)',
    miniBuilding: 'rgba(10,31,79,0.14)',
    miniWater: '#A8D5E8',
    miniPark: '#B8C9A8',
    miniBridge: '#F5F3EE',
    miniFog: 'rgba(170,180,200,0.45)',
    miniBorder: 'rgba(10,31,79,0.18)',
    /* Label halo (for text laid over the map). */
    labelHalo: 'rgba(255,255,255,0.92)',
  },
  night: {
    name: 'night',
    /* Page bg — deep indigo radial. */
    pageBg: 'radial-gradient(circle at 30% 25%, #0A1F4F 0%, #07153A 50%, #050C24 100%)',
    /* Map base — deep indigo. */
    mapBg: '#101830',
    paperFill: '#101830',
    paperNoiseColor: '0 0 0 0 0.40  0 0 0 0 0.45  0 0 0 0 0.60  0 0 0 0.06 0',
    paperNoiseOpacity: 0.30,
    starfieldVisible: true,
    text: '#F2EEE5',
    textMuted: 'rgba(242,238,229,0.55)',
    /* Dark frosted glass. */
    cardBg: 'rgba(10,31,79,0.55)',
    cardBorder: 'rgba(242,238,229,0.15)',
    cardShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.20)',
    streetStroke: '#00E5FF',
    streetGhostStroke: '#2A3A60',
    streetGhostOpacity: 0.5,
    bridgeAccent: '#D4A93C',
    riverTop: '#2D4F73',
    riverBottom: '#1E3A5F',
    riverHighlight: '#7AA8C5',
    riverOpacity: 0.85,
    trailStroke: '#00E5FF',
    trailOpacity: 0.8,
    compassStroke: '#9CB4DE',
    compassOpacity: 0.5,
    vignette: 'rgba(0,0,0,0.55)',
    userMarkerInner: '#00E5FF',
    userMarkerStroke: '#FFFFFF',
    userMarkerFill: '#050C24',
    userPulseColor: '#00E5FF',
    starLockedStroke: '#D4A93C',
    starLockedFill: 'rgba(212,169,60,0.18)',
    anekdoteLockedFill: 'rgba(242,238,229,0.15)',
    anekdoteLockedStroke: '#D4A93C',
    anekdoteUnlockedFill: '#D88FB1',
    anekdoteUnlockedStroke: '#050C24',
    anekdoteIconColor: '#050C24',
    landmarkLabelStroke: 'rgba(5,12,36,0.85)',
    bottomBarBg: 'rgba(10,31,79,0.55)',
    bottomBarBorder: 'rgba(242,238,229,0.10)',
    headerBorder: 'rgba(242,238,229,0.10)',
    iconBtnBg: 'rgba(242,238,229,0.08)',
    simModeOnBg: 'rgba(0,229,255,0.40)',
    simModeOffBg: 'rgba(242,238,229,0.06)',
    blockFill: '#161E38',
    blockStroke: 'rgba(242,238,229,0.10)',
    blockShadow: 'rgba(0,0,0,0.45)',
    plazaPaved: '#1A2342',
    plazaPark: '#2A3B2D',
    plazaStroke: 'rgba(242,238,229,0.12)',
    fountainOuter: '#9CB4DE',
    fountainInner: '#2D4F73',
    treeColor: '#385940',
    treeShadow: 'rgba(0,0,0,0.5)',
    lakeTop: '#2D4F73',
    lakeBottom: '#1E3A5F',
    hbfFill: '#1F2848',
    hbfStroke: '#D4A93C',
    tramTrack: 'rgba(242,238,229,0.16)',
    contour: 'rgba(242,238,229,0.08)',
    streetFill: '#1E2A4A',
    streetOutline: '#050C24',
    streetShine: 'rgba(255,255,255,0.30)',
    streetShadow: 'rgba(0,0,0,0.55)',
    osmGhost: '#3B4A6E',
    osmGhostOutline: 'rgba(242,238,229,0.18)',
    poiBarBg: '#D88FB1',
    poiBarRing: '#3D2148',
    poiRestaurantBg: '#E8B58A',
    poiRestaurantRing: '#3F2818',
    poiClubBg: '#8FA8E8',
    poiClubRing: '#1F2848',
    poiPinShadow: 'rgba(0,0,0,0.55)',
    poiLockedDesat: 0.7,
    fogColor: '#1A2342',
    fogHighlight: '#2A3658',
    fogShadow: '#0A1130',
    fogTextureTint: '0 0 0 0 0.10  0 0 0 0 0.14  0 0 0 0 0.24  0 0 0 0.55 -0.18',
    osmBuildingFill: '#1F2848',
    osmBuildingStroke: 'rgba(242,238,229,0.30)',
    osmBuildingShadow: 'rgba(0,0,0,0.5)',
    osmBuildingChurch: '#2A3658',
    osmBuildingPart: 'rgba(242,238,229,0.12)',
    osmParkFill: '#2A3B2D',
    osmParkStroke: 'rgba(140,180,140,0.20)',
    osmWaterFill: '#1E3A5F',
    osmRailStroke: 'rgba(242,238,229,0.25)',
    osmParkingFill: '#1F2A48',
    osmParkingStroke: 'rgba(242,238,229,0.18)',
    osmBarrierStroke: 'rgba(242,238,229,0.32)',
    bridgeFill: '#1E2A4A',
    bridgeRail: 'rgba(212,169,60,0.55)',
    bridgeEdge: 'rgba(212,169,60,0.35)',
    buildingEastShadow: 'rgba(0,0,0,0.5)',
    parkTexture: 'rgba(140,180,140,0.30)',
    miniBg: 'rgba(10,31,79,0.65)',
    miniStreet: 'rgba(242,238,229,0.26)',
    miniStreetMain: 'rgba(242,238,229,0.46)',
    miniBuilding: 'rgba(242,238,229,0.14)',
    miniWater: '#2D4F73',
    miniPark: '#2A3B2D',
    miniBridge: '#1E2A4A',
    miniFog: 'rgba(10,17,48,0.55)',
    miniBorder: 'rgba(242,238,229,0.22)',
    labelHalo: 'rgba(5,12,36,0.92)',
  },
};

// Stable starfield — generated once per session for the night sky
const STARFIELD = (() => {
  const out = [];
  // Use a seeded pseudo-random for a stable set of stars
  let seed = 42;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 90; i++) {
    out.push({
      x: rnd() * VIEWPORT.width,
      y: rnd() * VIEWPORT.height * 0.85,
      r: 0.5 + rnd() * 1.4,
      o: 0.35 + rnd() * 0.55,
      tw: 1.5 + rnd() * 3, // twinkle period in seconds
      td: rnd() * 3,        // twinkle delay
    });
  }
  return out;
})();

/* ============================================================================
   FOG-OF-WAR — bold "unmapped territory" feel. Persistent reveal mask.
   Reveal radius adapts to zoom: navigating ≪ overview.
============================================================================ */
const FOG_REVEAL_RADIUS = {
  overview: 120,   // zoomed-out: generous reveal halo
  default:  70,    // normal map view
  nav:      45,    // zoomed-in/nav mode: tight, deliberate
};
const FOG_REVEAL_DEDUP_PX = 24;        // min distance between persisted reveal points
const FOG_OPACITY_DAY   = 0.82;        // unmapped territory tint (day)
const FOG_OPACITY_NIGHT = 0.88;        // flashlight feel (night)
/* Frontier glow — cyan halo at the moving edge near the player. */
const FOG_FRONTIER_GLOW_PX = 12;
const FOG_FRONTIER_COLOR   = 'rgba(0,229,255,0.30)';
/* Gold burst on first reveal — soft radial flash. */
const FOG_REVEAL_BURST_MS  = 600;
const FOG_REVEAL_BURST_MAX_PER_SEC = 3;

/* ============================================================================
   TYPOGRAPHY — single source of truth for font stacks + display scale.
============================================================================ */
const TYPO = {
  /* Display-XXL — only for the EURO LEGEND wordmark on welcome. */
  wordmark: { fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif', fontWeight: 700, letterSpacing: '0.06em' },
  /* Display-L — chapter / city headlines. */
  display: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, letterSpacing: '-0.015em' },
  /* Italic display — tagline / quotations. */
  displayItalic: { fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontWeight: 400 },
  /* Body — anecdotes, modal text. */
  body: { fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 400 },
  /* UI labels in caps with wide tracking. */
  caps: { fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase' },
  /* Small UI numbers + value text. */
  ui: { fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 500 },
};

/* ============================================================================
   CITIES — wraps per-city geometry & content so future chapters
   (paris, berlin, lisbon, barcelona…) are a new object entry, not a refactor.
   Every render reads from CITIES[currentCity]. The Zürich constants above stay
   exported as the active source of truth via this object.
============================================================================ */
const CITIES = {
  zurich: {
    id: 'zurich',
    name: 'Zürich',
    country: 'Switzerland',
    chapters: {
      altstadt: {
        id: 'altstadt',
        roman: 'I',
        title: 'Altstadt',
        subtitle: 'Medieval alleys along the Limmat',
        locked: false,
        bounds: BOUNDS,
        viewport: VIEWPORT,
        extent: EXTENT,
        streets: STREETS,
        streetsRaw: STREETS_RAW,
        segments: SEGMENTS,
        segmentsBySide: SEGMENTS_BY_SIDE,
        totalSegments: TOTAL_SEGMENTS,
        blocks: BLOCKS,
        plazas: PLAZAS,
        fountains: FOUNTAINS,
        trees: TREES,
        landmarks: LANDMARKS,
        anekdoten: ANEKDOTEN,
        pois: POIS,
        river: RIVER_PATH,
        lake: LAKE_PATH,
        hbfBuilding: HBF_BUILDING,
        hbfTracks: HBF_TRACKS,
        tramLines: TRAM_LINES,
        demoRoute: DEMO_ROUTE,
        starfield: STARFIELD,
        overpassQuery: OVERPASS_QUERY,
      },
      /* Stub chapters — locked, ship empty geometry. Render code already
         guards against missing arrays. Populate as the chapters launch. */
      seefeld: {
        id: 'seefeld', roman: 'II', title: 'Seefeld & Bellevue',
        subtitle: 'The lakefront promenade',
        locked: true,
        bounds: { minLat: 47.3540, maxLat: 47.3680, minLng: 8.5440, maxLng: 8.5600 },
        viewport: VIEWPORT,
        streets: [], streetsRaw: [], segments: [], segmentsBySide: { east: [], west: [], bridge: [] },
        totalSegments: 0,
        blocks: [], plazas: [], fountains: [], trees: [],
        landmarks: [], anekdoten: [], pois: [],
        river: [], lake: [],
        hbfBuilding: [], hbfTracks: [], tramLines: [],
        demoRoute: [], starfield: [],
      },
      langstrasse: {
        id: 'langstrasse', roman: 'III', title: 'Langstrasse',
        subtitle: 'Multikulti, bars, street art',
        locked: true,
        bounds: { minLat: 47.3735, maxLat: 47.3830, minLng: 8.5230, maxLng: 8.5370 },
        viewport: VIEWPORT,
        streets: [], streetsRaw: [], segments: [], segmentsBySide: { east: [], west: [], bridge: [] },
        totalSegments: 0,
        blocks: [], plazas: [], fountains: [], trees: [],
        landmarks: [], anekdoten: [], pois: [],
        river: [], lake: [],
        hbfBuilding: [], hbfTracks: [], tramLines: [],
        demoRoute: [], starfield: [],
      },
      'kreis-5': {
        id: 'kreis-5', roman: 'IV', title: 'Industriequartier',
        subtitle: 'Hipster scene, Frau Gerolds Garten',
        locked: true,
        bounds: { minLat: 47.3850, maxLat: 47.3950, minLng: 8.5100, maxLng: 8.5300 },
        viewport: VIEWPORT,
        streets: [], streetsRaw: [], segments: [], segmentsBySide: { east: [], west: [], bridge: [] },
        totalSegments: 0,
        blocks: [], plazas: [], fountains: [], trees: [],
        landmarks: [], anekdoten: [], pois: [],
        river: [], lake: [],
        hbfBuilding: [], hbfTracks: [], tramLines: [],
        demoRoute: [], starfield: [],
      },
      hochschulen: {
        id: 'hochschulen', roman: 'V', title: 'Hochschulen',
        subtitle: 'ETH, terraces, skyline views',
        locked: true,
        bounds: { minLat: 47.3760, maxLat: 47.3830, minLng: 8.5440, maxLng: 8.5560 },
        viewport: VIEWPORT,
        streets: [], streetsRaw: [], segments: [], segmentsBySide: { east: [], west: [], bridge: [] },
        totalSegments: 0,
        blocks: [], plazas: [], fountains: [], trees: [],
        landmarks: [], anekdoten: [], pois: [],
        river: [], lake: [],
        hbfBuilding: [], hbfTracks: [], tramLines: [],
        demoRoute: [], starfield: [],
      },
      enge: {
        id: 'enge', roman: 'VI', title: 'Enge & Botanik',
        subtitle: 'Villas, park, Zürichhorn',
        locked: true,
        bounds: { minLat: 47.3580, maxLat: 47.3670, minLng: 8.5260, maxLng: 8.5420 },
        viewport: VIEWPORT,
        streets: [], streetsRaw: [], segments: [], segmentsBySide: { east: [], west: [], bridge: [] },
        totalSegments: 0,
        blocks: [], plazas: [], fountains: [], trees: [],
        landmarks: [], anekdoten: [], pois: [],
        river: [], lake: [],
        hbfBuilding: [], hbfTracks: [], tramLines: [],
        demoRoute: [], starfield: [],
      },
    },
  },
  /* future: paris: { chapters: { … } }, berlin: { … }, … */
};

const DEFAULT_CITY = 'zurich';
const DEFAULT_CHAPTER = 'altstadt';

/* ============================================================================
   LAUREL WREATH — parametric SVG component. Used as the brand mark
   on welcome, achievements, and chapter-complete screens.
============================================================================ */
function LaurelWreath({ size = 120, monogram = 'EL', glow = false, className = '', style = {} }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 100 100"
      className={className}
      style={{
        filter: glow ? 'drop-shadow(0 0 24px rgba(212,169,60,0.55))' : 'drop-shadow(0 4px 14px rgba(0,0,0,0.25))',
        ...style,
      }}
    >
      <defs>
        <linearGradient id={`el-leaf-${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#F2D88A" />
          <stop offset="55%" stopColor="#D4A93C" />
          <stop offset="100%" stopColor="#9B7820" />
        </linearGradient>
        <linearGradient id={`el-leaf-r-${size}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#F2D88A" />
          <stop offset="55%" stopColor="#D4A93C" />
          <stop offset="100%" stopColor="#9B7820" />
        </linearGradient>
      </defs>

      {/* Stem arcs */}
      <path d="M 50,84 Q 18,52 50,14" fill="none" stroke="#B98F2A" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
      <path d="M 50,84 Q 82,52 50,14" fill="none" stroke="#B98F2A" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />

      {/* Left leaves */}
      <g fill={`url(#el-leaf-${size})`} stroke="#7E631C" strokeWidth="0.4" strokeLinejoin="round">
        <path d="M 38,78 Q 27,76 24,68 Q 33,67 39,72 Z" />
        <path d="M 30,70 Q 19,66 18,57 Q 27,58 33,64 Z" />
        <path d="M 24,60 Q 14,54 16,44 Q 25,46 29,53 Z" />
        <path d="M 22,49 Q 13,42 17,32 Q 26,35 28,42 Z" />
        <path d="M 24,38 Q 17,30 23,21 Q 31,26 30,33 Z" />
        <path d="M 30,28 Q 26,20 33,13 Q 39,19 35,25 Z" />
        <path d="M 38,20 Q 36,12 44,8 Q 47,15 43,19 Z" />
      </g>
      {/* Right leaves (mirror) */}
      <g fill={`url(#el-leaf-r-${size})`} stroke="#7E631C" strokeWidth="0.4" strokeLinejoin="round">
        <path d="M 62,78 Q 73,76 76,68 Q 67,67 61,72 Z" />
        <path d="M 70,70 Q 81,66 82,57 Q 73,58 67,64 Z" />
        <path d="M 76,60 Q 86,54 84,44 Q 75,46 71,53 Z" />
        <path d="M 78,49 Q 87,42 83,32 Q 74,35 72,42 Z" />
        <path d="M 76,38 Q 83,30 77,21 Q 69,26 70,33 Z" />
        <path d="M 70,28 Q 74,20 67,13 Q 61,19 65,25 Z" />
        <path d="M 62,20 Q 64,12 56,8 Q 53,15 57,19 Z" />
      </g>

      {/* Ribbon knot at the bottom */}
      <path d="M 44,82 Q 50,88 56,82 L 54,86 Q 50,90 46,86 Z"
            fill={`url(#el-leaf-${size})`} stroke="#7E631C" strokeWidth="0.4" />

      {monogram && (
        <text x="50" y="56" textAnchor="middle"
              fontFamily="'Fraunces', Georgia, serif"
              fontStyle="italic" fontWeight="700"
              fontSize="22" fill="#F2D88A" letterSpacing="-1">
          {monogram}
        </text>
      )}
    </svg>
  );
}

const resolveTheme = (mode) => {
  if (mode === 'day') return 'day';
  if (mode === 'night') return 'night';
  // auto: night between 19:00 and 06:59
  if (typeof Date !== 'undefined') {
    const h = new Date().getHours();
    return (h >= 19 || h < 7) ? 'night' : 'day';
  }
  return 'day';
};

/* ============================================================================
   APP SHELL — manages views and lifts exploration state
============================================================================ */

export default function App() {
  const [view, setView] = useState('districts'); // 'districts' | 'explore'
  /* Multi-city / multi-chapter wiring. CITIES[currentCity].chapters[currentChapter]
     is the active geometry + content. Today only zurich.altstadt is playable;
     switching is not yet exposed in the UI. */
  const [currentCity] = useState(DEFAULT_CITY);
  const [currentChapter, setCurrentChapter] = useState(DEFAULT_CHAPTER);
  const city = CITIES[currentCity];
  const chapter = city.chapters[currentChapter];
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  const [tracking, setTracking] = useState(false);
  const [simMode, setSimMode] = useState(true);
  const [demoRunning, setDemoRunning] = useState(false);
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const [unlocked, setUnlocked] = useState(() => new Set());
  const [stars, setStars] = useState(() => new Set());
  const [anekdoten, setAnekdoten] = useState(() => new Set());
  const [pois, setPois] = useState(() => new Set());
  const [achievements, setAchievements] = useState(() => new Set());
  const [trail, setTrail] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);

  const [toast, setToast] = useState(null);
  const [levelUp, setLevelUp] = useState(null);
  const [chapterDone, setChapterDone] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [activeLandmark, setActiveLandmark] = useState(null);
  const [activeAnekdote, setActiveAnekdote] = useState(null);
  const [activePoi, setActivePoi] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [bgActive, setBgActive] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [chapterDoneSeen, setChapterDoneSeen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [journal, setJournal] = useState([]);
  const [showJournal, setShowJournal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLokale, setShowLokale] = useState(false);

  const [osmStreets, setOsmStreets] = useState(null);     // null = not loaded; [] = loaded empty
  const [osmFeatures, setOsmFeatures] = useState(null);   // { buildings, water, parks, rail, churches }
  const [osmStatus, setOsmStatus] = useState('idle');     // idle | loading | ready | error

  /* Fog-of-War: persisted reveal points in SVG coords. */
  const [revealed, setRevealed] = useState([]);
  /* Gold "first-reveal" bursts — transient, auto-expire after FOG_REVEAL_BURST_MS. */
  const [revealBursts, setRevealBursts] = useState([]);
  const lastBurstSecRef = useRef({ sec: 0, count: 0 });

  /* Navigation: Heading (Kompass-Grad, kontinuierlich) + Overview-Modal */
  const [heading, setHeading] = useState(0);
  const [showOverview, setShowOverview] = useState(false);
  const headingHistoryRef = useRef([]);     // letzte Positionen [{lat, lng}, ...]
  const displayedHeadingRef = useRef(0);    // kumulativ, kürzester Pfad zwischen Updates

  const settingsRef = useRef(DEFAULT_SETTINGS);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  /* Active theme — auto-mode re-evaluates every minute to catch sunset/sunrise */
  const [autoTick, setAutoTick] = useState(0);
  useEffect(() => {
    if (settings.themeMode !== 'auto') return;
    const t = setInterval(() => setAutoTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, [settings.themeMode]);
  const themeName = useMemo(() => resolveTheme(settings.themeMode), [settings.themeMode, autoTick]);
  const palette = PALETTES[themeName];

  const watchIdRef = useRef(null);
  const startTsRef = useRef(null);
  const tickRef = useRef(null);
  const lastPosRef = useRef(null);
  const lastLevelIdxRef = useRef(0);
  const demoRef = useRef({ idx: 0, sub: 0, raf: null });
  const wakeLockRef = useRef(null);
  const toastQueueRef = useRef([]);
  const toastTimerRef = useRef(null);

  /* Fonts */
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const id = 'altstadt-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,600;1,9..144,700&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }, []);

  /* Hydrate */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await loadState();
      if (!mounted) return;
      if (data) {
        setUnlocked(new Set(data.unlocked || []));
        setStars(new Set(data.stars || []));
        setAnekdoten(new Set(data.anekdoten || []));
        setPois(new Set(data.pois || []));
        setAchievements(new Set(data.achievements || []));
        setDistance(data.distance || 0);
        setElapsed(data.elapsed || 0);
        if (Array.isArray(data.revealed)) setRevealed(data.revealed);
        setChapterDoneSeen(!!data.chapterDoneSeen);
        if (data.settings) {
          const s = { ...DEFAULT_SETTINGS, ...data.settings };
          setSettings(s);
          settingsRef.current = s;
        }
        if (Array.isArray(data.journal)) setJournal(data.journal);
        const pct = ((data.unlocked?.length || 0) / TOTAL_SEGMENTS) * 100;
        lastLevelIdxRef.current = getLevel(pct).index;
        setWelcomeOpen(!data.welcomeSeen);
      } else {
        setWelcomeOpen(true);
      }
      setHydrated(true);
    })();
    return () => { mounted = false; };
  }, []);

  /* OSM features — fetch once on mount, cached afterwards */
  useEffect(() => {
    let mounted = true;
    setOsmStatus('loading');
    fetchOSMFeatures()
      .then(({ features }) => {
        if (!mounted) return;
        setOsmStreets(features.streets);
        setOsmFeatures(features);
        setOsmStatus('ready');
      })
      .catch(() => {
        if (!mounted) return;
        setOsmStatus('error');
      });
    return () => { mounted = false; };
  }, []);

  /* Persist */
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      saveState({
        unlocked: [...unlocked], stars: [...stars], anekdoten: [...anekdoten],
        pois: [...pois],
        achievements: [...achievements], distance, elapsed,
        welcomeSeen: !welcomeOpen,
        chapterDoneSeen,
        settings,
        journal,
        revealed,
        savedAt: Date.now(),
      });
    }, 800);
    return () => clearTimeout(t);
  }, [unlocked, stars, anekdoten, pois, achievements, distance, elapsed, welcomeOpen, chapterDoneSeen, settings, journal, revealed, hydrated]);

  /* Toast queue */
  const enqueueToast = useCallback((t) => {
    const item = { ...t, ts: Date.now() + Math.random() };
    toastQueueRef.current.push(item);
    setToast((cur) => cur ?? toastQueueRef.current.shift() ?? null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    toastTimerRef.current = setTimeout(() => {
      toastTimerRef.current = null;
      const next = toastQueueRef.current.shift();
      setToast(next || null);
    }, 2800);
    return () => { if (toastTimerRef.current) { clearTimeout(toastTimerRef.current); toastTimerRef.current = null; } };
  }, [toast]);

  /* Sensory feedback (sound + haptics) */
  const fbk = useCallback((type) => {
    const s = settingsRef.current;
    if (s.soundOn && SFX[type]) SFX[type]();
    if (s.hapticsOn && HAPTIC[type] != null) haptic(HAPTIC[type]);
  }, []);

  /* Journal (chronological discovery log) */
  const pushJournal = useCallback((entry) => {
    setJournal((prev) => {
      if (entry.type === 'street' && prev.some((e) => e.type === 'street' && e.name === entry.name)) return prev;
      const item = { id: `${entry.type}-${entry.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ts: Date.now(), ...entry };
      const next = [item, ...prev];
      return next.length > 250 ? next.slice(0, 250) : next;
    });
  }, []);

  /* Process new position */
  const processPosition = useCallback((latlng) => {
    setPosition(latlng);

    // Fog-of-War: aktuelle Position als Reveal-Punkt speichern, sofern weiter
    // als FOG_REVEAL_DEDUP_PX vom letzten entfernt.
    const proj = project(latlng[0], latlng[1]);
    setRevealed((prev) => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const dx = proj.x - last.x, dy = proj.y - last.y;
        if (dx * dx + dy * dy < FOG_REVEAL_DEDUP_PX * FOG_REVEAL_DEDUP_PX) return prev;
      }
      return [...prev, { x: proj.x, y: proj.y }];
    });

    // Heading: aus letzten 4 Positionen mitteln, nur wenn Gesamtbewegung ≥ 3m.
    // Bei zu kurzer Bewegung bleibt der bisherige Heading-Wert erhalten (kein Spring zurück).
    const hist = headingHistoryRef.current;
    hist.push(latlng);
    if (hist.length > 4) hist.shift();
    if (hist.length >= 2) {
      const oldest = hist[0];
      const newest = hist[hist.length - 1];
      const totalM = distanceM(oldest, newest);
      if (totalM >= 3) {
        const a = project(oldest[0], oldest[1]);
        const b = project(newest[0], newest[1]);
        const dx = b.x - a.x, dy = b.y - a.y;
        // Kompass-Grad: 0=N, 90=O, 180=S, 270=W
        const targetHeading = ((Math.atan2(dx, -dy) * 180 / Math.PI) + 360) % 360;
        // Kürzester Winkelpfad zum Ziel
        let delta = ((targetHeading - (displayedHeadingRef.current % 360 + 360) % 360 + 540) % 360) - 180;
        displayedHeadingRef.current = displayedHeadingRef.current + delta;
        setHeading(displayedHeadingRef.current);
      }
    }

    const newSegs = [];
    setUnlocked((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const seg of SEGMENTS) {
        if (next.has(seg.id)) continue;
        if (pointToSegmentM(latlng, seg.a, seg.b) <= UNLOCK_RADIUS_M) {
          next.add(seg.id); newSegs.push(seg); changed = true;
        }
      }
      return changed ? next : prev;
    });

    const newStars = [];
    setStars((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const lm of LANDMARKS) {
        if (next.has(lm.id)) continue;
        if (distanceM(latlng, lm.coords) <= STAR_RADIUS_M) {
          next.add(lm.id); newStars.push(lm); changed = true;
        }
      }
      return changed ? next : prev;
    });

    const newAnek = [];
    setAnekdoten((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const an of ANEKDOTEN) {
        if (next.has(an.id)) continue;
        if (distanceM(latlng, an.coords) <= ANEKDOTE_RADIUS_M) {
          next.add(an.id); newAnek.push(an); changed = true;
        }
      }
      return changed ? next : prev;
    });

    const newPois = [];
    setPois((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const poi of POIS) {
        if (next.has(poi.id)) continue;
        if (distanceM(latlng, poi.coords) <= POI_RADIUS_M) {
          next.add(poi.id); newPois.push(poi); changed = true;
        }
      }
      return changed ? next : prev;
    });

    newStars.forEach((lm) => enqueueToast({ type: 'star', title: lm.name, sub: lm.intro }));
    newAnek.forEach((an) => enqueueToast({ type: 'anekdote', title: an.name, sub: an.intro }));
    newPois.forEach((p) => enqueueToast({ type: 'poi', kind: p.kind, title: p.name, sub: p.intro }));
    if (newSegs.length > 0 && newStars.length === 0 && newAnek.length === 0 && newPois.length === 0) {
      const names = [...new Set(newSegs.map((s) => s.streetName))];
      enqueueToast({
        type: 'street', title: names[0],
        sub: names.length > 1 ? `+${names.length} streets. Keep going.` : '+1 street. Keep going.',
      });
    }

    // Feedback (one signal per batch, prioritize the most exciting)
    if (newStars.length > 0) fbk('star');
    else if (newPois.length > 0) fbk('poi_' + newPois[0].kind);
    else if (newAnek.length > 0) fbk('anekdote');
    else if (newSegs.length > 0) fbk('street');

    /* Gold first-reveal burst — throttle to FOG_REVEAL_BURST_MAX_PER_SEC.
       One burst per batch of new segments (at the player position). */
    if (newSegs.length > 0) {
      const now = Date.now();
      const sec = Math.floor(now / 1000);
      if (lastBurstSecRef.current.sec !== sec) {
        lastBurstSecRef.current = { sec, count: 0 };
      }
      if (lastBurstSecRef.current.count < FOG_REVEAL_BURST_MAX_PER_SEC) {
        lastBurstSecRef.current.count++;
        const burstId = `${now}-${Math.random().toString(36).slice(2, 6)}`;
        setRevealBursts((prev) => [...prev, { id: burstId, x: proj.x, y: proj.y, ts: now }]);
        setTimeout(() => {
          setRevealBursts((prev) => prev.filter((b) => b.id !== burstId));
        }, FOG_REVEAL_BURST_MS + 60);
      }
    }

    // Journal — record everything discovered
    newStars.forEach((lm) => pushJournal({ type: 'star', name: lm.name, sub: lm.intro }));
    newAnek.forEach((an) => pushJournal({ type: 'anekdote', name: an.name, sub: an.intro }));
    newPois.forEach((p) => pushJournal({ type: 'poi', kind: p.kind, name: p.name, sub: p.intro }));
    const newStreetNames = [...new Set(newSegs.map((s) => s.streetName))];
    newStreetNames.forEach((n) => pushJournal({ type: 'street', name: n, sub: 'Street cleared' }));

    setTrail((prev) => {
      const next = [...prev, latlng];
      return next.length > 60 ? next.slice(next.length - 60) : next;
    });
    if (lastPosRef.current) {
      setDistance((d) => d + distanceM(lastPosRef.current, latlng));
    }
    lastPosRef.current = latlng;
  }, [enqueueToast, fbk, pushJournal]);

  /* Achievements */
  useEffect(() => {
    if (!hydrated) return;
    const state = { unlocked, stars, anekdoten, pois, distance, elapsed };
    const newlyEarned = [];
    setAchievements((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const a of ACHIEVEMENTS) {
        if (next.has(a.id)) continue;
        if (a.check(state)) { next.add(a.id); newlyEarned.push(a); changed = true; }
      }
      return changed ? next : prev;
    });
    newlyEarned.forEach((a) => {
      enqueueToast({ type: 'achievement', title: a.name, sub: a.desc });
      pushJournal({ type: 'achievement', name: a.name, sub: a.desc });
    });
    if (newlyEarned.length > 0) fbk('achievement');
  }, [unlocked, stars, anekdoten, pois, distance, elapsed, hydrated, enqueueToast, fbk, pushJournal]);

  /* Derived */
  const pct = useMemo(() => (unlocked.size / TOTAL_SEGMENTS) * 100, [unlocked]);
  const { current: level, next: nextLevel, index: levelIdx } = useMemo(() => getLevel(pct), [pct]);
  const streetsTouched = useMemo(() => {
    const s = new Set();
    unlocked.forEach((segId) => s.add(segId.split('__')[0]));
    return s.size;
  }, [unlocked]);

  /* Level-up */
  useEffect(() => {
    if (!hydrated) return;
    if (levelIdx > lastLevelIdxRef.current) {
      lastLevelIdxRef.current = levelIdx;
      const lv = LEVELS[levelIdx];
      setLevelUp(lv);
      fbk('level');
      enqueueToast({
        type: 'tier',
        title: `You're now a ${lv.name} ${lv.emoji}.`,
        sub: 'Walk the walk.',
      });
      pushJournal({ type: 'level', name: `${lv.emoji} ${lv.name}`, sub: 'New tier reached' });
    }
  }, [levelIdx, hydrated, fbk, pushJournal, enqueueToast]);

  /* Chapter complete (100%) */
  useEffect(() => {
    if (!hydrated) return;
    if (pct >= 99.99 && !chapterDoneSeen) {
      setChapterDoneSeen(true);
      setChapterDone(true);
      fbk('chapter');
      enqueueToast({
        type: 'achievement',
        title: 'Chapter cleared.',
        sub: 'Eurolegends aren\'t born. They are made.',
      });
      pushJournal({ type: 'chapter', name: 'Altstadt conquered', sub: 'Chapter I complete' });
    }
  }, [pct, hydrated, chapterDoneSeen, fbk, pushJournal, enqueueToast]);

  /* Timer */
  useEffect(() => {
    if (tracking && !tickRef.current) {
      const baseTs = Date.now() - elapsed * 1000;
      startTsRef.current = baseTs;
      tickRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTsRef.current) / 1000));
      }, 1000);
    } else if (!tracking && tickRef.current) {
      clearInterval(tickRef.current); tickRef.current = null;
    }
    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; } };
  }, [tracking]); // eslint-disable-line

  /* Real GPS */
  useEffect(() => {
    if (!tracking || simMode) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      enqueueToast({ type: 'error', title: 'GPS unavailable', sub: 'Switched to demo mode' });
      setSimMode(true);
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setAccuracy(pos.coords.accuracy);
        processPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => enqueueToast({ type: 'error', title: 'GPS error', sub: err.message }),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    };
  }, [tracking, simMode, processPosition, enqueueToast]);

  /* Wake Lock */
  useEffect(() => {
    let mounted = true;
    const acquire = async () => {
      if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (!mounted) { lock.release().catch(() => {}); return; }
        wakeLockRef.current = lock;
        setWakeLockActive(true);
        lock.addEventListener?.('release', () => {
          wakeLockRef.current = null;
          setWakeLockActive(false);
        });
      } catch (e) { /* ignore */ }
    };
    const release = () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
        setWakeLockActive(false);
      }
    };
    if (tracking) {
      acquire();
      const onVis = () => {
        if (document.visibilityState === 'visible' && tracking && !wakeLockRef.current) acquire();
      };
      document.addEventListener('visibilitychange', onVis);
      return () => { mounted = false; document.removeEventListener('visibilitychange', onVis); release(); };
    } else { release(); }
    return () => { mounted = false; };
  }, [tracking]);

  /* Visibility */
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVis = () => setBgActive(document.visibilityState === 'hidden' && tracking);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [tracking]);

  /* Demo */
  const stopDemo = useCallback(() => {
    setDemoRunning(false);
    if (demoRef.current.raf) cancelAnimationFrame(demoRef.current.raf);
    demoRef.current = { idx: 0, sub: 0, raf: null };
  }, []);

  const runDemo = useCallback(() => {
    if (!simMode) setSimMode(true);
    if (!tracking) setTracking(true);
    setDemoRunning(true);
    demoRef.current = { idx: 0, sub: 0, raf: null };
    const STEP = 0.012;
    const tick = () => {
      const { idx, sub } = demoRef.current;
      if (idx >= DEMO_ROUTE.length - 1) { stopDemo(); return; }
      const a = DEMO_ROUTE[idx], b = DEMO_ROUTE[idx + 1];
      const lat = a[0] + (b[0] - a[0]) * sub;
      const lng = a[1] + (b[1] - a[1]) * sub;
      processPosition([lat, lng]);
      let nextSub = sub + STEP, nextIdx = idx;
      if (nextSub >= 1) { nextIdx = idx + 1; nextSub = 0; }
      demoRef.current = { ...demoRef.current, idx: nextIdx, sub: nextSub };
      demoRef.current.raf = requestAnimationFrame(tick);
    };
    demoRef.current.raf = requestAnimationFrame(tick);
  }, [simMode, tracking, processPosition, stopDemo]);

  useEffect(() => () => stopDemo(), [stopDemo]);

  /* Reset */
  const handleReset = () => {
    if (typeof window !== 'undefined' && !window.confirm('Reset all progress? Streets, stars, anecdotes and stats will be cleared.')) return;
    stopDemo(); setTracking(false);
    setUnlocked(new Set()); setStars(new Set()); setAnekdoten(new Set()); setPois(new Set()); setAchievements(new Set());
    setTrail([]); setPosition(null); setElapsed(0); setDistance(0); setLevelUp(null); setChapterDone(false);
    setChapterDoneSeen(false); setJournal([]); setRevealed([]);
    setHeading(0); setShowOverview(false);
    headingHistoryRef.current = []; displayedHeadingRef.current = 0;
    lastPosRef.current = null; lastLevelIdxRef.current = 0; startTsRef.current = null;
    saveState({ unlocked: [], stars: [], anekdoten: [], pois: [], achievements: [], distance: 0, elapsed: 0, welcomeSeen: true, chapterDoneSeen: false, settings, journal: [], revealed: [], savedAt: Date.now() });
  };

  const handleStart = () => {
    // Unlock audio context on user gesture (autoplay policy)
    if (settingsRef.current.soundOn) getAudioCtx();
    if (!tracking) setTracking(true);
    else { setTracking(false); stopDemo(); }
  };

  /* Render router */
  return (
    <>
      {view === 'districts' && (
        <DistrictsScreen
          palette={palette}
          stats={{ pct, level, levelIdx, stars: stars.size, anekdoten: anekdoten.size, pois: pois.size, achievements: achievements.size, distance, elapsed }}
          onSelect={(id) => {
            const ch = city.chapters[id];
            if (ch && !ch.locked) {
              setCurrentChapter(id);
              setView('explore');
            } else {
              enqueueToast({ type: 'lock', title: 'Locked.', sub: 'Walk the walk first.' });
            }
          }}
        />
      )}
      {view === 'explore' && (
        <ExploreScreen
          palette={palette}
          state={{ tracking, simMode, demoRunning, position, accuracy, unlocked, stars, anekdoten, pois, achievements, trail, elapsed, distance, level, nextLevel, levelIdx, pct, streetsTouched, bgActive, wakeLockActive, osmStreets, osmFeatures, osmStatus, themeName, revealed, revealBursts, heading, showOverview, anyModalOpen: welcomeOpen || !!activeLandmark || !!activeAnekdote || !!activePoi || !!levelUp || chapterDone || showLegend || showAchievements || showJournal || showSettings || showLokale || showOverview }}
          actions={{ handleStart, handleReset, setSimMode, runDemo, stopDemo, setShowLegend, setShowAchievements, setShowJournal, setShowSettings, setShowLokale, setActiveLandmark, setActiveAnekdote, setActivePoi, setShowOverview, processPosition, lastPosRef, setView,
            cycleTheme: () => setSettings((s) => {
              const next = s.themeMode === 'auto' ? (themeName === 'night' ? 'day' : 'night')
                : s.themeMode === 'day' ? 'night'
                : 'auto';
              return { ...s, themeMode: next };
            })
          }}
        />
      )}

      {welcomeOpen && hydrated && (
        <WelcomeScreen
          onStart={() => { setWelcomeOpen(false); setView('explore'); }}
          onDemo={() => { setWelcomeOpen(false); setView('explore'); runDemo(); }}
        />
      )}
      {toast && <ToastView toast={toast} />}
      {showLegend && <LegendModal onClose={() => setShowLegend(false)} pct={pct} levelIdx={levelIdx} />}
      {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} earned={achievements} pct={pct} stars={stars} anekdoten={anekdoten} pois={pois} distance={distance} elapsed={elapsed} />}
      {showJournal && <JournalModal entries={journal} onClose={() => setShowJournal(false)} />}
      {showSettings && <SettingsModal palette={palette} themeName={themeName} settings={settings} setSettings={setSettings} onReset={handleReset} onClose={() => setShowSettings(false)} />}
      {showLokale && <LokaleListModal pois={pois} position={position} onClose={() => setShowLokale(false)} onSelect={(p) => setActivePoi(p)} />}
      {activeLandmark && <LandmarkModal lm={activeLandmark} unlocked={stars.has(activeLandmark.id)} dist={position ? distanceM(position, activeLandmark.coords) : null} onClose={() => setActiveLandmark(null)} />}
      {activeAnekdote && <AnekdoteModal an={activeAnekdote} unlocked={anekdoten.has(activeAnekdote.id)} dist={position ? distanceM(position, activeAnekdote.coords) : null} onClose={() => setActiveAnekdote(null)} />}
      {activePoi && <PoiModal poi={activePoi} unlocked={pois.has(activePoi.id)} dist={position ? distanceM(position, activePoi.coords) : null} onClose={() => setActivePoi(null)} />}
      {levelUp && <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />}
      {chapterDone && <ChapterCompleteModal stars={stars.size} anekdoten={anekdoten.size} pois={pois.size} elapsed={elapsed} distance={distance} onClose={() => setChapterDone(false)} onBack={() => { setChapterDone(false); setView('districts'); }} />}
      {showOverview && <OverviewModal palette={palette} revealed={revealed} position={position} onClose={() => setShowOverview(false)} />}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          0% { transform: scale(0.85) translateY(20px); opacity: 0; }
          60% { transform: scale(1.02) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes toastIn {
          0% { transform: translate(-50%, -8px); opacity: 0; }
          15% { transform: translate(-50%, 0); opacity: 1; }
          85% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(8px, -6px); }
        }
        @keyframes goldGlow {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(212,169,60,0.4)); }
          50% { filter: drop-shadow(0 0 24px rgba(212,169,60,0.75)); }
        }
        @keyframes confetti {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin   { animation: spin 1s linear infinite; }
        .animate-fadeIn { animation: fadeIn 220ms cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-popIn  { animation: popIn 380ms cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-slideUp { animation: slideUp 380ms cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-toast  { animation: toastIn 2.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>
    </>
  );
}

/* ============================================================================
   WELCOME SCREEN
============================================================================ */

function WelcomeScreen({ onStart, onDemo }) {
  return (
    <div
      className="fixed inset-0 z-[60] animate-fadeIn flex"
      style={{
        background: 'radial-gradient(circle at 30% 25%, #0A1F4F 0%, #07153A 55%, #050C24 100%)',
        color: '#F2EEE5',
        fontFamily: TYPO.body.fontFamily,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Subtle grain + radial vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.45) 100%)',
        mixBlendMode: 'multiply',
      }} />
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]" preserveAspectRatio="none">
        <filter id="welcomeGrain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" /></filter>
        <rect width="100%" height="100%" filter="url(#welcomeGrain)" />
      </svg>

      {/* Layout switches between portrait stack and landscape split via flex */}
      <div
        className="relative w-full max-w-5xl mx-auto px-6 py-8 flex items-center justify-center
                   flex-col landscape:flex-row landscape:gap-12 landscape:items-center"
        style={{ minHeight: '100%' }}
      >
        {/* Logo block */}
        <div className="flex flex-col items-center text-center landscape:items-start landscape:text-left landscape:flex-1 animate-popIn">
          <LaurelWreath size={132} monogram="EL" glow />
          <h1
            className="mt-7"
            style={{
              ...TYPO.wordmark,
              fontSize: 'clamp(40px, 9vw, 64px)',
              lineHeight: 0.95,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
              textShadow: '0 2px 24px rgba(0,229,255,0.18)',
            }}
          >
            EURO LEGEND
          </h1>
          <p className="mt-3" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.55, color: '#FFFFFF' }}>
            Chapter I · Zürich · Old Town
          </p>
        </div>

        {/* Tagline + CTA block */}
        <div className="flex flex-col items-center text-center landscape:items-start landscape:text-left landscape:flex-1 mt-8 landscape:mt-0 max-w-md animate-popIn">
          <p
            className="leading-snug"
            style={{
              ...TYPO.displayItalic,
              fontSize: 'clamp(18px, 4.4vw, 22px)',
              color: 'rgba(255,255,255,0.86)',
            }}
          >
            Walk the walk, if you talk the talk.<br />
            Eurolegends aren&apos;t born.<br />
            They are made.
          </p>

          <div className="mt-8 w-full max-w-sm flex flex-col gap-3">
            <button
              onClick={onStart}
              className="w-full rounded-xl tap"
              style={{
                minHeight: '56px',
                background: '#00E5FF',
                color: '#050C24',
                fontFamily: TYPO.ui.fontFamily,
                fontWeight: 700,
                fontSize: '16px',
                letterSpacing: '0.02em',
                boxShadow: '0 8px 28px rgba(0,229,255,0.30), inset 0 1px 0 rgba(255,255,255,0.4)',
              }}
            >
              Start in Zurich
            </button>
            <button
              onClick={onDemo}
              className="w-full rounded-xl tap"
              style={{
                minHeight: '56px',
                background: 'transparent',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255,255,255,0.35)',
                fontFamily: TYPO.ui.fontFamily,
                fontWeight: 600,
                fontSize: '15px',
                letterSpacing: '0.02em',
              }}
            >
              Demo mode
            </button>
          </div>

          <p className="mt-8" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.4, color: '#FFFFFF' }}>
            More cities coming. Build your stamps.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   DISTRICTS SCREEN — chapter selection
============================================================================ */

function DistrictsScreen({ palette, stats, onSelect }) {
  const altstadtStars = LANDMARKS.length;
  const altstadtAnek = ANEKDOTEN.length;
  const isNight = palette.name === 'night';
  return (
    <div
      className="w-full min-h-screen-dvh flex flex-col"
      style={{
        background: palette.pageBg,
        fontFamily: TYPO.body.fontFamily, color: palette.text,
        transition: 'background 800ms var(--ease-premium), color 600ms var(--ease-premium)',
      }}
    >
      <header
        className="px-5 pt-6 pb-4 flex items-start justify-between"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}
      >
        <div>
          <p style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.55 }} className="mb-1">City Atlas</p>
          <h1 style={{ ...TYPO.display, fontWeight: 800, fontSize: '32px', lineHeight: 1 }}>
            Zürich
          </h1>
          <p className="text-sm opacity-65 mt-1.5">{isNight ? 'After dark' : 'By day'}</p>
        </div>
        {/* Wordmark + laurel — tight pairing, 8px gap. Wordmark hides under 360px. */}
        <div className="flex items-center" style={{ gap: 8 }}>
          <span
            className="hidden xs:inline-block sm:inline-block"
            style={{
              fontFamily: '"Space Grotesk", "Inter", sans-serif',
              fontWeight: 500,
              fontSize: 10,
              letterSpacing: '0.12em',
              color: isNight ? 'rgba(255,255,255,0.7)' : 'rgba(10,31,79,0.7)',
              whiteSpace: 'nowrap',
            }}
          >
            EURO LEGEND
          </span>
          <LaurelWreath size={48} monogram="EL" />
        </div>
      </header>

      <div className="px-4 pb-8 flex-1 flex flex-col gap-3 relative">
        {DISTRICTS.map((d) => {
          const isAlt = d.id === 'altstadt';
          const Icon = d.icon;
          const lockedBg = isNight ? 'rgba(255,255,255,0.04)' : 'rgba(10,31,79,0.05)';
          const lockedBorder = isNight ? 'rgba(255,255,255,0.18)' : 'rgba(10,31,79,0.20)';
          const lockedIcon = isNight ? 'rgba(255,255,255,0.4)' : 'rgba(10,31,79,0.50)';
          const lockedBadge = isNight ? 'rgba(255,255,255,0.10)' : 'rgba(10,31,79,0.10)';
          const lockedIconBg = isNight ? 'rgba(255,255,255,0.08)' : 'rgba(10,31,79,0.08)';
          return (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              className="relative w-full text-left p-4 rounded-2xl atlas-card overflow-hidden"
              style={{
                background: d.available
                  ? `linear-gradient(135deg, ${d.color} 0%, ${d.accent} 100%)`
                  : lockedBg,
                border: d.available ? 'none' : `1px dashed ${lockedBorder}`,
                color: d.available ? '#FFFFFF' : palette.text,
                boxShadow: d.available ? `0 6px 18px ${d.color}40, inset 0 1px 0 rgba(255,255,255,0.2)` : 'none',
                cursor: 'pointer',
                opacity: d.available ? 1 : 0.78,
                transition: 'transform 180ms var(--ease-premium), box-shadow 180ms var(--ease-premium), opacity 180ms var(--ease-premium)',
              }}
            >
              {d.available && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15), transparent 60%)' }} />
              )}

              <div className="relative flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: d.available ? 'rgba(255,255,255,0.18)' : lockedIconBg,
                    border: d.available ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  }}
                >
                  {d.available ? <Icon size={22} color="#FFFFFF" strokeWidth={2} /> : <Lock size={18} color={lockedIcon} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.85 }}>
                      Chapter {d.roman}
                    </span>
                    {!d.available && (
                      <span style={{ ...TYPO.caps, fontSize: '9px', background: lockedBadge }} className="px-1.5 py-0.5 rounded-full">
                        Soon
                      </span>
                    )}
                  </div>
                  <h2 style={{ ...TYPO.display, fontWeight: 700, fontSize: '20px', lineHeight: 1.1 }}>
                    {d.name}
                  </h2>
                  <p className="text-[12px] opacity-85 mt-0.5 leading-snug">{d.subtitle}</p>

                  {isAlt && (
                    <div className="mt-3 space-y-2">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.22)' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stats.pct}%`, background: 'linear-gradient(90deg, #00E5FF, #FFFFFF)' }} />
                      </div>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] opacity-95">
                        <span className="flex items-center gap-1">
                          <span style={{ fontSize: '12px' }}>{stats.level.emoji}</span>
                          <span style={{ fontWeight: 700 }}>{stats.level.name}</span>
                        </span>
                        <span>·</span>
                        <span>{stats.pct.toFixed(0)}%</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Star size={10} fill="#F2D88A" stroke="none" /> {stats.stars}/{altstadtStars}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><BookOpen size={10} /> {stats.anekdoten}/{altstadtAnek}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Martini size={10} /> {stats.pois ?? 0}/{POIS.length}</span>
                      </div>
                    </div>
                  )}
                </div>

                {d.available && (
                  <ArrowUpRight size={18} className="shrink-0 mt-1 opacity-80" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom vignette — soft scroll fade, deep indigo → transparent. */}
      <div
        className="pointer-events-none absolute left-0 right-0"
        style={{
          bottom: 0,
          height: 80,
          background: `linear-gradient(to top, ${isNight ? '#050C24' : '#0A1F4F'}26, transparent)`,
        }}
        aria-hidden
      />

      <footer
        className="px-5 py-4 text-center relative"
        style={{
          fontFamily: '"Space Grotesk", "Inter", sans-serif',
          fontWeight: 500,
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: isNight ? 'rgba(255,255,255,0.5)' : 'rgba(10,31,79,0.5)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
        }}
      >
        More chapters coming. Build your stamps.
      </footer>
    </div>
  );
}

/* ============================================================================
   EXPLORE SCREEN — main map view
============================================================================ */

function ExploreScreen({ palette, state, actions }) {
  const { tracking, simMode, demoRunning, position, accuracy, unlocked, stars, anekdoten, pois, achievements, trail, elapsed, distance, level, nextLevel, levelIdx, pct, streetsTouched, bgActive, wakeLockActive, osmStreets, osmFeatures, osmStatus, themeName, revealed, revealBursts = [], heading, showOverview, anyModalOpen } = state;
  const { handleStart, handleReset, setSimMode, runDemo, stopDemo, setShowLegend, setShowAchievements, setShowJournal, setShowSettings, setShowLokale, setActiveLandmark, setActiveAnekdote, setActivePoi, setShowOverview, processPosition, lastPosRef, setView, cycleTheme } = actions;

  const svgRef = useRef(null);
  const LevelIcon = level.icon;
  const NextIcon = nextLevel?.icon;

  /* Fog: bolder opacity (day/night). Reveal radius lerps between
     "default" and "nav" as the camera zooms into the player. */
  const fogOpacity = themeName === 'night' ? FOG_OPACITY_NIGHT : FOG_OPACITY_DAY;

  const progressInBracket = (() => {
    const lo = level.threshold, hi = nextLevel ? nextLevel.threshold : 100;
    return Math.min(100, Math.max(0, ((pct - lo) / (hi - lo)) * 100));
  })();

  const landmarkDistances = useMemo(() => {
    if (!position) return {};
    const out = {};
    LANDMARKS.forEach((lm) => { out[lm.id] = distanceM(position, lm.coords); });
    return out;
  }, [position]);

  const nextStarHint = useMemo(() => {
    if (!position) return null;
    const candidates = LANDMARKS.filter((lm) => !stars.has(lm.id))
      .map((lm) => ({ lm, d: landmarkDistances[lm.id] }))
      .sort((a, b) => a.d - b.d);
    return candidates[0] || null;
  }, [position, stars, landmarkDistances]);

  const nearestPoi = useMemo(() => {
    if (!position) return null;
    const candidates = POIS.filter((p) => !pois.has(p.id))
      .map((p) => ({ p, d: distanceM(position, p.coords) }))
      .sort((a, b) => a.d - b.d);
    return candidates[0] || null;
  }, [position, pois]);

  /* ============================================================================
     NAVIGATION: viewBox-Zoom auf Spieler, Heading-Rotation, 3D-Tilt.
     SVG-Element ist via CSS 250% des Containers (NAV_OVERSCAN), damit nach
     Rotation alle Container-Ecken zuverlässig gefüllt bleiben. ViewBox-Grösse
     ist entsprechend skaliert; sichtbare Region bleibt ~50m Radius.
     transitionProgress 0→1 wird per rAF beim ersten Positions-Fix interpoliert,
     damit Voll-Kartenansicht glatt in Nav-View überblendet (~800ms).
  ============================================================================ */
  const NAV_OVERSCAN = 2.5;                                        // SVG-Element 250% des Containers
  const NAV_VIEWBOX_SIZE_VISIBLE = 200;                            // sichtbare viewBox-Region (~50m Radius)
  const NAV_VIEWBOX_SIZE_RAW = NAV_VIEWBOX_SIZE_VISIBLE * NAV_OVERSCAN;  // 500
  const NAV_PLAYER_OFFSET_CONTAINER = 0.65;                        // Spieler bei 65% des Containers (Sicht voraus)
  const NAV_PLAYER_OFFSET_SVG = 0.5 + (NAV_PLAYER_OFFSET_CONTAINER - 0.5) / NAV_OVERSCAN;  // 0.56 — Spieler-Position innerhalb des SVG-Elements
  const NAV_TILT_DEG = 28;
  const navMode = !!position;
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [firstTransitionDone, setFirstTransitionDone] = useState(false);
  const transitionStartedRef = useRef(false);

  useEffect(() => {
    if (!navMode || transitionStartedRef.current) return;
    transitionStartedRef.current = true;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 800);
      const ease = 1 - Math.pow(1 - t, 3);
      setTransitionProgress(ease);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setFirstTransitionDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [navMode]);

  const playerProj = useMemo(
    () => position ? project(position[0], position[1]) : { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 },
    [position]
  );

  // Throttling für Mini-Map: aktuelle position/revealed nur alle ~500ms weitergeben.
  const [miniPosition, setMiniPosition] = useState(position);
  const [miniRevealed, setMiniRevealed] = useState(revealed);
  const miniLastUpdateRef = useRef(0);
  useEffect(() => {
    const now = performance.now();
    const delta = now - miniLastUpdateRef.current;
    if (delta >= 500) {
      miniLastUpdateRef.current = now;
      setMiniPosition(position);
      setMiniRevealed(revealed);
      return;
    }
    const tm = setTimeout(() => {
      miniLastUpdateRef.current = performance.now();
      setMiniPosition(position);
      setMiniRevealed(revealed);
    }, 500 - delta);
    return () => clearTimeout(tm);
  }, [position, revealed]);

  // Beide viewBoxes sind um NAV_OVERSCAN vergrössert, damit der visuelle Zoom
  // (in der Container-Mitte sichtbar) unabhängig vom Overscan konstant bleibt.
  // FullVB ist quadratisch (max(VIEWPORT.w, VIEWPORT.h) * OVERSCAN), damit die
  // Altstadt mit Slice-Aspect ohne starkes Cropping ins Container-Quadrat passt.
  const fullVBSize = Math.max(VIEWPORT.width, VIEWPORT.height) * NAV_OVERSCAN;
  const fullVB = {
    x: VIEWPORT.width / 2 - fullVBSize / 2,
    y: VIEWPORT.height / 2 - fullVBSize / 2,
    w: fullVBSize,
    h: fullVBSize,
  };
  const navVB = {
    x: playerProj.x - NAV_VIEWBOX_SIZE_RAW / 2,
    y: playerProj.y - NAV_VIEWBOX_SIZE_RAW * NAV_PLAYER_OFFSET_SVG,
    w: NAV_VIEWBOX_SIZE_RAW,
    h: NAV_VIEWBOX_SIZE_RAW,
  };
  const tp = transitionProgress;
  /* Fog reveal radius: default when stationary, narrows to nav radius when zoomed in. */
  const fogRevealRadius = FOG_REVEAL_RADIUS.default + (FOG_REVEAL_RADIUS.nav - FOG_REVEAL_RADIUS.default) * tp;
  const viewBoxAttr = `${fullVB.x + (navVB.x - fullVB.x) * tp} ${fullVB.y + (navVB.y - fullVB.y) * tp} ${fullVB.w + (navVB.w - fullVB.w) * tp} ${fullVB.h + (navVB.h - fullVB.h) * tp}`;

  const effectiveTilt = NAV_TILT_DEG * tp;
  const effectiveRotation = -heading * tp;
  const svgTransform = `perspective(900px) rotateX(${effectiveTilt}deg) rotateZ(${effectiveRotation}deg)`;
  // Label-Gegenrotation in SVG-Space (kompensiert nur den rotateZ-Anteil)
  const labelCounterRot = heading * tp;
  // Während rAF: keine CSS-Transition (rAF treibt die Animation). Danach: 400ms ease-out für Heading-Updates.
  const transformTransition = firstTransitionDone ? 'transform 400ms ease-out' : 'none';
  // transform-origin ist in SVG-Element-Koordinaten; Spieler liegt bei (50%, NAV_PLAYER_OFFSET_SVG).
  const transformOriginCss = `50% ${NAV_PLAYER_OFFSET_SVG * 100}%`;
  // CSS-Overscan-Werte für das SVG-Element
  const svgOverscanOffsetPct = -50 * (NAV_OVERSCAN - 1);            // -75%
  const svgOverscanSizePct = 100 * NAV_OVERSCAN;                   // 250%

  const handleSvgClick = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());

    for (const lm of LANDMARKS) {
      const lp = project(lm.coords[0], lm.coords[1]);
      if (Math.hypot(lp.x - local.x, lp.y - local.y) < 22) { setActiveLandmark(lm); return; }
    }
    for (const poi of POIS) {
      const pp = project(poi.coords[0], poi.coords[1]);
      // Hit area: pin disc ist ~15px über der Location (skaliert für engen Zoom)
      if (Math.hypot(pp.x - local.x, (pp.y - 15) - local.y) < 10) { setActivePoi(poi); return; }
    }
    for (const an of ANEKDOTEN) {
      const ap = project(an.coords[0], an.coords[1]);
      if (Math.hypot(ap.x - local.x, ap.y - local.y) < 14) { setActiveAnekdote(an); return; }
    }

    if (!simMode || !tracking || demoRunning) return;
    const target = unproject(local.x, local.y);
    const start = lastPosRef.current || target;
    const segLen = distanceM(start, target);
    const steps = Math.max(1, Math.min(60, Math.ceil(segLen / 8)));
    let i = 0;
    const step = () => {
      i++;
      const t = i / steps;
      const p = [start[0] + (target[0] - start[0]) * t, start[1] + (target[1] - start[1]) * t];
      processPosition(p);
      if (i < steps) setTimeout(step, 30);
    };
    step();
  }, [simMode, tracking, demoRunning, processPosition, setActiveLandmark, setActiveAnekdote, setActivePoi, lastPosRef]);

  const userPos = position ? project(position[0], position[1]) : null;
  const trailPts = trail.map((p) => project(p[0], p[1]));
  const riverPts = RIVER_PATH.map((p) => project(p[0], p[1]));

  // "Open now" estimation by kind — gives POI pins a living, time-aware feel
  const isPoiActive = (kind) => {
    const h = new Date().getHours();
    if (kind === 'bar') return h >= 17 || h < 2;
    if (kind === 'restaurant') return (h >= 11 && h < 14) || (h >= 18 && h < 23);
    if (kind === 'club') return h >= 22 || h < 4;
    return false;
  };

  return (
    <div
      className="w-full flex flex-col min-h-screen-dvh"
      style={{
        background: palette.pageBg,
        fontFamily: TYPO.body.fontFamily,
        color: palette.text,
        transition: 'background 800ms var(--ease-premium), color 600ms var(--ease-premium)',
      }}
    >
      <header
        className="px-3 pt-4 pb-3 flex items-center justify-between border-b"
        style={{
          borderColor: palette.headerBorder,
          paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
          paddingLeft: 'calc(env(safe-area-inset-left) + 12px)',
          paddingRight: 'calc(env(safe-area-inset-right) + 12px)',
          transition: 'border-color 600ms var(--ease-premium)',
        }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('districts')}
            className="rounded-full flex items-center justify-center tap"
            style={{ width: 44, height: 44, background: palette.iconBtnBg }}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.55 }}>Chapter I</p>
            <h1 className="text-lg leading-none" style={{ ...TYPO.display, fontWeight: 700 }}>
              Altstadt
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={cycleTheme} className="rounded-full flex items-center justify-center tap" style={{ width: 44, height: 44, background: palette.iconBtnBg }} aria-label="Day / night">
            {themeName === 'night' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => setShowJournal(true)} className="rounded-full flex items-center justify-center tap" style={{ width: 44, height: 44, background: palette.iconBtnBg }} aria-label="Journal">
            <NotebookPen size={18} />
          </button>
          <button onClick={() => setShowAchievements(true)} className="relative rounded-full flex items-center justify-center tap" style={{ width: 44, height: 44, background: palette.iconBtnBg }} aria-label="Achievements">
            <Trophy size={18} />
            {achievements.size > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: '#D4A93C', color: '#0A1F4F' }}>
                {achievements.size}
              </span>
            )}
          </button>
          <button onClick={() => setShowSettings(true)} className="rounded-full flex items-center justify-center tap" style={{ width: 44, height: 44, background: palette.iconBtnBg }} aria-label="Settings">
            <SettingsIcon size={18} />
          </button>
        </div>
      </header>

      <div className="relative flex-1 min-h-[420px] overflow-hidden map-no-zoom" style={{ background: palette.mapBg, transition: 'background 800ms var(--ease-premium)', perspective: '900px' }}>
        <svg
          ref={svgRef}
          viewBox={viewBoxAttr}
          preserveAspectRatio="xMidYMid slice"
          onClick={handleSvgClick}
          style={{
            position: 'absolute',
            top: `${svgOverscanOffsetPct}%`,
            left: `${svgOverscanOffsetPct}%`,
            width: `${svgOverscanSizePct}%`,
            height: `${svgOverscanSizePct}%`,
            display: 'block',
            cursor: simMode && tracking && !demoRunning ? 'crosshair' : 'default',
            touchAction: 'manipulation',
            transform: svgTransform,
            transformOrigin: transformOriginCss,
            transition: transformTransition,
            willChange: 'transform',
          }}
        >
          <defs>
            <filter id="paperNoise" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
              <feColorMatrix values={palette.paperNoiseColor} />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.riverTop} />
              <stop offset="100%" stopColor={palette.riverBottom} />
            </linearGradient>
            <radialGradient id="lakeGrad" cx="50%" cy="100%" r="100%">
              <stop offset="0%" stopColor={palette.lakeBottom} />
              <stop offset="100%" stopColor={palette.lakeTop} />
            </radialGradient>
            <radialGradient id="userPulse">
              <stop offset="0%" stopColor={palette.userPulseColor} stopOpacity="0.5" />
              <stop offset="100%" stopColor={palette.userPulseColor} stopOpacity="0" />
            </radialGradient>
            {/* Vignette + Outer-Fade in einem: transparent in der Altstadt-Region,
                Verdunkelung am Rand des natürlichen Viewports, voll mapBg ab Radius
                1500 vom Karten-Zentrum (alles weiter draussen → flacher mapBg-Fill). */}
            <radialGradient id="vignette" cx={VIEWPORT.width / 2} cy={VIEWPORT.height / 2} r="1500" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="rgba(0,0,0,0)" />
              <stop offset="40%"  stopColor="rgba(0,0,0,0)" />
              <stop offset="55%"  stopColor={palette.vignette} />
              <stop offset="100%" stopColor={palette.mapBg} stopOpacity="1" />
            </radialGradient>
            <radialGradient id="starGlow">
              <stop offset="0%" stopColor="#FFE9B0" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#C8923C" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#C8923C" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="starFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE9B0" />
              <stop offset="100%" stopColor="#C8923C" />
            </linearGradient>
            <filter id="poiPinShadow" x="-50%" y="-30%" width="200%" height="180%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" />
              <feOffset dy="2.5" />
              <feComponentTransfer><feFuncA type="linear" slope="0.55" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Fog-of-War: weiche Reveal-Kante */}
            <radialGradient id="fogReveal" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="black" stopOpacity="1" />
              <stop offset="55%"  stopColor="black" stopOpacity="0.95" />
              <stop offset="100%" stopColor="black" stopOpacity="0" />
            </radialGradient>
            {/* Fog-of-War: vertikaler Volumen-Gradient (Highlight oben, Shadow unten) */}
            <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={palette.fogHighlight} />
              <stop offset="55%"  stopColor={palette.fogColor} />
              <stop offset="100%" stopColor={palette.fogShadow} />
            </linearGradient>
            {/* Fog-of-War: organische Volumen-Textur via Fractal-Noise */}
            <filter id="fogTexture" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="3" seed="11" />
              <feColorMatrix type="matrix" values={palette.fogTextureTint} />
            </filter>
            {/* Fog-of-War mask — white = fog visible, black/transparent = cleared.
               Reveal radius adapts to zoom: navigation (45) ↔ default (70). */}
            <mask id="fogMask" maskUnits="userSpaceOnUse" x={EXTENT.x} y={EXTENT.y} width={EXTENT.w} height={EXTENT.h}>
              <rect x={EXTENT.x} y={EXTENT.y} width={EXTENT.w} height={EXTENT.h} fill="white" />
              {revealed.map((p, i) => (
                <circle key={i}
                  cx={p.x} cy={p.y}
                  r={fogRevealRadius}
                  fill="url(#fogReveal)" />
              ))}
            </mask>
            {/* Gold "first-reveal" burst gradient. */}
            <radialGradient id="fogBurst" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#D4A93C" stopOpacity="0.85" />
              <stop offset="50%"  stopColor="#D4A93C" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#D4A93C" stopOpacity="0" />
            </radialGradient>
            {/* Cyan frontier glow gradient — at the moving player edge. */}
            <radialGradient id="fogFrontier" cx="50%" cy="50%" r="50%">
              <stop offset="55%"  stopColor="#00E5FF" stopOpacity="0" />
              <stop offset="80%"  stopColor="#00E5FF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x={EXTENT.x} y={EXTENT.y} width={EXTENT.w} height={EXTENT.h} fill={palette.paperFill} style={{ transition: 'fill 800ms ease' }} />
          <rect x={EXTENT.x} y={EXTENT.y} width={EXTENT.w} height={EXTENT.h} filter="url(#paperNoise)" opacity={palette.paperNoiseOpacity} />

          {/* Starfield (night only) */}
          {palette.starfieldVisible && (
            <g style={{ pointerEvents: 'none' }}>
              {STARFIELD.map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#F5E9D0" opacity={s.o}>
                  <animate attributeName="opacity" values={`${s.o};${s.o * 0.35};${s.o}`} dur={`${s.tw}s`} begin={`${s.td}s`} repeatCount="indefinite" />
                </circle>
              ))}
              {/* Moon */}
              <g transform="translate(120, 90)" style={{ pointerEvents: 'none' }}>
                <circle r="32" fill="#FFE9B0" opacity="0.06">
                  <animate attributeName="r" values="28;36;28" dur="6s" repeatCount="indefinite" />
                </circle>
                <circle r="22" fill="#FFE9B0" opacity="0.12" />
                <circle r="14" fill="#F5E9D0" opacity="0.85" />
                <circle cx="-3" cy="-2" r="2.2" fill="#D4C8A8" opacity="0.5" />
                <circle cx="3" cy="3" r="1.4" fill="#D4C8A8" opacity="0.45" />
                <circle cx="-4" cy="4" r="1.1" fill="#D4C8A8" opacity="0.4" />
              </g>
            </g>
          )}

          {/* Lake (south) — under everything else */}
          <polygon
            points={LAKE_PATH.map((p) => { const pp = project(p[0], p[1]); return `${pp.x},${pp.y}`; }).join(' ')}
            fill="url(#lakeGrad)"
            opacity={palette.riverOpacity}
            style={{ transition: 'opacity 600ms ease' }}
          />
          {/* Lake horizontal shimmer lines */}
          {(() => {
            // Project lake bounds
            const lakePts = LAKE_PATH.map((p) => project(p[0], p[1]));
            const minY = Math.min(...lakePts.map((p) => p.y));
            const maxY = Math.max(...lakePts.map((p) => p.y));
            const minX = Math.min(...lakePts.map((p) => p.x));
            const maxX = Math.max(...lakePts.map((p) => p.x));
            // Deterministic pseudo-random so animations don't restart every render
            let seed = 7;
            const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
            const lines = [];
            for (let y = minY + 8; y < maxY; y += 14) {
              const w = (maxX - minX) * (0.5 + rnd() * 0.4);
              const cx = minX + (maxX - minX) * (0.3 + rnd() * 0.4);
              lines.push({ y, x1: cx - w / 2, x2: cx + w / 2, dur: 4 + rnd() * 3, delay: rnd() * 4 });
            }
            return (
              <g style={{ pointerEvents: 'none' }}>
                {lines.map((l, i) => (
                  <line key={`lakew-${i}`} x1={l.x1} y1={l.y} x2={l.x2} y2={l.y} stroke={palette.riverHighlight} strokeWidth="0.6" strokeLinecap="round" opacity="0">
                    <animate attributeName="opacity" values="0;0.45;0" dur={`${l.dur}s`} begin={`${l.delay}s`} repeatCount="indefinite" />
                  </line>
                ))}
              </g>
            );
          })()}

          {/* River */}
          <polyline points={riverPts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="url(#riverGrad)" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" opacity={palette.riverOpacity} />
          <polyline points={riverPts.map((p) => `${p.x - 4},${p.y - 1}`).join(' ')} fill="none" stroke={palette.riverHighlight} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          {/* Animated shimmer flowing south (downstream) */}
          <polyline points={riverPts.map((p) => `${p.x + 2},${p.y + 2}`).join(' ')} fill="none" stroke={palette.riverHighlight} strokeWidth="0.9" strokeLinecap="round" opacity="0.4" strokeDasharray="6 18">
            <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="6s" repeatCount="indefinite" />
          </polyline>
          <polyline points={riverPts.map((p) => `${p.x - 6},${p.y - 2}`).join(' ')} fill="none" stroke={palette.riverHighlight} strokeWidth="0.7" strokeLinecap="round" opacity="0.3" strokeDasharray="3 22">
            <animate attributeName="stroke-dashoffset" from="0" to="-50" dur="9s" repeatCount="indefinite" />
          </polyline>

          {/* Brücken — rechteckige Balken senkrecht zum Strassenverlauf, mit Geländer-Strichen */}
          <g style={{ pointerEvents: 'none' }}>
            {STREETS.filter((s) => s.side === 'bridge').map((bridge) => {
              const points = bridge.points;
              if (points.length < 2) return null;
              // Pro Brücke: nutze nur erste→letzte Punkte für Achse (sind kurz, gerade)
              const a = project(points[0][0], points[0][1]);
              const b = project(points[points.length - 1][0], points[points.length - 1][1]);
              const dx = b.x - a.x, dy = b.y - a.y;
              const len = Math.hypot(dx, dy) || 1;
              const tx = dx / len, ty = dy / len;       // Tangente (Brückenrichtung)
              const nx = -ty, ny = tx;                  // Normale (quer zur Brücke)
              const halfW = 6;                          // halbe Brückenbreite
              // Brückendeck-Polygon
              const corners = [
                [a.x + nx * halfW, a.y + ny * halfW],
                [b.x + nx * halfW, b.y + ny * halfW],
                [b.x - nx * halfW, b.y - ny * halfW],
                [a.x - nx * halfW, a.y - ny * halfW],
              ];
              const polyPts = corners.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
              return (
                <g key={`bridge-${bridge.id}`}>
                  {/* Unterschatten */}
                  <polygon points={polyPts} fill={palette.bridgeEdge} opacity="0.55"
                    transform="translate(0.5, 1.2)" />
                  {/* Brückendeck */}
                  <polygon points={polyPts} fill={palette.bridgeFill}
                    stroke={palette.bridgeEdge} strokeWidth="0.6" strokeLinejoin="round" />
                  {/* Geländer auf beiden Seiten */}
                  <line
                    x1={a.x + nx * halfW} y1={a.y + ny * halfW}
                    x2={b.x + nx * halfW} y2={b.y + ny * halfW}
                    stroke={palette.bridgeRail} strokeWidth="0.7" strokeLinecap="round" />
                  <line
                    x1={a.x - nx * halfW} y1={a.y - ny * halfW}
                    x2={b.x - nx * halfW} y2={b.y - ny * halfW}
                    stroke={palette.bridgeRail} strokeWidth="0.7" strokeLinecap="round" />
                </g>
              );
            })}
          </g>

          {/* OSM water polygons (pools, fountains' basins, etc.) — under everything else */}
          {osmFeatures && osmFeatures.water.length > 0 && (
            <g style={{ pointerEvents: 'none' }}>
              {osmFeatures.water.map((w) => {
                const pts = w.points.map(([la, ln]) => { const p = project(la, ln); return `${p.x},${p.y}`; }).join(' ');
                return <polygon key={w.id} points={pts} fill={palette.osmWaterFill} opacity="0.85" />;
              })}
            </g>
          )}

          {/* OSM parks/grass/cemeteries — under buildings */}
          {osmFeatures && osmFeatures.parks.length > 0 && (
            <g style={{ pointerEvents: 'none' }}>
              {osmFeatures.parks.map((p) => {
                const pts = p.points.map(([la, ln]) => { const pp = project(la, ln); return `${pp.x},${pp.y}`; }).join(' ');
                return <polygon key={p.id} points={pts} fill={palette.osmParkFill} stroke={palette.osmParkStroke} strokeWidth="0.6" opacity="0.85" />;
              })}
            </g>
          )}

          {/* OSM parking lots */}
          {osmFeatures && osmFeatures.parking.length > 0 && (
            <g style={{ pointerEvents: 'none' }}>
              {osmFeatures.parking.map((p) => {
                const pts = p.points.map(([la, ln]) => { const pp = project(la, ln); return `${pp.x},${pp.y}`; }).join(' ');
                return <polygon key={p.id} points={pts} fill={palette.osmParkingFill} stroke={palette.osmParkingStroke} strokeWidth="0.5" opacity="0.7" />;
              })}
            </g>
          )}

          {/* OSM rail — under buildings, drawn as dashed lines */}
          {osmFeatures && osmFeatures.rail.length > 0 && (
            <g style={{ pointerEvents: 'none' }}>
              {osmFeatures.rail.map((r) => {
                const pts = r.points.map(([la, ln]) => { const p = project(la, ln); return `${p.x},${p.y}`; }).join(' ');
                return (
                  <g key={r.id}>
                    <polyline points={pts} fill="none" stroke={palette.osmRailStroke} strokeWidth="1.6" opacity="0.85" />
                    <polyline points={pts} fill="none" stroke={palette.streetFill} strokeWidth="0.9" strokeDasharray="2 4" opacity="0.7" />
                  </g>
                );
              })}
            </g>
          )}

          {/* Hauptbahnhof building + tracks (only when OSM hasn't loaded — OSM has the real one) */}
          {(!osmFeatures || osmFeatures.buildings.length === 0) && (
            <g style={{ transition: 'opacity 600ms ease' }}>
              {HBF_TRACKS.map(([a, b], i) => {
                const pa = project(a[0], a[1]); const pb = project(b[0], b[1]);
                return <line key={`track-${i}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={palette.tramTrack} strokeWidth="1.5" strokeDasharray="6 3" opacity="0.7" />;
              })}
              <polygon
                points={HBF_BUILDING.map((p) => { const pp = project(p[0], p[1]); return `${pp.x},${pp.y}`; }).join(' ')}
                fill={palette.hbfFill}
                stroke={palette.hbfStroke}
                strokeWidth="1.2"
                opacity="0.85"
              />
              {(() => {
                const center = project((HBF_BUILDING[0][0] + HBF_BUILDING[2][0]) / 2, (HBF_BUILDING[0][1] + HBF_BUILDING[2][1]) / 2);
                return (
                  <text x={center.x} y={center.y + 3} textAnchor="middle" fontSize="9" fontFamily="Fraunces, Georgia, serif" fontWeight="700" fill={palette.hbfStroke} opacity="0.85" style={{ pointerEvents: 'none' }}
                    transform={`rotate(${labelCounterRot} ${center.x} ${center.y + 3})`}>
                    Hbf
                  </text>
                );
              })()}
            </g>
          )}

          {/* OSM buildings — Google Maps-like rendering with crisp outlines.
              Helligkeitsvariation pro Haus via deterministischem ID-Hash + Ostkanten-Schatten
              simuliert Licht aus Nordwesten (gibt 2.5D-Tiefe). */}
          {osmFeatures && osmFeatures.buildings.length > 0 ? (
            <g style={{ pointerEvents: 'none' }}>
              {/* Pass 1: drop shadows (Boden) */}
              {osmFeatures.buildings.map((b) => {
                const pts = b.points.map(([la, ln]) => { const p = project(la, ln); return `${p.x + 0.8},${p.y + 1.2}`; }).join(' ');
                return <polygon key={`bs-${b.id}`} points={pts} fill={palette.osmBuildingShadow} opacity="0.55" />;
              })}
              {/* Pass 2: fills mit deterministischer Helligkeits-Variation */}
              {osmFeatures.buildings.map((b) => {
                const isChurch = b.kind === 'church' || b.kind === 'cathedral' || b.kind === 'chapel';
                const pts = b.points.map(([la, ln]) => { const p = project(la, ln); return `${p.x},${p.y}`; }).join(' ');
                // Deterministisches Helligkeits-Delta zwischen -0.06 und +0.06 (ID-Hash)
                let h = 0;
                const idStr = String(b.id);
                for (let i = 0; i < idStr.length; i++) h = (h * 31 + idStr.charCodeAt(i)) >>> 0;
                const brightnessShift = ((h % 100) / 100 - 0.5) * 0.12;   // -0.06 … +0.06
                const baseColor = isChurch ? palette.osmBuildingChurch : palette.osmBuildingFill;
                return (
                  <polygon key={b.id} points={pts}
                    fill={baseColor}
                    stroke={palette.osmBuildingStroke}
                    strokeWidth="0.75"
                    strokeLinejoin="round"
                    style={{
                      transition: 'fill 600ms ease, stroke 600ms ease',
                      filter: `brightness(${1 + brightnessShift})`,
                    }} />
                );
              })}
              {/* Pass 2b: Ostkanten-Schatten — dünne dunkle Striche an Süd-/Ostseiten der Polygone */}
              {osmFeatures.buildings.map((b) => {
                const projPts = b.points.map(([la, ln]) => project(la, ln));
                // Sammle Kanten, deren Normale Richtung Südost zeigt (Licht aus NW)
                const segments = [];
                for (let i = 0; i < projPts.length - 1; i++) {
                  const p1 = projPts[i], p2 = projPts[i + 1];
                  const dx = p2.x - p1.x, dy = p2.y - p1.y;
                  // Aussen-Normale (rechts der Kante in Polygon-Reihenfolge)
                  const nx = dy, ny = -dx;
                  // SO ist (+x, +y) → wenn (nx + ny) > 0, ist es Süd-/Ostseite
                  if (nx + ny > 0) {
                    segments.push(`M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} L ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`);
                  }
                }
                if (segments.length === 0) return null;
                return (
                  <path key={`be-${b.id}`} d={segments.join(' ')}
                    fill="none" stroke={palette.buildingEastShadow} strokeWidth="1.2"
                    strokeLinecap="round" strokeLinejoin="round"
                    transform="translate(0.6, 0.6)" opacity="0.85" />
                );
              })}
              {/* Pass 3: building parts — subtle internal subdivision lines (courtyards, sections) */}
              {osmFeatures.buildingParts && osmFeatures.buildingParts.map((bp) => {
                const pts = bp.points.map(([la, ln]) => { const p = project(la, ln); return `${p.x},${p.y}`; }).join(' ');
                return (
                  <polygon key={bp.id} points={pts}
                    fill="none"
                    stroke={palette.osmBuildingPart}
                    strokeWidth="0.5"
                    strokeLinejoin="round" />
                );
              })}
            </g>
          ) : (
            /* Fallback: hand-drawn building blocks */
            <g style={{ pointerEvents: 'none' }}>
              {BLOCKS.map((blk) => {
                const pts = blk.poly.map((p) => { const pp = project(p[0], p[1]); return `${pp.x},${pp.y}`; }).join(' ');
                return (
                  <g key={blk.id}>
                    <polygon points={pts} fill={palette.blockShadow} transform="translate(1.5, 1.5)" opacity="0.6" />
                    <polygon points={pts} fill={palette.blockFill} stroke={palette.blockStroke} strokeWidth="0.6" strokeLinejoin="round" style={{ transition: 'fill 600ms ease, stroke 600ms ease' }} />
                  </g>
                );
              })}
            </g>
          )}

          {/* OSM barriers — walls, fences, hedges */}
          {osmFeatures && osmFeatures.barriers.length > 0 && (
            <g style={{ pointerEvents: 'none' }}>
              {osmFeatures.barriers.map((b) => {
                const pts = b.points.map(([la, ln]) => { const p = project(la, ln); return `${p.x},${p.y}`; }).join(' ');
                const dash = b.kind === 'fence' ? '1.5 1.5' : b.kind === 'hedge' ? '0.8 1.2' : '0';
                return (
                  <polyline key={b.id} points={pts} fill="none"
                    stroke={palette.osmBarrierStroke}
                    strokeWidth={b.kind === 'city_wall' ? 1.5 : 0.7}
                    strokeLinecap="round"
                    strokeDasharray={dash}
                    opacity="0.75" />
                );
              })}
            </g>
          )}

          {/* Plazas — supplementary named squares (subtle when OSM is loaded) */}
          <g style={{ pointerEvents: 'none' }}>
            {PLAZAS.map((pl) => {
              const pts = pl.poly.map((p) => { const pp = project(p[0], p[1]); return `${pp.x},${pp.y}`; }).join(' ');
              const fill = pl.type === 'park' ? palette.plazaPark : palette.plazaPaved;
              const op = osmFeatures && osmFeatures.buildings.length > 0 ? 0.35 : 0.65;
              return (
                <g key={pl.id}>
                  <polygon points={pts} fill={fill} stroke={palette.plazaStroke} strokeWidth="0.5" strokeDasharray={pl.type === 'park' ? '0' : '2 2'} opacity={op} style={{ transition: 'fill 600ms ease, opacity 600ms ease' }} />
                </g>
              );
            })}
          </g>

          {/* Topographic hint — Lindenhof hill contour */}
          <g style={{ pointerEvents: 'none' }} opacity="0.85">
            {(() => {
              const cx = project(47.3724, 8.5408);
              return [40, 28, 18].map((r, i) => (
                <ellipse key={`contour-${i}`} cx={cx.x} cy={cx.y} rx={r * 1.2} ry={r * 0.8} fill="none" stroke={palette.contour} strokeWidth="0.8" strokeDasharray="2 4" />
              ));
            })()}
          </g>

          {/* Tram tracks — parallel dashed lines along main streets */}
          <g style={{ pointerEvents: 'none' }}>
            {TRAM_LINES.map((line, lineIdx) => {
              const pts = line.map((p) => project(p[0], p[1]));
              // Compute parallel offsets perpendicular to local segments
              const offset = 1.6;
              const segs = [];
              for (let i = 0; i < pts.length - 1; i++) {
                const a = pts[i], b = pts[i + 1];
                const dx = b.x - a.x, dy = b.y - a.y;
                const len = Math.hypot(dx, dy) || 1;
                const nx = -dy / len, ny = dx / len;
                segs.push({
                  l1: `${a.x + nx * offset},${a.y + ny * offset} ${b.x + nx * offset},${b.y + ny * offset}`,
                  l2: `${a.x - nx * offset},${a.y - ny * offset} ${b.x - nx * offset},${b.y - ny * offset}`,
                });
              }
              return (
                <g key={`tram-${lineIdx}`}>
                  {segs.map((s, i) => (
                    <g key={`tram-${lineIdx}-${i}`}>
                      <polyline points={s.l1} fill="none" stroke={palette.tramTrack} strokeWidth="0.9" strokeDasharray="2 2" />
                      <polyline points={s.l2} fill="none" stroke={palette.tramTrack} strokeWidth="0.9" strokeDasharray="2 2" />
                    </g>
                  ))}
                </g>
              );
            })}
          </g>

          <g transform={`translate(${VIEWPORT.width - 80}, 70)`} opacity={palette.compassOpacity}>
            <circle r="32" fill="none" stroke={palette.compassStroke} strokeWidth="1" />
            <circle r="22" fill="none" stroke={palette.compassStroke} strokeWidth="0.6" />
            <path d="M 0,-30 L 4,0 L 0,30 L -4,0 Z" fill={palette.compassStroke} opacity="0.6" />
            <path d="M -30,0 L 0,4 L 30,0 L 0,-4 Z" fill={palette.compassStroke} opacity="0.35" />
            <text y="-36" textAnchor="middle" fontSize="11" fontFamily="Fraunces, Georgia, serif" fill={palette.compassStroke} fontWeight="700"
              transform={`rotate(${labelCounterRot} 0 -36)`}>N</text>
          </g>

          {/* OSM streets — backdrop (always visible context, lifted from background with outline+fill) */}
          {osmStreets && osmStreets.length > 0 && (
            <g style={{ pointerEvents: 'none' }}>
              {/* Pass 1: dark outline */}
              {osmStreets.map((way) => {
                if (way.points.length < 2) return null;
                const pts = way.points.map(([la, ln]) => { const p = project(la, ln); return `${p.x},${p.y}`; }).join(' ');
                const w = way.highway === 'primary' || way.highway === 'secondary' ? 5
                  : way.highway === 'tertiary' ? 4
                  : way.isSteps ? 2.2
                  : way.isPedestrian ? 2.8 : 3.2;
                return (
                  <polyline key={`osm-o-${way.id}`} points={pts} fill="none"
                    stroke={palette.osmGhostOutline} strokeWidth={w + 1.4}
                    strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                );
              })}
              {/* Pass 2: warm fill */}
              {osmStreets.map((way) => {
                if (way.points.length < 2) return null;
                const pts = way.points.map(([la, ln]) => { const p = project(la, ln); return `${p.x},${p.y}`; }).join(' ');
                const w = way.highway === 'primary' || way.highway === 'secondary' ? 5
                  : way.highway === 'tertiary' ? 4
                  : way.isSteps ? 2.2
                  : way.isPedestrian ? 2.8 : 3.2;
                const dash = way.isSteps ? '1.5 1.5'
                  : way.isPedestrian ? '4 3'
                  : '0';
                return (
                  <polyline key={`osm-f-${way.id}`} points={pts} fill="none"
                    stroke={palette.osmGhost} strokeWidth={w}
                    strokeLinecap="round" strokeLinejoin="round" opacity="0.95"
                    strokeDasharray={dash} />
                );
              })}
            </g>
          )}

          {/* Core streets locked — faint hint (under clouds) */}
          {SEGMENTS.map((seg) => {
            if (unlocked.has(seg.id)) return null;
            const a = project(seg.a[0], seg.a[1]);
            const b = project(seg.b[0], seg.b[1]);
            return (
              <line key={`g-${seg.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={palette.streetGhostStroke} strokeWidth="3.5" strokeLinecap="round"
                opacity={palette.streetGhostOpacity * 0.7} />
            );
          })}

          {/* Fog-of-War — bold "unmapped territory" layer with paint-textured volume.
              Theme-driven opacity: day 82%, night 88%. */}
          <g mask="url(#fogMask)" style={{ pointerEvents: 'none', opacity: fogOpacity, transition: 'opacity 600ms var(--ease-premium)' }}>
            <rect x={EXTENT.x} y={EXTENT.y} width={EXTENT.w} height={EXTENT.h}
              fill={themeName === 'night' ? 'rgba(5,12,36,1)' : 'rgba(10,31,79,1)'}
              style={{ transition: 'fill 600ms ease' }} />
            <rect x={EXTENT.x} y={EXTENT.y} width={EXTENT.w} height={EXTENT.h}
              fill="url(#fogGrad)" opacity="0.55"
              style={{ transition: 'fill 600ms ease' }} />
            <rect x={EXTENT.x} y={EXTENT.y} width={EXTENT.w} height={EXTENT.h}
              filter="url(#fogTexture)" opacity="0.45" />
          </g>

          {/* Cyan frontier glow — soft halo around the player's active discovery edge.
              Only when in nav mode (i.e., position is known and camera has zoomed in). */}
          {userPos && tp > 0.15 && (
            <g style={{ pointerEvents: 'none', opacity: tp }}>
              <circle cx={userPos.x} cy={userPos.y}
                r={fogRevealRadius + FOG_FRONTIER_GLOW_PX}
                fill="url(#fogFrontier)" />
            </g>
          )}

          {/* Gold first-reveal bursts — transient flashes when a new street unlocks. */}
          {revealBursts.length > 0 && (
            <g style={{ pointerEvents: 'none' }}>
              {revealBursts.map((b) => (
                <circle key={b.id}
                  cx={b.x} cy={b.y}
                  fill="url(#fogBurst)">
                  <animate attributeName="r" from="6" to={fogRevealRadius * 1.6}
                    dur={`${FOG_REVEAL_BURST_MS}ms`} fill="freeze" />
                  <animate attributeName="opacity" from="0.95" to="0"
                    dur={`${FOG_REVEAL_BURST_MS}ms`} fill="freeze" />
                </circle>
              ))}
            </g>
          )}


          {/* Trail */}
          {trailPts.length > 1 && (
            <polyline points={trailPts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={palette.trailStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 5" opacity={palette.trailOpacity} />
          )}

          {/* Trees — small tufts (Lindenhof, Bürkliplatz, quais) */}
          <g style={{ pointerEvents: 'none' }}>
            {TREES.map((t, i) => {
              const p = project(t.c[0], t.c[1]);
              return (
                <g key={`tree-${i}`} transform={`translate(${p.x},${p.y})`}>
                  {/* shadow */}
                  <ellipse cx="0.5" cy="2.5" rx="3.5" ry="1.6" fill={palette.treeShadow} opacity="0.6" />
                  {/* foliage — three small overlapping circles */}
                  <circle cx="-1.5" cy="-0.5" r="2.2" fill={palette.treeColor} opacity="0.85" />
                  <circle cx="1.5" cy="-0.8" r="2.4" fill={palette.treeColor} opacity="0.9" />
                  <circle cx="0" cy="-2" r="2.6" fill={palette.treeColor} opacity="0.95" />
                </g>
              );
            })}
          </g>

          {/* Fountains — Zürich's iconic brunnen */}
          <g style={{ pointerEvents: 'none' }}>
            {FOUNTAINS.map((f) => {
              const p = project(f.coords[0], f.coords[1]);
              return (
                <g key={f.id} transform={`translate(${p.x},${p.y})`}>
                  {/* Octagonal outer ring */}
                  <circle r="3.6" fill="none" stroke={palette.fountainOuter} strokeWidth="0.9" opacity="0.85" />
                  {/* Water */}
                  <circle r="2.4" fill={palette.fountainInner} opacity="0.7" />
                  {/* Center pillar */}
                  <circle r="0.9" fill={palette.fountainOuter} opacity="0.95" />
                </g>
              );
            })}
          </g>

          {/* Anekdoten — kompakte Bookmark-Dots mit Counter-Rotation, Drop-Shadow + weisser Outline */}
          {ANEKDOTEN.map((an) => {
            const p = project(an.coords[0], an.coords[1]);
            const isUnlocked = anekdoten.has(an.id);
            return (
              <g key={an.id} transform={`translate(${p.x},${p.y})`} style={{ cursor: 'pointer' }}>
                <circle r="12" fill="transparent" />
                <g transform={`rotate(${labelCounterRot})`}
                  style={{ transition: 'all 500ms ease-out', filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.28))' }}>
                  {/* Weisser Outline-Ring für Lesbarkeit über bunten Bereichen */}
                  <circle
                    r={isUnlocked ? 4.5 : 3}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.1"
                    opacity={isUnlocked ? 0.92 : 0.7}
                  />
                  <circle
                    r={isUnlocked ? 4 : 2.6}
                    fill={isUnlocked ? palette.anekdoteUnlockedFill : palette.anekdoteLockedFill}
                    stroke={isUnlocked ? palette.anekdoteUnlockedStroke : palette.anekdoteLockedStroke}
                    strokeWidth={isUnlocked ? 1.1 : 0.8}
                    opacity={isUnlocked ? 1 : 0.6}
                  />
                  {isUnlocked && (
                    <text y="1.6" textAnchor="middle" fontSize="5" fontWeight="900"
                      fill={palette.anekdoteIconColor} pointerEvents="none">!</text>
                  )}
                </g>
              </g>
            );
          })}

          {/* Landmarks — kompakter, dezenter, mit Counter-Rotation + weisser Outline */}
          {LANDMARKS.map((lm) => {
            const p = project(lm.coords[0], lm.coords[1]);
            const isUnlocked = stars.has(lm.id);
            const dist = landmarkDistances[lm.id];
            const isNear = dist != null && dist <= NEAR_STAR_HINT_M && !isUnlocked;
            return (
              <g key={lm.id} transform={`translate(${p.x},${p.y})`} style={{ cursor: 'pointer' }}>
                {(isUnlocked || isNear) && (
                  <circle r={isUnlocked ? 17 : 14} fill="url(#starGlow)" opacity="0.65">
                    {isUnlocked && <animate attributeName="r" values="14;20;14" dur="3s" repeatCount="indefinite" />}
                  </circle>
                )}
                <g transform={`rotate(${labelCounterRot})`}
                  style={{ filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.32))', transition: 'opacity 600ms ease-out' }}>
                  {/* Weisser Outline-Ring um den Stern für Lesbarkeit */}
                  <path d={STAR_PATH_SM} fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" opacity="0.85" />
                  <path d={STAR_PATH_SM}
                    fill={isUnlocked ? 'url(#starFill)' : palette.starLockedFill}
                    stroke={isUnlocked ? '#7A4A1F' : palette.starLockedStroke}
                    strokeWidth="0.9"
                    strokeLinejoin="round"
                    opacity={isUnlocked ? 1 : 0.55} />
                </g>
                <circle r="16" fill="transparent" />
                <text y="18" textAnchor="middle" fontSize="9" fontFamily="Fraunces, Georgia, serif" fontWeight="700" fill={palette.text}
                  opacity={isUnlocked ? 0.95 : 0.55}
                  style={{ pointerEvents: 'none', paintOrder: 'stroke', stroke: palette.labelHalo, strokeWidth: 2.5, strokeLinejoin: 'round', letterSpacing: '0.01em' }}
                  transform={`rotate(${labelCounterRot} 0 18)`}>
                  {lm.name}
                </text>
              </g>
            );
          })}

          {/* POIs — Pokemon Go style pins (bars, restaurants, clubs) */}
          {POIS.map((poi, idx) => {
            const p = project(poi.coords[0], poi.coords[1]);
            const isUnlocked = pois.has(poi.id);
            const isOpen = isPoiActive(poi.kind);
            const colors = poi.kind === 'bar'
              ? { bg: palette.poiBarBg, ring: palette.poiBarRing }
              : poi.kind === 'restaurant'
              ? { bg: palette.poiRestaurantBg, ring: palette.poiRestaurantRing }
              : { bg: palette.poiClubBg, ring: palette.poiClubRing };
            // Pin floats above the location with a tail pointing to it
            const pinY = -15; // disc center is 15px above the location (skaliert für engen Zoom)
            // Stagger bob phases so pins don't bob in sync
            const bobDelay = (idx * 0.37) % 2.4;
            return (
              <g key={poi.id} transform={`translate(${p.x},${p.y})`} style={{ cursor: 'pointer' }}>
                {/* Ground shadow */}
                <ellipse cx="0" cy="1.5" rx="4" ry="1.2" fill={palette.poiPinShadow} opacity="0.7">
                  {!isUnlocked && (
                    <animate attributeName="rx" values="4;4.7;4" dur="2.4s" begin={`${bobDelay}s`} repeatCount="indefinite" />
                  )}
                </ellipse>

                {/* Open-now soft glow halo */}
                {isOpen && (
                  <circle cx="0" cy={pinY} r="11" fill={colors.bg} opacity="0.22">
                    <animate attributeName="r" values="9;13;9" dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0.10;0.35" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Pin-Body mit Counter-Rotation, damit aufrecht über der Welt */}
                <g transform={`rotate(${labelCounterRot})`}
                  style={{ filter: isUnlocked ? 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.28))' : 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.2)) grayscale(0.55)', opacity: isUnlocked ? 1 : 0.82, transition: 'filter 600ms ease, opacity 600ms ease' }}>
                  {/* Tail (teardrop) — triangle pointing down */}
                  <path d={`M -3.3,${pinY + 4.5} L 0,-1.5 L 3.3,${pinY + 4.5} Z`} fill={colors.bg} />
                  {/* Weisser Outline-Ring für Lesbarkeit */}
                  <circle cx="0" cy={pinY} r="7.5" fill="#fff" />
                  {/* Inner colored disc */}
                  <circle cx="0" cy={pinY} r="6" fill={colors.bg} />
                  {/* Inner highlight (subtle gradient) */}
                  <circle cx="-1.3" cy={pinY - 1.3} r="2" fill="rgba(255,255,255,0.35)" />

                  {/* Icon */}
                  <PoiIconSvg kind={poi.kind} cx={0} cy={pinY} color={colors.ring} disco={isUnlocked && poi.kind === 'club'} />

                  {/* Bob animation when not visited */}
                  {!isUnlocked && (
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-1.5; 0,0" dur="2.4s" begin={`${bobDelay}s`} repeatCount="indefinite" additive="sum" />
                  )}
                </g>

                {/* Pulse ring when unlocked */}
                {isUnlocked && (
                  <circle cx="0" cy={pinY} r="7" fill="none" stroke={colors.bg} strokeWidth="1" opacity="0.5">
                    <animate attributeName="r" values="7;12;7" dur="2.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Hit area */}
                <circle cx="0" cy={pinY} r="10" fill="transparent" />
              </g>
            );
          })}

          {/* GPS-Genauigkeits-Ring bleibt im SVG (Welt-Distanz-bezogen) */}
          {userPos && accuracy && !simMode && (
            <circle cx={userPos.x} cy={userPos.y}
              r={Math.min(40, ((accuracy / LNG_M) / (BOUNDS.maxLng - BOUNDS.minLng)) * VIEWPORT.width)}
              fill="rgba(200,146,60,0.08)" stroke="rgba(200,146,60,0.25)" strokeWidth="0.8"
              pointerEvents="none" />
          )}

          <rect x={EXTENT.x} y={EXTENT.y} width={EXTENT.w} height={EXTENT.h} fill="url(#vignette)" pointerEvents="none" />
        </svg>

        {/* Player-Marker als HTML-Overlay — bleibt gestochen scharf, weil ausserhalb
            des rotierten SVG-Compositor-Layers. Sitzt fix bei (50%, 65%) — die Karte
            kommt zum Marker (Google-Maps-Stil). Weinrot, doppelte Grösse. */}
        {position && (
          <div className="absolute pointer-events-none"
            style={{ left: '50%', top: '65%', transform: 'translate(-50%, -50%)', zIndex: 5 }}>
            <svg width="72" height="72" viewBox="-36 -36 72 72" style={{ overflow: 'visible', display: 'block' }}>
              {/* Pulse-Ring (Weinrot, semi-transparent, 1.5s alternate) */}
              <circle r="16" fill="#8B1A3A" opacity="0.35">
                <animate attributeName="r" values="14;28;14" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.05;0.5" dur="1.5s" repeatCount="indefinite" />
              </circle>
              {/* Heading-Pfeil (zeigt immer nach oben, weil Karte heading-up rotiert) */}
              <path d="M 0,-22 L 8.4,-11.2 L -8.4,-11.2 Z"
                fill="#8B1A3A"
                stroke="#fff"
                strokeWidth="2.4"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }} />
              {/* Kernpunkt — gefüllter Weinrot-Kreis mit weissem 4px-Rand */}
              <circle r="10" fill="#8B1A3A" stroke="#fff" strokeWidth="4"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
            </svg>
          </div>
        )}

        {/* Mini-Map oben links — Klick öffnet Vollkarten-Overlay. Versteckt sich, wenn ein Modal offen ist.
            Position/Revealed werden auf 500ms throttled gerendert (Mini-Map = React.memo). */}
        <MiniMap palette={palette} revealed={miniRevealed} position={miniPosition} onOpen={() => setShowOverview(true)} hidden={anyModalOpen} />

        {/* Status pill — TIER N · ROOKIE 🐣 + progress + next-tier hint. Tap → tier modal. */}
        <button
          onClick={() => setShowLegend(true)}
          className="absolute px-3.5 py-2.5 rounded-xl backdrop-blur-md text-left tap"
          style={{
            top: 'max(12px, env(safe-area-inset-top))',
            left: 'calc(max(12px, env(safe-area-inset-left)) + 172px)',
            background: palette.cardBg,
            border: `1px solid ${palette.cardBorder}`,
            boxShadow: palette.cardShadow,
            maxWidth: 'calc(100% - max(12px, env(safe-area-inset-left)) - max(12px, env(safe-area-inset-right)) - 184px)',
            transition: 'background 600ms var(--ease-premium), border-color 600ms var(--ease-premium)',
          }}
          aria-label="Tier overview"
        >
          <div style={{
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontWeight: 500,
            fontSize: '10px',
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            opacity: 0.75,
            color: palette.text,
          }}>
            Tier {levelIdx + 1} · <span style={{ color: level.color, fontWeight: 700 }}>{level.name}</span> <span style={{ letterSpacing: 0 }}>{level.emoji}</span>
          </div>
          <div className="mt-1.5 text-[12px]" style={{ ...TYPO.ui, color: palette.text }}>
            {streetsTouched} of {STREETS.length} streets cleared · {pct.toFixed(0)}%
          </div>
          <div className="mt-2">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: palette.name === 'night' ? 'rgba(255,255,255,0.10)' : 'rgba(10,31,79,0.10)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressInBracket}%`, background: 'linear-gradient(90deg, #00E5FF, #6CF1FF)' }} />
            </div>
            {nextLevel ? (
              <div className="flex items-center justify-between mt-1.5" style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.6 }}>
                <span>Next tier</span>
                <span className="flex items-center gap-1">
                  {nextLevel.emoji} {nextLevel.name} · {nextLevel.threshold}%
                </span>
              </div>
            ) : (
              <div className="mt-1.5 italic" style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.6, fontStyle: 'italic' }}>Top tier reached</div>
            )}
          </div>
        </button>

        {/* Stars + stats card top-right */}
        <div
          className="absolute px-3 py-2 rounded-xl backdrop-blur-md"
          style={{
            top: 'max(12px, env(safe-area-inset-top))',
            right: 'max(12px, env(safe-area-inset-right))',
            background: palette.cardBg,
            border: `1px solid ${palette.cardBorder}`,
            boxShadow: palette.cardShadow,
            transition: 'background 600ms var(--ease-premium), border-color 600ms var(--ease-premium)',
          }}
        >
          <div className="flex items-center gap-1.5 justify-end">
            {LANDMARKS.map((lm) => {
              const isUnlocked = stars.has(lm.id);
              return (
                <button key={lm.id} onClick={() => setActiveLandmark(lm)} className="tap" aria-label={lm.name}>
                  <Star size={18} fill={isUnlocked ? '#D4A93C' : 'transparent'} color={isUnlocked ? '#9B7820' : palette.textMuted} strokeWidth={isUnlocked ? 1.5 : 1.8} />
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 text-right" style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.65 }}>
            {stars.size}/{LANDMARKS.length} Landmarks
          </div>
          <div className="flex items-center gap-1 justify-end mt-1 text-[10px] opacity-65">
            <BookOpen size={10} /> {anekdoten.size}/{ANEKDOTEN.length} Anecdotes
          </div>
          <button onClick={() => setShowLokale(true)} className="flex items-center gap-1 justify-end mt-1 text-[10px] opacity-75 tap ml-auto" aria-label="Open hotspots list">
            <Martini size={10} /> {pois.size}/{POIS.length} Hot spots <ArrowUpRight size={9} className="opacity-60" />
          </button>
          <div className="border-t mt-1.5 pt-1.5 space-y-0.5" style={{ borderColor: palette.cardBorder }}>
            <div className="flex items-center gap-1.5 justify-end text-[11px] opacity-70">
              <Clock size={11} /> <span className="tabular-nums">{fmtTime(elapsed)}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end text-[11px] opacity-70">
              <Route size={11} /> <span className="tabular-nums">{fmtDist(distance)}</span>
            </div>
          </div>
        </div>

        {tracking && nextStarHint && nextStarHint.d > STAR_RADIUS_M && nextStarHint.d < 250 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[11px] flex items-center gap-2" style={{ background: 'rgba(212,169,60,0.95)', color: '#0A1F4F', fontWeight: 600, boxShadow: '0 4px 12px rgba(10,31,79,0.18)' }}>
            <ArrowUpRight size={12} />
            <span>{nextStarHint.lm.name} · {Math.round(nextStarHint.d)} m</span>
          </div>
        )}

        {tracking && nearestPoi && nearestPoi.d > POI_RADIUS_M && nearestPoi.d < 90 && (!nextStarHint || nextStarHint.d >= 250) && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[11px] flex items-center gap-2" style={{
            background: nearestPoi.p.kind === 'bar' ? 'rgba(162,55,107,0.95)' : nearestPoi.p.kind === 'restaurant' ? 'rgba(199,106,46,0.95)' : 'rgba(63,74,143,0.95)',
            color: '#F2EEE5', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
          }}>
            <span>{nearestPoi.p.kind === 'bar' ? '🍸' : nearestPoi.p.kind === 'restaurant' ? '🍴' : '💿'}</span>
            <span>{nearestPoi.p.name} · {Math.round(nearestPoi.d)} m</span>
          </div>
        )}

        {osmStatus === 'loading' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1.5 backdrop-blur-md" style={{ background: palette.cardBg, border: `1px solid ${palette.cardBorder}`, color: palette.textMuted, boxShadow: palette.cardShadow }}>
            <Loader2 size={11} className="animate-spin" />
            <span>Loading map…</span>
          </div>
        )}

        {simMode && tracking && !demoRunning && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5" style={{ background: 'rgba(10,31,79,0.85)', color: '#F2EEE5' }}>
            <Wand2 size={11} /> Tap the map to walk
          </div>
        )}

        {tracking && (wakeLockActive || bgActive) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1.5" style={{ background: 'rgba(0,229,255,0.55)', color: '#050C24' }}>
            <Moon size={10} /> {bgActive ? 'Background mode' : 'Screen stays on'}
          </div>
        )}
      </div>

      <div
        className="px-4 py-4 flex flex-col gap-3 border-t"
        style={{
          borderColor: palette.bottomBarBorder,
          background: palette.bottomBarBg,
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
          paddingLeft: 'calc(env(safe-area-inset-left) + 16px)',
          paddingRight: 'calc(env(safe-area-inset-right) + 16px)',
          transition: 'background 600ms var(--ease-premium), border-color 600ms var(--ease-premium)',
        }}
      >
        <button
          onClick={handleStart}
          className="w-full rounded-xl flex items-center justify-center gap-2 tap"
          style={{
            minHeight: '56px',
            background: tracking ? 'linear-gradient(135deg, #A2376B, #6B2348)' : '#00E5FF',
            color: tracking ? '#FFFFFF' : '#050C24',
            boxShadow: tracking
              ? '0 6px 24px rgba(162,55,107,0.35), inset 0 1px 0 rgba(255,255,255,0.18)'
              : '0 6px 24px rgba(0,229,255,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
            fontFamily: TYPO.ui.fontFamily, fontWeight: 700, fontSize: '15px', letterSpacing: '0.02em',
          }}
        >
          {tracking ? <><Pause size={17} /> Pause tracking</> : <><Play size={17} /> Walk with GPS</>}
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setSimMode((v) => !v)} className="flex-1 rounded-lg text-xs flex items-center justify-center gap-2 tap" style={{ minHeight: '44px', background: simMode ? palette.simModeOnBg : palette.simModeOffBg, color: simMode ? '#050C24' : palette.text, fontWeight: 600 }}>
            <Wand2 size={13} /> Demo mode {simMode ? 'on' : 'off'}
          </button>
          <button onClick={demoRunning ? stopDemo : runDemo} className="flex-1 rounded-lg text-xs flex items-center justify-center gap-2 tap" style={{ minHeight: '44px', background: demoRunning ? 'rgba(162,55,107,0.92)' : palette.simModeOffBg, color: demoRunning ? '#FFFFFF' : palette.text, fontWeight: 600 }}>
            <Navigation size={13} /> {demoRunning ? 'Stop demo' : 'Demo tour'}
          </button>
        </div>
        <p className="text-[10px] text-center opacity-55 px-4">
          {accuracy && !simMode ? `GPS accuracy ±${Math.round(accuracy)} m · ` : ''}
          {wakeLockActive && tracking ? 'Screen stays on · ' : ''}
          Add to Home Screen for the full ride.
        </p>
      </div>
    </div>
  );
}

/* ============================================================================
   TOAST + MODALS
============================================================================ */

/* PoiIconSvg — clean inline SVG icons for the POI pins */
function PoiIconSvg({ kind, cx, cy, color, disco }) {
  const c = color || '#F5E9D0';
  if (kind === 'bar') {
    // Cocktailglas — gefüllte Shapes, robust gegen Rasterisierung
    return (
      <g transform={`translate(${cx},${cy})`} pointerEvents="none" shapeRendering="geometricPrecision">
        {/* Bowl als gefülltes Dreieck */}
        <path d="M -3.2,-2.6 L 3.2,-2.6 L 0,1.3 Z" fill={c} />
        {/* Stem als schmales Rechteck */}
        <rect x="-0.45" y="1.3" width="0.9" height="1.7" fill={c} />
        {/* Foot als abgerundetes Rechteck */}
        <rect x="-2" y="2.8" width="4" height="0.7" rx="0.3" fill={c} />
        {/* Olive */}
        <circle cx="0.6" cy="-0.6" r="0.7" fill={c} />
      </g>
    );
  }
  if (kind === 'restaurant') {
    // Gabel + Messer — gefüllte Silhouetten
    return (
      <g transform={`translate(${cx},${cy})`} pointerEvents="none" shapeRendering="geometricPrecision">
        {/* Gabel: drei Zinken + Hals + Stiel als zusammengefügter Path */}
        <path d="M -2.8,-3.2
                 L -2.8,-1.4 L -2.3,-1.4 L -2.3,-3.2 L -2.0,-3.2
                 L -2.0,-1.4 L -1.5,-1.4 L -1.5,-3.2 L -1.2,-3.2
                 L -1.2,-1.4 L -0.7,-1.4 L -0.7,-3.2 L -0.4,-3.2
                 L -0.4,-1.0 L -1.4,-0.3 L -1.4,3.0 L -2.0,3.0 L -2.0,-0.3
                 L -2.8,-1.0 Z" fill={c} />
        {/* Messer: Klinge + Stiel als zusammengefügter Path */}
        <path d="M 1.3,-3.2 L 2.6,-3.2 L 2.6,-0.2 L 2.15,0.6 L 2.15,3.0 L 1.55,3.0 L 1.55,0.6 L 1.3,0.2 Z"
          fill={c} />
      </g>
    );
  }
  if (kind === 'club') {
    // Disco-Kugel — gefüllter Kreis mit hellen Highlight-Strichen, Hängfaden
    return (
      <g transform={`translate(${cx},${cy})`} pointerEvents="none" shapeRendering="geometricPrecision">
        {/* Voller Kreis */}
        <circle r="2.8" fill={c} />
        {/* Highlight-Streifen (cut-outs als helle Linien für Glitzer-Eindruck) */}
        <ellipse cx="0" cy="-1.0" rx="2.4" ry="0.35" fill="rgba(255,255,255,0.4)" />
        <ellipse cx="0" cy="0.6"  rx="2.7" ry="0.35" fill="rgba(255,255,255,0.35)" />
        <ellipse cx="0" cy="1.8"  rx="1.8" ry="0.30" fill="rgba(255,255,255,0.3)" />
        {/* Glanzpunkt oben links */}
        <circle cx="-0.9" cy="-1.4" r="0.55" fill="rgba(255,255,255,0.6)" />
        {/* Hängfaden */}
        <line x1="0" y1="-2.8" x2="0" y2="-4.0" stroke={c} strokeWidth="0.6" strokeLinecap="round" />
        {/* Funkeln, wenn aktiv */}
        {disco && (
          <g>
            <circle cx="-1.2" cy="-0.3" r="0.45" fill="#fff">
              <animate attributeName="opacity" values="1;0;1" dur="1.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="1.3" cy="0.9" r="0.35" fill="#fff">
              <animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </g>
    );
  }
  return null;
}

function ToastView({ toast }) {
  const isStar = toast.type === 'star';
  const isAch = toast.type === 'achievement';
  const isAnek = toast.type === 'anekdote';
  const isPoi = toast.type === 'poi';
  const isErr = toast.type === 'error';
  const isLock = toast.type === 'lock';
  const isTier = toast.type === 'tier';
  const poiKind = isPoi ? toast.kind : null;
  const bg = isErr ? 'rgba(162,55,55,0.95)'
    : isLock ? 'linear-gradient(135deg, #0A1F4F, #050C24)'
    : isTier ? 'linear-gradient(135deg, #D4A93C, #9B7820)'
    : isStar ? 'linear-gradient(135deg, #D4A93C, #9B7820)'
    : isAch ? 'linear-gradient(135deg, #7A4A8C, #4A2360)'
    : isAnek ? 'linear-gradient(135deg, #7A4A8C, #3F2D55)'
    : poiKind === 'bar' ? 'linear-gradient(135deg, #A2376B, #4A2541)'
    : poiKind === 'restaurant' ? 'linear-gradient(135deg, #C76A2E, #6B3318)'
    : poiKind === 'club' ? 'linear-gradient(135deg, #3F4A8F, #1F274F)'
    : 'rgba(10,31,79,0.95)';
  const Icon = isLock ? Lock
    : isTier ? Crown
    : isStar ? Star
    : isAch ? Trophy
    : isAnek ? BookOpen
    : poiKind === 'bar' ? Martini
    : poiKind === 'restaurant' ? UtensilsCrossed
    : poiKind === 'club' ? Disc3
    : Sparkles;
  const label = isLock ? toast.sub
    : isTier ? toast.sub
    : isStar ? '★ Landmark unlocked'
    : isAch ? 'Achievement unlocked'
    : isAnek ? 'Anecdote discovered'
    : poiKind === 'bar' ? '🍸 Bar checked in'
    : poiKind === 'restaurant' ? '🍴 Restaurant checked in'
    : poiKind === 'club' ? '💿 Club checked in'
    : toast.sub;
  return (
    <div
      key={toast.ts}
      className="fixed left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl flex items-center gap-2.5 animate-toast"
      style={{
        top: 'calc(env(safe-area-inset-top) + 120px)',
        background: bg,
        color: '#FFFFFF',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        maxWidth: '90%',
        zIndex: 30,
      }}
    >
      <Icon size={16} fill={isStar ? '#F2D88A' : 'none'} />
      <div className="min-w-0">
        <div className="text-sm leading-tight truncate" style={{ ...TYPO.ui, fontWeight: 700 }}>
          {toast.title}
        </div>
        <div style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.85 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function LegendModal({ onClose, pct, levelIdx }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(5,12,36,0.65)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
        style={{
          background: 'rgba(255,255,255,0.96)',
          color: '#0A1F4F',
          boxShadow: '0 24px 60px rgba(5,12,36,0.55)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 style={{ ...TYPO.display, fontWeight: 700, fontSize: '22px' }}>Tiers &amp; how it works</h2>
            <p style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.55, marginTop: 2 }}>8 tiers from Rookie to Legend</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center tap" style={{ background: 'rgba(10,31,79,0.08)' }}><X size={16} /></button>
        </div>

        <p className="text-sm opacity-80 leading-relaxed mb-4">
          Walk the streets. Each one clears the fog. Stars mark landmarks. Small dots hide stories. Pins are bars, restaurants and clubs worth your night.
        </p>

        <h3 className="mt-4 mb-2 flex items-center gap-1.5" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.65 }}>
          <Star size={11} fill="#D4A93C" stroke="none" /> Landmarks
        </h3>
        <p className="text-[12px] opacity-75 leading-relaxed mb-3">
          {LANDMARKS.length} landmarks per chapter, drawn as star outlines so you can spot them in the fog. Get within 32 m to unlock.
        </p>

        <h3 className="mt-4 mb-2 flex items-center gap-1.5" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.65 }}>
          <BookOpen size={11} /> Anecdotes
        </h3>
        <p className="text-[12px] opacity-75 leading-relaxed mb-3">
          {ANEKDOTEN.length} hidden stories — Lenin&apos;s flat, the Cabaret Voltaire, Roman ruins. Walk past, the story unlocks.
        </p>

        <h3 className="mt-4 mb-2 flex items-center gap-1.5" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.65 }}>
          <Martini size={11} /> Hot spots (bars · restaurants · clubs)
        </h3>
        <p className="text-[12px] opacity-75 leading-relaxed mb-3">
          {POIS.length} curated addresses — the best bars (🍸), serious restaurants (🍴) and clubs (💿). Floating pins on the map. Within 28 m to check in.
        </p>

        <h3 className="mt-4 mb-2" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.65 }}>Tiers</h3>
        <div className="space-y-1.5">
          {LEVELS.map((lv, i) => {
            const reached = pct >= lv.threshold;
            const isCurrent = i === levelIdx;
            const isNext = i === levelIdx + 1;
            return (
              <div
                key={lv.name}
                className="flex items-center gap-3 p-2.5 rounded-lg"
                style={{
                  background: isCurrent
                    ? 'rgba(0,229,255,0.15)'
                    : isNext
                      ? 'rgba(212,169,60,0.10)'
                      : 'transparent',
                  border: isCurrent ? '1px solid rgba(0,229,255,0.4)' : '1px solid transparent',
                  opacity: reached ? 1 : 0.55,
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: lv.color, fontSize: '18px' }}>
                  <span>{lv.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ ...TYPO.ui, fontWeight: 700, fontSize: '14px', color: lv.color }}>{lv.name}</span>
                    <span style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.6 }}>Tier {i + 1} · {lv.threshold}%+</span>
                    {isNext && <span style={{ ...TYPO.caps, fontSize: '9px', color: '#D4A93C' }}>Next goal</span>}
                  </div>
                  <div className="text-[11px] opacity-70 leading-tight">{lv.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="mt-5 mb-2" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.65 }}>Background mode</h3>
        <p className="text-[12px] opacity-75 leading-relaxed">
          While tracking, the screen stays on and progress auto-saves. True background tracking (app fully closed) ships with the native build.
        </p>
      </div>
    </div>
  );
}

function AchievementsModal({ onClose, earned, pct, stars, anekdoten, pois, distance, elapsed }) {
  const total = ACHIEVEMENTS.length;
  const poisSize = pois ? pois.size : 0;
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(5,12,36,0.65)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-5 max-h-[88vh] overflow-y-auto"
        style={{
          background: 'rgba(255,255,255,0.96)',
          color: '#0A1F4F',
          boxShadow: '0 24px 60px rgba(5,12,36,0.55)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <LaurelWreath size={48} monogram="" glow />
            <div>
              <h2 style={{ ...TYPO.display, fontWeight: 700, fontSize: '22px' }}>Achievements</h2>
              <p style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.55, marginTop: 2 }}>{earned.size} of {total} earned</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center tap" style={{ background: 'rgba(10,31,79,0.08)' }}><X size={16} /></button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Cleared', value: `${pct.toFixed(1)}%`, icon: Compass },
            { label: 'Landmarks', value: `${stars.size}/${LANDMARKS.length}`, icon: Star },
            { label: 'Anecdotes', value: `${anekdoten.size}/${ANEKDOTEN.length}`, icon: BookOpen },
            { label: 'Hot spots', value: `${poisSize}/${POIS.length}`, icon: Martini },
            { label: 'Distance', value: fmtDist(distance), icon: Route },
            { label: 'Time', value: fmtTime(elapsed), icon: Clock },
          ].map((stat) => {
            const I = stat.icon;
            return (
              <div key={stat.label} className="p-2.5 rounded-lg" style={{ background: 'rgba(10,31,79,0.06)' }}>
                <div className="flex items-center gap-1.5" style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.6 }}>
                  <I size={10} /> {stat.label}
                </div>
                <div className="mt-1 text-base tabular-nums" style={{ ...TYPO.ui, fontWeight: 700 }}>
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-4">
          <div className="mb-1" style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.6 }}>Badge progress</div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(10,31,79,0.10)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(earned.size / total) * 100}%`, background: 'linear-gradient(90deg, #00E5FF, #D4A93C)' }} />
          </div>
        </div>

        <h3 className="mb-2" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.65 }}>Badges</h3>
        {earned.size === 0 && (
          <p className="mb-3 text-[13px] opacity-75" style={{ ...TYPO.displayItalic }}>
            No legends yet. Walk the walk.
          </p>
        )}
        <div className="space-y-2">
          {ACHIEVEMENTS.map((a) => {
            const isEarned = earned.has(a.id);
            const Icon = a.icon;
            return (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: isEarned ? 'rgba(212,169,60,0.10)' : 'rgba(10,31,79,0.04)', opacity: isEarned ? 1 : 0.6 }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative" style={{ background: isEarned ? a.color : 'rgba(10,31,79,0.12)' }}>
                  {isEarned ? <Icon size={16} color="#fff" strokeWidth={2.2} /> : <Lock size={14} color="rgba(10,31,79,0.45)" />}
                  {isEarned && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#00E5FF' }}>
                      <CheckCircle2 size={10} color="#050C24" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ ...TYPO.ui, fontWeight: 700, fontSize: '14px', color: isEarned ? a.color : '#0A1F4F' }}>
                    {a.name}
                  </div>
                  <div className="text-[11px] opacity-70 leading-tight">{a.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function JournalModal({ entries, onClose }) {
  const fmtRelative = (ts) => {
    const diff = Date.now() - ts;
    const s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} h ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'yesterday';
    if (d < 7) return `${d} d ago`;
    return new Date(ts).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };
  const groupOf = (ts) => {
    const d = new Date(ts);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 86400000);
    const dDay = new Date(d); dDay.setHours(0, 0, 0, 0);
    if (dDay.getTime() === today.getTime()) return 'Today';
    if (dDay.getTime() === yesterday.getTime()) return 'Yesterday';
    return 'Earlier';
  };

  const grouped = useMemo(() => {
    const out = { Today: [], Yesterday: [], Earlier: [] };
    entries.forEach((e) => out[groupOf(e.ts)].push(e));
    return out;
  }, [entries]);

  const iconFor = (type) => {
    const map = { street: MapPin, star: Star, anekdote: BookOpen, achievement: Award, level: Crown, chapter: Crown };
    return map[type] || Footprints;
  };
  const colorFor = (type) => {
    const map = { street: '#3C66D6', star: '#D4A93C', anekdote: '#7A4A8C', achievement: '#00B5C9', level: '#C76A2E', chapter: '#D4A93C' };
    return map[type] || '#0A1F4F';
  };
  const labelFor = (type) => {
    const map = { street: 'Street', star: 'Landmark', anekdote: 'Anecdote', achievement: 'Achievement', level: 'New tier', chapter: 'Chapter' };
    return map[type] || '';
  };

  const total = entries.length;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(5,12,36,0.65)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden max-h-[88vh] flex flex-col"
        style={{
          background: 'rgba(255,255,255,0.96)',
          color: '#0A1F4F',
          boxShadow: '0 24px 60px rgba(5,12,36,0.55)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 flex items-start justify-between" style={{ background: 'linear-gradient(135deg, #0A1F4F, #050C24)', color: '#F2EEE5' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.20)' }}>
              <NotebookPen size={20} color="#00E5FF" />
            </div>
            <div>
              <h2 style={{ ...TYPO.display, fontWeight: 700, fontSize: '22px' }}>Discoveries</h2>
              <p className="text-[11px] opacity-80 mt-0.5">{total} {total === 1 ? 'entry' : 'entries'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center tap" style={{ background: 'rgba(0,0,0,0.25)' }}><X size={16} /></button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex-1">
          {total === 0 ? (
            <div className="text-center py-10">
              <Feather size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm opacity-65 leading-relaxed" style={{ ...TYPO.displayItalic }}>
                No discoveries yet.<br />
                Start walking. The log writes itself.
              </p>
            </div>
          ) : (
            ['Today', 'Yesterday', 'Earlier'].map((group) => {
              const items = grouped[group];
              if (!items || items.length === 0) return null;
              return (
                <div key={group} className="mb-4 last:mb-0">
                  <h3 className="mb-2 sticky top-0 py-1" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.6, background: 'rgba(255,255,255,0.95)' }}>
                    {group}
                  </h3>
                  <div className="space-y-1.5">
                    {items.map((entry) => {
                      const Icon = iconFor(entry.type);
                      const color = colorFor(entry.type);
                      return (
                        <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: 'rgba(10,31,79,0.04)' }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: color }}>
                            <Icon size={14} color="#fff" strokeWidth={2.2} fill={entry.type === 'star' ? '#F2D88A' : 'none'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <div className="text-[13px] truncate" style={{ ...TYPO.ui, fontWeight: 700, color }}>
                                {entry.name}
                              </div>
                              <div className="text-[10px] opacity-60 shrink-0 tabular-nums">{fmtRelative(entry.ts)}</div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] opacity-65 mt-0.5">
                              <span style={{ ...TYPO.caps, fontSize: '9px' }}>{labelFor(entry.type)}</span>
                              {entry.sub && <><span>·</span><span className="truncate">{entry.sub}</span></>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ palette, themeName, settings, setSettings, onReset, onClose }) {
  const vibrateSupported = supportsVibrate();
  const Toggle = ({ on, onChange, label, desc, icon: I, disabled }) => (
    <button
      onClick={disabled ? undefined : onChange}
      disabled={disabled}
      className="w-full flex items-center gap-3 p-3 rounded-lg text-left tap"
      style={{ background: 'rgba(10,31,79,0.05)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: on ? '#00E5FF' : 'rgba(10,31,79,0.12)' }}>
        <I size={16} color={on ? '#050C24' : 'rgba(10,31,79,0.6)'} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px]" style={{ ...TYPO.ui, fontWeight: 700 }}>{label}</div>
        <div className="text-[11px] opacity-65 leading-tight">{desc}</div>
      </div>
      <div className="w-10 h-6 rounded-full relative shrink-0" style={{ background: on ? '#00E5FF' : 'rgba(10,31,79,0.18)', transition: 'background 200ms var(--ease-premium)' }}>
        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white" style={{ left: on ? '20px' : '2px', transition: 'left 200ms var(--ease-premium)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
    </button>
  );

  const themeOptions = [
    { id: 'auto',  label: 'Auto',  desc: 'Dark at night, light by day' },
    { id: 'day',   label: 'Day',   desc: 'Warm paper, full light' },
    { id: 'night', label: 'Night', desc: 'Indigo, starfield, glow' },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(5,12,36,0.65)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-5 max-h-[88vh] overflow-y-auto"
        style={{
          background: 'rgba(255,255,255,0.96)',
          color: '#0A1F4F',
          boxShadow: '0 24px 60px rgba(5,12,36,0.55)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 style={{ ...TYPO.display, fontWeight: 700, fontSize: '22px' }}>Settings</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center tap" style={{ background: 'rgba(10,31,79,0.08)' }}><X size={16} /></button>
        </div>

        <h3 className="mb-2 flex items-center gap-1.5" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.6 }}>
          Appearance
          {settings.themeMode === 'auto' && (
            <span className="px-1.5 py-0.5 rounded-full" style={{ ...TYPO.caps, fontSize: '8px', opacity: 0.85, background: 'rgba(10,31,79,0.08)' }}>
              now: {themeName === 'night' ? 'Night' : 'Day'}
            </span>
          )}
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {themeOptions.map((opt) => {
            const isActive = settings.themeMode === opt.id;
            const Icon = opt.id === 'day' ? Sun : opt.id === 'night' ? Moon : null;
            const isNight = opt.id === 'night';
            const isDay = opt.id === 'day';
            return (
              <button
                key={opt.id}
                onClick={() => setSettings((s) => ({ ...s, themeMode: opt.id }))}
                className="relative p-3 rounded-xl text-left tap overflow-hidden"
                style={{
                  background: isActive
                    ? (isNight ? 'linear-gradient(135deg, #0A1F4F, #050C24)' : isDay ? 'linear-gradient(135deg, #F5F3EE, #D4A93C)' : 'linear-gradient(135deg, #00E5FF, #0A1F4F)')
                    : 'rgba(10,31,79,0.05)',
                  color: isActive ? (isDay ? '#0A1F4F' : '#FFFFFF') : '#0A1F4F',
                  boxShadow: isActive ? '0 6px 18px rgba(10,31,79,0.25)' : 'none',
                  border: isActive ? 'none' : '1px solid rgba(10,31,79,0.1)',
                }}
              >
                {isNight && isActive && (
                  <div className="absolute top-1 right-1 opacity-70">
                    <svg width="20" height="20"><circle cx="6" cy="6" r="0.8" fill="#F2EEE5" /><circle cx="14" cy="9" r="0.6" fill="#F2EEE5" /><circle cx="10" cy="14" r="0.7" fill="#F2EEE5" /></svg>
                  </div>
                )}
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1.5" style={{ background: isActive ? 'rgba(255,255,255,0.22)' : 'rgba(10,31,79,0.08)' }}>
                  {opt.id === 'auto' ? (
                    <div className="text-[14px]" style={{ ...TYPO.display, fontWeight: 700 }}>A</div>
                  ) : Icon ? (
                    <Icon size={15} color={isActive ? (isDay ? '#0A1F4F' : '#FFFFFF') : '#0A1F4F'} />
                  ) : null}
                </div>
                <div className="text-[12px] leading-tight" style={{ ...TYPO.ui, fontWeight: 700 }}>
                  {opt.label}
                </div>
                <div className="text-[9px] opacity-80 leading-tight mt-0.5">{opt.desc}</div>
              </button>
            );
          })}
        </div>

        <h3 className="mb-2" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.6 }}>Senses</h3>
        <div className="space-y-2 mb-5">
          <Toggle
            on={settings.soundOn}
            onChange={() => {
              if (!settings.soundOn) { getAudioCtx(); SFX.street(); }
              setSettings((s) => ({ ...s, soundOn: !s.soundOn }));
            }}
            label="Sound"
            desc="Soft chime on every discovery"
            icon={settings.soundOn ? Volume2 : VolumeX}
          />
          <Toggle
            on={settings.hapticsOn && vibrateSupported}
            onChange={() => setSettings((s) => ({ ...s, hapticsOn: !s.hapticsOn }))}
            label="Haptics"
            desc={vibrateSupported ? 'Phone vibration cues' : 'Not supported on this device'}
            icon={Vibrate}
            disabled={!vibrateSupported}
          />
        </div>

        <h3 className="mb-2" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.6 }}>How it works</h3>
        <div className="p-3 rounded-lg mb-5" style={{ background: 'rgba(10,31,79,0.05)' }}>
          <div className="text-[12px] leading-relaxed opacity-85">
            <p className="mb-2">
              <strong>Stars</strong> mark landmarks — get within 32 m.
            </p>
            <p className="mb-2">
              <strong>Anecdotes</strong> are hidden stories — get within 28 m.
            </p>
            <p>
              <strong>Streets</strong> clear at 22 m proximity.
            </p>
          </div>
        </div>

        <h3 className="mb-2" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.6 }}>About</h3>
        <p className="text-[11px] opacity-65 leading-relaxed mb-5 px-1">
          Euro-Legend · Chapter I (Zürich · Old Town)<br />
          Walk the cities. Earn the legends.
        </p>

        <h3 className="mb-2" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.6 }}>Data</h3>
        <button
          onClick={onReset}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-left tap"
          style={{ background: 'rgba(162,55,107,0.10)', border: '1px solid rgba(162,55,107,0.25)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#A2376B' }}>
            <RefreshCw size={16} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px]" style={{ ...TYPO.ui, fontWeight: 700, color: '#A2376B' }}>
              Reset progress
            </div>
            <div className="text-[11px] opacity-65 leading-tight">Streets, stars and stamps return to zero</div>
          </div>
        </button>
      </div>
    </div>
  );
}

function LandmarkModal({ lm, unlocked, dist, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(5,12,36,0.65)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-popIn"
        style={{
          background: 'rgba(255,255,255,0.97)',
          color: '#0A1F4F',
          boxShadow: '0 24px 60px rgba(5,12,36,0.55)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-5 relative" style={{ background: unlocked ? 'linear-gradient(135deg, #D4A93C, #9B7820)' : 'linear-gradient(135deg, #0A1F4F, #050C24)', color: '#FFFFFF' }}>
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center tap" style={{ background: 'rgba(0,0,0,0.25)' }}><X size={16} /></button>
          <div className="flex items-center gap-3">
            {unlocked ? (
              <LaurelWreath size={56} monogram="" glow />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,169,60,0.20)' }}>
                <Lock size={20} color="#D4A93C" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.85 }}>{unlocked ? 'Landmark unlocked' : 'Not yet discovered'}</div>
              <h2 className="leading-tight" style={{ ...TYPO.display, fontWeight: 700, fontSize: '22px' }}>
                {lm.name}
              </h2>
              <div className="text-xs opacity-85 mt-0.5">{lm.intro}</div>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed">{lm.desc}</p>
          {lm.insider && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(212,169,60,0.12)', border: '1px solid rgba(212,169,60,0.30)' }}>
              <div className="mb-0.5 flex items-center gap-1" style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.7 }}>
                <Sparkles size={10} /> Insider tip
              </div>
              <div className="text-[12px] leading-relaxed">{lm.insider}</div>
            </div>
          )}
          {!unlocked && dist != null && (
            <div className="mt-3 text-[12px] opacity-75 flex items-center gap-1.5">
              <Navigation size={12} /> ~{Math.round(dist)} m away · get within 32 m to claim the star.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnekdoteModal({ an, unlocked, dist, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(5,12,36,0.65)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-popIn"
        style={{
          background: 'rgba(255,255,255,0.97)',
          color: '#0A1F4F',
          boxShadow: '0 24px 60px rgba(5,12,36,0.55)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 relative" style={{ background: unlocked ? 'linear-gradient(135deg, #7A4A8C, #3F2D55)' : 'linear-gradient(135deg, #0A1F4F, #050C24)', color: '#FFFFFF' }}>
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center tap" style={{ background: 'rgba(0,0,0,0.25)' }}><X size={16} /></button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: unlocked ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.10)' }}>
              {unlocked ? <BookOpen size={22} color="#FFFFFF" strokeWidth={2} /> : <Lock size={18} color="#FFFFFF" />}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.85 }}>{unlocked ? 'Anecdote' : 'Not yet discovered'}</div>
              <h2 className="leading-tight" style={{ ...TYPO.display, fontWeight: 700, fontSize: '20px' }}>
                {an.name}
              </h2>
              <div className="text-xs opacity-85 mt-0.5">{an.intro}</div>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          {unlocked ? (
            <p className="text-sm leading-relaxed" style={{ ...TYPO.displayItalic, fontSize: '15px' }}>
              {an.desc}
            </p>
          ) : (
            <p className="text-sm leading-relaxed opacity-70">
              The story unlocks the moment you stand there yourself.
            </p>
          )}
          {!unlocked && dist != null && (
            <div className="mt-3 text-[12px] opacity-75 flex items-center gap-1.5">
              <Navigation size={12} /> ~{Math.round(dist)} m away · get within 28 m.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PoiModal({ poi, unlocked, dist, onClose }) {
  const kindLabel = poi.kind === 'bar' ? 'Bar' : poi.kind === 'restaurant' ? 'Restaurant' : 'Club';
  const Icon = poi.kind === 'bar' ? Martini : poi.kind === 'restaurant' ? UtensilsCrossed : Disc3;
  const headerBg = unlocked
    ? (poi.kind === 'bar' ? 'linear-gradient(135deg, #A2376B, #4A2541)'
        : poi.kind === 'restaurant' ? 'linear-gradient(135deg, #C76A2E, #6B3318)'
        : 'linear-gradient(135deg, #3F4A8F, #1F274F)')
    : 'linear-gradient(135deg, #0A1F4F, #050C24)';
  const accentEmoji = poi.kind === 'bar' ? '🍸' : poi.kind === 'restaurant' ? '🍴' : '💿';
  const h = new Date().getHours();
  const isOpen = poi.kind === 'bar' ? (h >= 17 || h < 2)
    : poi.kind === 'restaurant' ? ((h >= 11 && h < 14) || (h >= 18 && h < 23))
    : (h >= 22 || h < 4);
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(5,12,36,0.65)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-popIn"
        style={{
          background: 'rgba(255,255,255,0.97)',
          color: '#0A1F4F',
          boxShadow: '0 24px 60px rgba(5,12,36,0.55)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 relative" style={{ background: headerBg, color: '#FFFFFF' }}>
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center tap" style={{ background: 'rgba(0,0,0,0.25)' }}><X size={16} /></button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: unlocked ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.10)' }}>
              {unlocked ? <Icon size={22} color="#FFFFFF" strokeWidth={2} /> : <Lock size={18} color="#FFFFFF" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <div style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.85 }}>{accentEmoji} {unlocked ? `${kindLabel} · checked in` : kindLabel}</div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ ...TYPO.caps, fontSize: '8px', background: isOpen ? 'rgba(0,229,255,0.30)' : 'rgba(0,0,0,0.30)', color: '#FFFFFF' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: isOpen ? '#00E5FF' : 'rgba(255,255,255,0.5)' }} />
                  {isOpen ? 'open' : 'closed'}
                </div>
              </div>
              <h2 className="leading-tight" style={{ ...TYPO.display, fontWeight: 700, fontSize: '20px' }}>
                {poi.name}
              </h2>
              <div className="text-xs opacity-85 mt-0.5">{poi.intro}</div>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          {unlocked ? (
            <p className="text-sm leading-relaxed">
              {poi.desc}
            </p>
          ) : (
            <p className="text-sm leading-relaxed opacity-70">
              Walk past the door. The full write-up unlocks within 28 m.
            </p>
          )}
          {!unlocked && dist != null && (
            <div className="mt-3 text-[12px] opacity-75 flex items-center gap-1.5">
              <Navigation size={12} /> ~{Math.round(dist)} m away
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LokaleListModal({ pois, position, onClose, onSelect }) {
  const [filter, setFilter] = useState('all'); // all | bar | restaurant | club | visited
  const enriched = POIS.map((p) => ({
    ...p,
    visited: pois.has(p.id),
    dist: position ? distanceM(position, p.coords) : null,
  }));
  const filtered = enriched.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'visited') return p.visited;
    return p.kind === filter;
  });
  // Sort: visited first by name, then unvisited by distance (if available) or name
  filtered.sort((a, b) => {
    if (a.visited !== b.visited) return a.visited ? -1 : 1;
    if (a.dist != null && b.dist != null) return a.dist - b.dist;
    return a.name.localeCompare(b.name);
  });

  const visitedCount = enriched.filter((p) => p.visited).length;
  const barCount = enriched.filter((p) => p.kind === 'bar').length;
  const restCount = enriched.filter((p) => p.kind === 'restaurant').length;
  const clubCount = enriched.filter((p) => p.kind === 'club').length;

  const filters = [
    { id: 'all', label: 'All', count: POIS.length },
    { id: 'bar', label: 'Bars', count: barCount, icon: Martini },
    { id: 'restaurant', label: 'Restaurants', count: restCount, icon: UtensilsCrossed },
    { id: 'club', label: 'Clubs', count: clubCount, icon: Disc3 },
    { id: 'visited', label: 'Visited', count: visitedCount, icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(5,12,36,0.65)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl max-h-[88vh] overflow-hidden flex flex-col"
        style={{
          background: 'rgba(255,255,255,0.97)',
          color: '#0A1F4F',
          boxShadow: '0 24px 60px rgba(5,12,36,0.55)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3 border-b" style={{ borderColor: 'rgba(10,31,79,0.10)' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 style={{ ...TYPO.display, fontWeight: 700, fontSize: '22px' }}>Hot spots</h2>
              <p style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.6, marginTop: 2 }}>{visitedCount} of {POIS.length} checked in</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center tap" style={{ background: 'rgba(10,31,79,0.08)' }}><X size={16} /></button>
          </div>
          {/* Filter chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
            {filters.map((f) => {
              const isActive = filter === f.id;
              const Icon = f.icon;
              return (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-[12px] flex items-center gap-1.5 tap"
                  style={{
                    background: isActive ? '#0A1F4F' : 'rgba(10,31,79,0.08)',
                    color: isActive ? '#FFFFFF' : '#0A1F4F',
                    fontWeight: isActive ? 700 : 500,
                  }}>
                  {Icon && <Icon size={11} />}
                  <span>{f.label}</span>
                  <span className="opacity-60 text-[10px]">{f.count}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 opacity-60 text-sm">
              Nothing in this category yet.
            </div>
          ) : filtered.map((p) => {
            const Icon = p.kind === 'bar' ? Martini : p.kind === 'restaurant' ? UtensilsCrossed : Disc3;
            const accent = p.kind === 'bar' ? '#A2376B' : p.kind === 'restaurant' ? '#C76A2E' : '#3F4A8F';
            const h = new Date().getHours();
            const isOpen = p.kind === 'bar' ? (h >= 17 || h < 2)
              : p.kind === 'restaurant' ? ((h >= 11 && h < 14) || (h >= 18 && h < 23))
              : (h >= 22 || h < 4);
            return (
              <button
                key={p.id}
                onClick={() => { onSelect(p); onClose(); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg tap text-left"
                style={{ background: p.visited ? 'rgba(0,229,255,0.08)' : 'transparent' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative" style={{ background: p.visited ? accent : 'rgba(10,31,79,0.10)' }}>
                  {p.visited ? <Icon size={16} color="#FFFFFF" /> : <Icon size={15} color="rgba(10,31,79,0.5)" />}
                  {p.visited && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#00E5FF' }}>
                      <CheckCircle2 size={9} color="#050C24" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="text-sm font-semibold truncate" style={{ ...TYPO.ui, fontWeight: 700, color: p.visited ? '#0A1F4F' : 'rgba(10,31,79,0.7)' }}>
                      {p.name}
                    </div>
                    {isOpen && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#00E5FF' }} title="open now" />}
                  </div>
                  <div className="text-[11px] opacity-65 truncate">{p.intro}</div>
                </div>
                <div className="text-right shrink-0">
                  <div style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.65, color: accent }}>
                    {p.kind === 'bar' ? 'Bar' : p.kind === 'restaurant' ? 'Restaurant' : 'Club'}
                  </div>
                  {p.dist != null && (
                    <div className="text-[11px] opacity-70 tabular-nums mt-0.5">
                      {p.dist < 1000 ? `${Math.round(p.dist)} m` : `${(p.dist / 1000).toFixed(1)} km`}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LevelUpModal({ level, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(5,12,36,0.75)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div
        className="text-center px-6 py-8 rounded-3xl max-w-sm relative overflow-hidden animate-popIn"
        style={{
          background: 'linear-gradient(135deg, #0A1F4F 0%, #050C24 100%)',
          color: '#FFFFFF',
          boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 0 2px ${level.color}, 0 0 80px ${level.color}40`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <LaurelWreath size={100} monogram="" glow />
        <div className="mt-4" style={{ ...TYPO.caps, fontSize: '10px', opacity: 0.55 }}>New tier reached</div>
        <div className="text-5xl mt-2">{level.emoji}</div>
        <h2 className="mt-2" style={{ ...TYPO.display, fontWeight: 900, fontSize: '36px', color: level.color, lineHeight: 1 }}>
          You&apos;re now a {level.name}.
        </h2>
        <p className="mt-3" style={{ ...TYPO.displayItalic, fontSize: '15px', opacity: 0.85 }}>
          Walk the walk.
        </p>
        <p className="mt-2 text-sm opacity-70 leading-snug">{level.desc}</p>
        <button
          onClick={onClose}
          className="mt-6 px-7 py-3 rounded-xl tap"
          style={{
            background: '#00E5FF', color: '#050C24',
            ...TYPO.ui, fontWeight: 700, fontSize: '14px',
            boxShadow: '0 6px 20px rgba(0,229,255,0.35)',
            minHeight: '48px',
          }}
        >
          Keep going
        </button>
      </div>
    </div>
  );
}

function ChapterCompleteModal({ stars, anekdoten, pois, elapsed, distance, onClose, onBack }) {
  const poisVal = pois != null ? pois : 0;
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(5,12,36,0.82)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 28 }).map((_, i) => {
          const colors = ['#D4A93C', '#F2D88A', '#00E5FF', '#FFFFFF'];
          return (
            <div key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-30px',
                width: '8px',
                height: '14px',
                background: colors[i % colors.length],
                borderRadius: '2px',
                animation: `confetti ${3 + Math.random() * 2}s linear ${Math.random() * 1.5}s infinite`,
              }}
            />
          );
        })}
      </div>

      <div
        className="relative max-w-md w-full text-center px-6 py-8 rounded-3xl animate-popIn"
        style={{
          background: 'linear-gradient(135deg, #0A1F4F 0%, #050C24 100%)',
          color: '#FFFFFF',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 2px #D4A93C, 0 0 100px rgba(212,169,60,0.35)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <LaurelWreath size={120} monogram="EL" glow />
        <p className="mt-3" style={{ ...TYPO.caps, fontSize: '11px', opacity: 0.7, color: '#D4A93C' }}>Chapter I complete</p>
        <h2 style={{ ...TYPO.display, fontWeight: 900, fontSize: '36px', color: '#FFFFFF', lineHeight: 1 }} className="mt-1">
          Chapter cleared.
        </h2>
        <p className="mt-3 leading-relaxed opacity-90 px-2" style={{ ...TYPO.displayItalic, fontSize: '17px' }}>
          Eurolegends aren&apos;t born.<br />They are made.
        </p>
        <div className="grid grid-cols-3 gap-2 mt-5 mb-5">
          <Stat icon={Star} value={`${stars}/${LANDMARKS.length}`} label="Landmarks" />
          <Stat icon={BookOpen} value={`${anekdoten}/${ANEKDOTEN.length}`} label="Anecdotes" />
          <Stat icon={Martini} value={`${poisVal}/${POIS.length}`} label="Hot spots" />
          <Stat icon={Route} value={fmtDist(distance)} label="Distance" />
          <Stat icon={Clock} value={fmtTime(elapsed)} label="Time" />
          <Stat icon={Trophy} value="100%" label="Cleared" />
        </div>
        <button
          onClick={onBack}
          className="w-full rounded-xl tap"
          style={{
            minHeight: '52px',
            background: '#00E5FF', color: '#050C24',
            ...TYPO.ui, fontWeight: 700, fontSize: '15px',
            boxShadow: '0 6px 22px rgba(0,229,255,0.40)',
          }}
        >
          Next chapter
        </button>
        <button onClick={onClose} className="mt-3 text-xs opacity-65" style={{ ...TYPO.caps, fontSize: '10px' }}>Stay here</button>
      </div>
    </div>
  );
}

function Stat({ icon: I, value, label }) {
  return (
    <div className="p-2.5 rounded-lg text-left" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,169,60,0.18)' }}>
      <div className="flex items-center gap-1.5" style={{ ...TYPO.caps, fontSize: '9px', opacity: 0.7, color: '#D4A93C' }}>
        <I size={10} /> {label}
      </div>
      <div className="mt-0.5 text-base tabular-nums" style={{ ...TYPO.ui, fontWeight: 700, color: '#FFFFFF' }}>
        {value}
      </div>
    </div>
  );
}

/* ============================================================================
   MINI-MAP — echter Stadtplan-Ausschnitt oben links. Zeigt Wasser, Parks,
   Gebäude-Cluster, Hauptstrassen-Netz, Brücken; freigelegte Bereiche heller
   gegenüber leicht eingenebelten unbekannten. Throttled-Position via React.memo.
============================================================================ */
const MiniMap = React.memo(function MiniMap({ palette, revealed, position, onOpen, hidden }) {
  const playerProj = position ? project(position[0], position[1]) : null;
  // Vorberechnete Pfade (deterministisch, ändern sich nicht)
  const limmatPath = RIVER_PATH.map((p) => project(p[0], p[1]));
  const lakePts = LAKE_PATH.map((p) => project(p[0], p[1]));
  return (
    <button
      onClick={onOpen}
      className="absolute z-30 rounded-[12px] overflow-hidden tap backdrop-blur-md"
      style={{
        top: 'max(12px, env(safe-area-inset-top))',
        left: 'max(12px, env(safe-area-inset-left))',
        width: 160, height: 160,
        background: palette.miniBg,
        border: `1px solid ${palette.miniBorder}`,
        boxShadow: palette.cardShadow,
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
        transition: 'opacity 300ms var(--ease-premium), background 600ms var(--ease-premium), border-color 600ms var(--ease-premium)',
      }}
      aria-label="Open overview map"
    >
      <svg viewBox={`0 0 ${VIEWPORT.width} ${VIEWPORT.height}`} className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
        <defs>
          <mask id="miniFogMask" maskUnits="userSpaceOnUse" x="0" y="0" width={VIEWPORT.width} height={VIEWPORT.height}>
            <rect x="0" y="0" width={VIEWPORT.width} height={VIEWPORT.height} fill="white" />
            {revealed.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="60" fill="black" />
            ))}
          </mask>
        </defs>
        <rect width={VIEWPORT.width} height={VIEWPORT.height} fill={palette.miniBg} />

        {/* Zürichsee-Anschnitt — Polygon mit dunklerem Umriss für klare Kontur */}
        <polygon
          points={lakePts.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={palette.miniWater}
          stroke={palette.lakeBottom}
          strokeWidth="4"
          strokeLinejoin="round"
          opacity="0.95" />

        {/* Limmat — dunkler Outline-Stroke unten, hellere Wasserfüllung darüber */}
        <polyline
          points={limmatPath.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke={palette.lakeBottom}
          strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
        <polyline
          points={limmatPath.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke={palette.miniWater}
          strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
        {/* Subtile zentrale Strömungslinie */}
        <polyline
          points={limmatPath.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke={palette.riverHighlight}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />

        {/* Parks (Lindenhof etc.) als grüne Patches */}
        {PLAZAS.filter((pl) => pl.type === 'park').map((pl) => {
          const pts = pl.poly.map((p) => { const pp = project(p[0], p[1]); return `${pp.x},${pp.y}`; }).join(' ');
          return <polygon key={pl.id} points={pts} fill={palette.miniPark} opacity="0.85" />;
        })}

        {/* Gebäude-Cluster (Block-Polygone, simplifiziert) */}
        {BLOCKS.map((blk) => {
          const pts = blk.poly.map((p) => { const pp = project(p[0], p[1]); return `${pp.x},${pp.y}`; }).join(' ');
          return <polygon key={blk.id} points={pts} fill={palette.miniBuilding} />;
        })}

        {/* Hauptstrassen — dünn, hellgrau. Nur die "trunk"-Achsen für Lesbarkeit */}
        {STREETS.filter((s) => ['bahnhofstr', 'limmatquai', 'bahnhofquai', 'niederdorfstr', 'rennweg'].includes(s.id)).map((s) => {
          const pts = s.points.map(([la, ln]) => { const pp = project(la, ln); return `${pp.x},${pp.y}`; }).join(' ');
          return <polyline key={s.id} points={pts} fill="none" stroke={palette.miniStreetMain} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />;
        })}
        {/* Restliche Strassen — sehr dezent */}
        {STREETS.filter((s) => !['bahnhofstr', 'limmatquai', 'bahnhofquai', 'niederdorfstr', 'rennweg'].includes(s.id) && s.side !== 'bridge').map((s) => {
          const pts = s.points.map(([la, ln]) => { const pp = project(la, ln); return `${pp.x},${pp.y}`; }).join(' ');
          return <polyline key={s.id} points={pts} fill="none" stroke={palette.miniStreet} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />;
        })}

        {/* Brücken — kleine helle Striche über der Limmat */}
        {STREETS.filter((s) => s.side === 'bridge').map((s) => {
          const a = project(s.points[0][0], s.points[0][1]);
          const b = project(s.points[s.points.length - 1][0], s.points[s.points.length - 1][1]);
          return <line key={s.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={palette.miniBridge} strokeWidth="7" strokeLinecap="round" />;
        })}

        {/* Fog-Veil — unerkundete Bereiche leicht einnebeln, freigelegte bleiben hell */}
        <rect width={VIEWPORT.width} height={VIEWPORT.height} fill={palette.miniFog} mask="url(#miniFogMask)" />

        {/* Spieler-Dot — pulsierend */}
        {playerProj && (
          <g>
            <circle cx={playerProj.x} cy={playerProj.y} r="30" fill={palette.userPulseColor} opacity="0.45">
              <animate attributeName="r" values="22;42;22" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.55;0;0.55" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={playerProj.x} cy={playerProj.y} r="18" fill={palette.userMarkerInner} stroke={palette.userMarkerFill} strokeWidth="5" />
          </g>
        )}
      </svg>
    </button>
  );
});

/* ============================================================================
   OVERVIEW-MODAL — Vollkartenansicht (Top-Down, ohne Rotation/Tilt). Zeigt
   Strassen, Fog-Status, POIs, Anekdoten, Landmarks und Spielerposition.
============================================================================ */
function OverviewModal({ palette, revealed, position, onClose }) {
  const playerProj = position ? project(position[0], position[1]) : null;
  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{ aspectRatio: `${VIEWPORT.width} / ${VIEWPORT.height}`, background: palette.mapBg, border: `1px solid ${palette.cardBorder}`, boxShadow: palette.cardShadow }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg viewBox={`0 0 ${VIEWPORT.width} ${VIEWPORT.height}`} className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
          <defs>
            <mask id="ovFogMask" maskUnits="userSpaceOnUse" x="0" y="0" width={VIEWPORT.width} height={VIEWPORT.height}>
              <rect x="0" y="0" width={VIEWPORT.width} height={VIEWPORT.height} fill="white" />
              {revealed.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={FOG_REVEAL_RADIUS.overview} fill="black" />
              ))}
            </mask>
            <linearGradient id="ovStarFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE9B0" />
              <stop offset="100%" stopColor="#C8923C" />
            </linearGradient>
          </defs>
          <rect width={VIEWPORT.width} height={VIEWPORT.height} fill={palette.paperFill} />
          {/* Zürichsee — Polygon mit klar gezeichnetem Umriss */}
          <polygon
            points={LAKE_PATH.map((p) => { const pp = project(p[0], p[1]); return `${pp.x},${pp.y}`; }).join(' ')}
            fill={palette.lakeTop}
            stroke={palette.lakeBottom}
            strokeWidth="2.5"
            strokeLinejoin="round"
            opacity="0.95"
          />
          {/* Limmat — dunkler Outline-Stroke unten, Wasserfüllung darüber, dezente Strömungslinie */}
          {(() => {
            const riverPts = RIVER_PATH.map((p) => project(p[0], p[1]));
            const ptsStr = riverPts.map((p) => `${p.x},${p.y}`).join(' ');
            return (
              <g>
                <polyline points={ptsStr} fill="none" stroke={palette.lakeBottom}
                  strokeWidth="38" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
                <polyline points={ptsStr} fill="none" stroke={palette.lakeTop}
                  strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={ptsStr} fill="none" stroke={palette.riverHighlight}
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              </g>
            );
          })()}
          {/* Strassen */}
          {SEGMENTS.map((seg) => {
            const a = project(seg.a[0], seg.a[1]);
            const b = project(seg.b[0], seg.b[1]);
            return (
              <line key={seg.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={palette.streetGhostStroke} strokeWidth="4" strokeLinecap="round" opacity="0.75" />
            );
          })}
          {/* Fog-Veil */}
          <rect width={VIEWPORT.width} height={VIEWPORT.height}
            fill={palette.name === 'night' ? 'rgba(5,12,36,1)' : 'rgba(10,31,79,1)'}
            opacity={palette.name === 'night' ? 0.78 : 0.72}
            mask="url(#ovFogMask)" />
          {/* POIs */}
          {POIS.map((poi) => {
            const p = project(poi.coords[0], poi.coords[1]);
            const color = poi.kind === 'bar' ? palette.poiBarBg : poi.kind === 'restaurant' ? palette.poiRestaurantBg : palette.poiClubBg;
            return (
              <g key={poi.id}>
                <circle cx={p.x} cy={p.y - 6} r="9" fill={color} stroke="#fff" strokeWidth="1.6" />
                <circle cx={p.x} cy={p.y - 6} r="3" fill="#fff" opacity="0.85" />
              </g>
            );
          })}
          {/* Anekdoten */}
          {ANEKDOTEN.map((an) => {
            const p = project(an.coords[0], an.coords[1]);
            return (
              <circle key={an.id} cx={p.x} cy={p.y} r="6.5"
                fill={palette.anekdoteUnlockedFill} stroke="#fff" strokeWidth="1.2" />
            );
          })}
          {/* Landmarks (Sterne) */}
          {LANDMARKS.map((lm) => {
            const p = project(lm.coords[0], lm.coords[1]);
            return (
              <g key={lm.id} transform={`translate(${p.x},${p.y})`}>
                <path d={STAR_PATH_LG} fill="url(#ovStarFill)" stroke="#7A4A1F" strokeWidth="1.2" strokeLinejoin="round" />
              </g>
            );
          })}
          {/* Spieler-Dot */}
          {playerProj && (
            <g>
              <circle cx={playerProj.x} cy={playerProj.y} r="28" fill={palette.userPulseColor} opacity="0.4">
                <animate attributeName="r" values="22;42;22" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" repeatCount="indefinite" />
              </circle>
              <circle cx={playerProj.x} cy={playerProj.y} r="11" fill={palette.userMarkerInner} stroke={palette.userMarkerFill} strokeWidth="3" />
            </g>
          )}
        </svg>
        <button onClick={onClose}
          className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md tap"
          style={{ background: palette.cardBg, border: `1px solid ${palette.cardBorder}`, color: palette.text, boxShadow: palette.cardShadow }}
          aria-label="Close overview"
        >
          <X size={18} />
        </button>
        <div
          className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full backdrop-blur-md"
          style={{ ...TYPO.caps, fontSize: '10px', background: palette.cardBg, color: palette.text, border: `1px solid ${palette.cardBorder}` }}
        >
          Overview · Altstadt
        </div>
      </div>
    </div>
  );
}
