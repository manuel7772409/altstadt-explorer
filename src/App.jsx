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
    intro: 'Whisky-Tempel im Widder Hotel',
    desc: 'Legendäre Bar im 5-Sterne-Hotel mit über 850 Whisky-Sorten und Live-Jazz fast jeden Abend. Eine der besten Hotelbars Europas.' },
  { id: 'b-kronenhalle', kind: 'bar', name: 'Kronenhalle Bar', coords: [47.3699, 8.5447],
    intro: 'Picasso, Chagall, Cocktails',
    desc: 'Die Kronenhalle Bar ist mit echten Werken von Picasso, Chagall, Miró und Matisse dekoriert. Klassische Bar-Etikette, weltberühmter „Ladykiller"-Cocktail.' },
  { id: 'b-pigalle', kind: 'bar', name: 'Pigalle', coords: [47.3725, 8.5436],
    intro: 'Niederdörfler-Institution',
    desc: 'Klein, rauchig (im Geiste), immer voll. Stammbar für Künstler und Gscheidi seit Jahrzehnten — der Niederdorf-Klassiker schlechthin.' },
  { id: 'b-oldcrow', kind: 'bar', name: 'Old Crow', coords: [47.3702, 8.5417],
    intro: 'Speakeasy-Cocktailbar',
    desc: 'Versteckt in einem Hinterhof — schwer zu finden, immer voll. Erstklassige Cocktails, kleines dunkles Lokal, intime Atmosphäre.' },
  { id: 'b-bar63', kind: 'bar', name: 'Bar 63 (Storchen)', coords: [47.3706, 8.5419],
    intro: 'Hotel-Bar mit Limmat-Aussicht',
    desc: 'Im Hotel Storchen direkt am Wasser — die wohl schönste Terrasse der Altstadt mit Blick auf Limmat und Grossmünster.' },

  // Restaurants
  { id: 'r-kronenhalle', kind: 'restaurant', name: 'Kronenhalle', coords: [47.3697, 8.5448],
    intro: 'Schweizer Klassiker seit 1924',
    desc: 'Joyce, Picasso, Stravinsky speisten hier. Klassische Küche, weisse Tischtücher, Geschnetzeltes Zürcher Art und Crêpes Suzette mit Tradition.' },
  { id: 'r-zeughauskeller', kind: 'restaurant', name: 'Zeughauskeller', coords: [47.3712, 8.5402],
    intro: 'Mittelalterliche Bierhalle',
    desc: 'Im ehemaligen Zürcher Zeughaus aus dem 15. Jh. — riesige Bratwurst, Rösti, Bier in Kruegen, Hellebarden an den Wänden.' },
  { id: 'r-swisschuchi', kind: 'restaurant', name: 'Swiss Chuchi', coords: [47.3719, 8.5444],
    intro: 'Fondue-Wahrzeichen',
    desc: 'Im Hotel Adler. Das touristische Fondue-Erlebnis Niederdorfs — laut, voll und genau das, was man erwartet.' },
  { id: 'r-dezaley', kind: 'restaurant', name: 'Le Dézaley', coords: [47.3713, 8.5448],
    intro: 'Waadtländer Bistro',
    desc: 'Charmante Holzbalken-Beiz mit Käseschnitten, Filets de Perche und Wein aus dem Lavaux. Wie ein Stück Genferseeufer mitten in Zürich.' },
  { id: 'r-rueden', kind: 'restaurant', name: 'Haus zum Rüden', coords: [47.3713, 8.5430],
    intro: 'Gotisches Zunfthaus',
    desc: 'Mittelalterliches Zunfthaus von 1348 — feine Schweizer Küche unter einem Holzgewölbe, das wie eine umgedrehte Kirche aussieht.' },

  // Clubs
  { id: 'c-mascotte', kind: 'club', name: 'Mascotte', coords: [47.3674, 8.5462],
    intro: 'Zürichs ältester Musikclub',
    desc: 'Seit 1917 am Bellevue. Konzerte, Live-Bands, Indie-Disco. Berühmt-berüchtigt: die Sonntagabend-Karaoke „Heaven".' },
  { id: 'c-kaufleuten', kind: 'club', name: 'Kaufleuten', coords: [47.3704, 8.5392],
    intro: 'Kult-Bühne der Stadt',
    desc: 'Madonna, Bowie und Iggy Pop traten hier auf. Heute Klub, Theater und Restaurant in einem — eine der wichtigsten Kulturadressen der Schweiz.' },
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
    intro: 'Doppeltürmiges Wahrzeichen Zürichs',
    desc: 'Die romanische Kirche aus dem 12. Jh. soll von Karl dem Grossen gegründet worden sein. Hier predigte Reformator Huldrych Zwingli ab 1519 — der Beginn der Schweizer Reformation.',
    insider: 'Den Karlsturm besteigen für den schönsten Blick über die Altstadt.' },
  { id: 'fraumuenster', name: 'Fraumünster', coords: [47.3700, 8.5413],
    intro: 'Chagall-Glasfenster',
    desc: 'Die ehemalige Frauenabtei beherbergt fünf Glasfenster von Marc Chagall (1970) und ein weiteres von Augusto Giacometti — einer der grössten Schätze Zürichs.',
    insider: 'Am späten Vormittag ist das Licht durch die Fenster am intensivsten.' },
  { id: 'lindenhof-hill', name: 'Lindenhof', coords: [47.3724, 8.5408],
    intro: 'Aussichtshügel mit römischen Wurzeln',
    desc: 'Auf diesem Hügel stand einst eine römische Zollstation und später eine kaiserliche Pfalz. Heute Schachspielen unter Linden, mit Panoramablick auf Niederdorf und Limmat.',
    insider: 'Bei Sonnenuntergang besonders magisch — und immer kostenlos.' },
  { id: 'st-peter', name: 'St. Peter', coords: [47.3713, 8.5413],
    intro: 'Grösstes Ziffernblatt Europas',
    desc: 'Die älteste Pfarrkirche Zürichs hat das grösste Kirchturmziffernblatt Europas — 8.7 m Durchmesser. Der Turm diente als Feuerwache; die Wohnung des Türmers ist erhalten.',
    insider: 'Der Minutenzeiger ist allein 5.7 m lang.' },
];

/* ============================================================================
   ANEKDOTEN — lore discoveries (no star, just atmosphere)
============================================================================ */

const ANEKDOTEN = [
  { id: 'cabaret-voltaire', name: 'Cabaret Voltaire', coords: [47.3713, 8.5441],
    intro: 'Geburtsort des Dadaismus',
    desc: 'Hier gründeten 1916 Hugo Ball, Tristan Tzara und andere das Cabaret Voltaire — die Wiege der Dada-Bewegung. Während draussen der Erste Weltkrieg tobte, brüllte drinnen die Avantgarde.' },
  { id: 'lenin', name: 'Lenins Wohnung', coords: [47.3708, 8.5443],
    intro: 'Spiegelgasse 14 (1916–1917)',
    desc: 'Lenin und seine Frau Krupskaja wohnten hier 1916/17. Direkt neben dem Cabaret Voltaire — Revolutionäre der Politik neben Revolutionären der Kunst, ohne voneinander zu wissen.' },
  { id: 'schipfe-craft', name: 'Schipfe', coords: [47.3714, 8.5418],
    intro: 'Ältester Teil Zürichs',
    desc: 'Hier am Limmatufer wurden seit dem Mittelalter Boote „geschöpft" — Waren entladen. Heute eines der charmantesten Handwerker-Quartiere der Stadt.' },
  { id: 'lindenhof-rome', name: 'Römische Spuren', coords: [47.3724, 8.5410],
    intro: 'Castellum Turicum',
    desc: 'Auf dem Lindenhof stand bis ins 4. Jh. das römische Zollkastell „Turicum" — Namensgeber Zürichs. Reste der Mauer kannst du im Lindenhof-Park noch sehen.' },
  { id: 'augustiner-erker', name: 'Bemalte Erker', coords: [47.3720, 8.5407],
    intro: 'Augustinergasse',
    desc: 'Die zauberhaft bemalten Erker entstanden im 17.–18. Jh. — jeder erzählte vom Beruf oder Status seiner Bewohner. Märchenkulisse in echt.' },
  { id: 'doerfli', name: 'Das Dörfli', coords: [47.3722, 8.5437],
    intro: 'Niederdorf',
    desc: 'Niederdorf wird von Einheimischen liebevoll „Dörfli" genannt — das Dorf in der Stadt. Mittelalterliche Gassen, Beizen, Strassenmusik bis spät in die Nacht.' },
  { id: 'muensterhof-platz', name: 'Münsterhof', coords: [47.3703, 8.5410],
    intro: 'Mittelalterlicher Marktplatz',
    desc: 'Einer der ältesten Plätze Zürichs — hier wurden im Mittelalter Schweine, Salz und Tuch gehandelt. Heute autofrei und wunderbar zum Verweilen.' },
  { id: 'wasserkirche', name: 'Wasserkirche', coords: [47.3700, 8.5435],
    intro: 'Felix und Regula',
    desc: 'Hier sollen die Stadtheiligen Felix und Regula um 286 enthauptet worden sein — laut Legende trugen sie ihre Köpfe vierzig Schritte den Hügel hinauf zur Stelle des heutigen Grossmünsters.' },
  { id: 'bahnhofstr-history', name: 'Bahnhofstrasse', coords: [47.3722, 8.5402],
    intro: 'Vom Stadtgraben zur Luxusmeile',
    desc: 'Die Bahnhofstrasse wurde 1864 auf einem zugeschütteten Stadtgraben angelegt. Heute eine der teuersten Einkaufsstrassen der Welt.' },
  { id: 'keller-rindermarkt', name: 'Gottfried Keller', coords: [47.3713, 8.5444],
    intro: 'Rindermarkt 9',
    desc: 'Schweizer Dichter Gottfried Keller wohnte 1855–1861 hier und schrieb am „Grünen Heinrich". Heute eine kleine Gasse mit Buchläden und versteckten Cafés.' },
  { id: 'predigerkirche', name: 'Predigerkirche', coords: [47.3735, 8.5443],
    intro: 'Ehemaliges Dominikanerkloster',
    desc: 'Aus dem 13. Jh. — der Chor mit seinen Buntglasfenstern gehört zu den schönsten gotischen Räumen der Schweiz.' },
  { id: 'hirschen-platz', name: 'Hirschenplatz', coords: [47.3728, 8.5437],
    intro: 'Hirsch und Mosaik',
    desc: 'Der charmante kleine Platz mit Brunnen und altem „Hirschen"-Wirtshaus war einst Marktplatz. Achte auf die Hausfassaden — Mosaike erzählen Stadtgeschichten.' },
];

/* ============================================================================
   LEVELS
============================================================================ */

const LEVELS = [
  { name: 'Laie',      threshold: 0,  color: '#8C7355', accent: '#D6C2A3', icon: Footprints, desc: 'Du hast die Stadt gerade erst betreten.' },
  { name: 'Rookie',    threshold: 5,  color: '#A06840', accent: '#E0B58A', icon: MapPin,     desc: 'Erste Schritte gemacht.' },
  { name: 'Amateur',   threshold: 10, color: '#B07535', accent: '#E6BE7A', icon: Compass,    desc: 'Du findest dich langsam zurecht.' },
  { name: 'Entdecker', threshold: 20, color: '#C28A3E', accent: '#EFCB7E', icon: Mountain,   desc: 'Die Gassen geben ihre Geheimnisse preis.' },
  { name: 'Kenner',    threshold: 35, color: '#5F7B5C', accent: '#A6BC9A', icon: Sparkles,   desc: 'Besser als die meisten Touristen.' },
  { name: 'Veteran',   threshold: 55, color: '#3F6E72', accent: '#8FB6B8', icon: Award,      desc: 'Ein wahrer Stadt-Veteran.' },
  { name: 'Meister',   threshold: 75, color: '#7A3F5F', accent: '#C28FA8', icon: Trophy,     desc: 'Meister der verborgenen Pfade.' },
  { name: 'Legende',   threshold: 90, color: '#C8923C', accent: '#F0D49E', icon: Crown,      desc: 'Eine lebende Legende.' },
];

/* ============================================================================
   DISTRICTS / CHAPTERS
============================================================================ */

const DISTRICTS = [
  { id: 'altstadt',    roman: 'I',   name: 'Altstadt',           subtitle: 'Mittelalterliche Gassen am Limmatufer',
    icon: Building2,   color: '#C8923C', accent: '#F0D49E', available: true },
  { id: 'seefeld',     roman: 'II',  name: 'Seefeld & Bellevue', subtitle: 'Promenade am Zürichsee',
    icon: Waves,       color: '#3F6E72', accent: '#8FB6B8', available: false },
  { id: 'langstrasse', roman: 'III', name: 'Langstrasse',        subtitle: 'Multikulti, Bars und Streetart',
    icon: Music2,      color: '#7A3F5F', accent: '#C28FA8', available: false },
  { id: 'kreis-5',     roman: 'IV',  name: 'Industriequartier',  subtitle: 'Hipster, Kunst, Frau Gerolds Garten',
    icon: Feather,     color: '#5F7B5C', accent: '#A6BC9A', available: false },
  { id: 'hochschulen', roman: 'V',   name: 'Hochschulgebiet',    subtitle: 'ETH, Polyterrasse, Aussicht',
    icon: GraduationCap, color: '#1B3A5F', accent: '#7B96B5', available: false },
  { id: 'enge',        roman: 'VI',  name: 'Enge & Botanik',     subtitle: 'Villen, Park, Zürichhorn',
    icon: Trees,       color: '#A06840', accent: '#E0B58A', available: false },
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
  { id: 'first-step',    name: 'Erster Schritt',     desc: 'Erste Gasse freigeschaltet',
    icon: Footprints, color: '#A06840',
    check: (s) => s.unlocked.size >= 1 },
  { id: 'first-star',    name: 'Sternstunde',         desc: 'Erstes Wahrzeichen besucht',
    icon: Star, color: '#C8923C',
    check: (s) => s.stars.size >= 1 },
  { id: 'first-anekdote', name: 'Erste Geschichte',   desc: 'Erste Anekdote entdeckt',
    icon: BookOpen, color: '#7A3F5F',
    check: (s) => s.anekdoten.size >= 1 },
  { id: 'km-half',       name: 'Bummelschritt',       desc: '500 m in der Altstadt zurückgelegt',
    icon: Route, color: '#5F7B5C',
    check: (s) => s.distance >= 500 },
  { id: 'three-stars',   name: 'Sterne-Sammler',      desc: 'Drei Wahrzeichen entdeckt',
    icon: Sparkles, color: '#C28A3E',
    check: (s) => s.stars.size >= 3 },
  { id: 'all-stars',     name: 'Komplettist',         desc: 'Alle vier Sterne der Altstadt',
    icon: Crown, color: '#C8923C',
    check: (s) => s.stars.size >= LANDMARKS.length },
  { id: 'bridges',       name: 'Brückenmeister',      desc: 'Alle drei Limmatbrücken überquert',
    icon: Mountain, color: '#3F6E72',
    check: (s) => SEGMENTS_BY_SIDE.bridge.every((id) => s.unlocked.has(id)) },
  { id: 'km-one',        name: 'Wandersmann',         desc: '1 Kilometer Erkundung',
    icon: Award, color: '#7A3F5F',
    check: (s) => s.distance >= 1000 },
  { id: 'east-side',     name: 'Niederdorf-Held',     desc: 'Alle Gassen der Ostseite',
    icon: Award, color: '#7A3F5F',
    check: (s) => SEGMENTS_BY_SIDE.east.every((id) => s.unlocked.has(id)) },
  { id: 'west-side',     name: 'Lindenhof-Held',      desc: 'Alle Gassen der Westseite',
    icon: Award, color: '#7A3F5F',
    check: (s) => SEGMENTS_BY_SIDE.west.every((id) => s.unlocked.has(id)) },
  { id: 'half-anekdoten', name: 'Geschichtenkenner',  desc: 'Hälfte aller Anekdoten entdeckt',
    icon: BookOpen, color: '#7A3F5F',
    check: (s) => s.anekdoten.size >= Math.ceil(ANEKDOTEN.length / 2) },
  { id: 'all-anekdoten', name: 'Chronist',            desc: 'Alle Anekdoten entdeckt',
    icon: Feather, color: '#C8923C',
    check: (s) => s.anekdoten.size >= ANEKDOTEN.length },
  { id: 'first-bar',     name: 'Apéro',                desc: 'Erste Bar besucht',
    icon: Martini, color: '#7A3F5F',
    check: (s) => [...s.pois].some((id) => POIS.find((p) => p.id === id)?.kind === 'bar') },
  { id: 'all-bars',      name: 'Bar-Hopper',           desc: 'Alle Bars besucht',
    icon: Wine, color: '#7A3F5F',
    check: (s) => POIS.filter((p) => p.kind === 'bar').every((p) => s.pois.has(p.id)) },
  { id: 'all-restaurants', name: 'Genussmensch',       desc: 'Alle Restaurants besucht',
    icon: ChefHat, color: '#A8542C',
    check: (s) => POIS.filter((p) => p.kind === 'restaurant').every((p) => s.pois.has(p.id)) },
  { id: 'all-clubs',     name: 'Nachtschwärmer',       desc: 'Alle Clubs besucht',
    icon: Disc3, color: '#3F4A8F',
    check: (s) => POIS.filter((p) => p.kind === 'club').every((p) => s.pois.has(p.id)) },
  { id: 'half-altstadt', name: 'Halbe Altstadt',      desc: '50% aller Gassen erkundet',
    icon: Trophy, color: '#C8923C',
    check: (s) => s.unlocked.size >= TOTAL_SEGMENTS * 0.5 },
  { id: 'legende',       name: 'Lebende Legende',     desc: '90% Erkundung erreicht',
    icon: Crown, color: '#C8923C',
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

const STORAGE_KEY = 'altstadt-explorer-v6';
const OSM_CACHE_KEY = 'altstadt-osm-features-v3';
const OSM_CACHE_TTL_MS = 30 * 86400 * 1000; // 30 days

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
        name: tags.name || tags['name:de'] || tags.ref || tags.highway || 'Strasse',
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

const PALETTES = {
  day: {
    name: 'day',
    pageBg: 'radial-gradient(circle at 30% 20%, #efe1c4 0%, #e5d4b1 45%, #d8c399 100%)',
    mapBg: '#e8d6b3',
    paperFill: '#efe1c4',
    paperNoiseColor: '0 0 0 0 0.65  0 0 0 0 0.5  0 0 0 0 0.3  0 0 0 0.06 0',
    paperNoiseOpacity: 0.5,
    starfieldVisible: false,
    text: '#2A1F12',
    textMuted: 'rgba(60,40,20,0.6)',
    cardBg: 'rgba(245,233,208,0.88)',
    cardBorder: 'rgba(60,40,20,0.18)',
    cardShadow: '0 4px 14px rgba(60,40,20,0.18)',
    streetStroke: '#1B3A5F',
    streetGhostStroke: '#a89272',
    streetGhostOpacity: 0.35,
    bridgeAccent: '#C8923C',
    cloudA: '#fbf3e2',
    cloudB: '#ffffff',
    cloudC: '#f7eed8',
    cloudOpA: 0.95,
    cloudOpB: 0.97,
    cloudOpC: 0.95,
    cloudOpacity: 1,
    riverTop: '#5C9499',
    riverBottom: '#2F5F65',
    riverHighlight: '#9ABFC0',
    riverOpacity: 0.85,
    trailStroke: '#C8923C',
    trailOpacity: 0.55,
    compassStroke: '#5C3F22',
    compassOpacity: 0.55,
    vignette: 'rgba(60,40,20,0.18)',
    userMarkerInner: '#C8923C',
    userMarkerStroke: '#C8923C',
    userMarkerFill: '#fff',
    userPulseColor: '#C8923C',
    starLockedStroke: '#5C3F22',
    starLockedFill: 'rgba(245,233,208,0.7)',
    anekdoteLockedFill: 'rgba(245,233,208,0.6)',
    anekdoteLockedStroke: '#5C3F22',
    anekdoteUnlockedFill: '#7A3F5F',
    anekdoteUnlockedStroke: '#F5E9D0',
    anekdoteIconColor: '#F5E9D0',
    landmarkLabelStroke: 'rgba(245,233,208,0.85)',
    bottomBarBg: 'rgba(245,233,208,0.55)',
    bottomBarBorder: 'rgba(60,40,20,0.18)',
    headerBorder: 'rgba(60,40,20,0.18)',
    iconBtnBg: 'rgba(60,40,20,0.08)',
    simModeOnBg: 'rgba(27,58,95,0.92)',
    simModeOffBg: 'rgba(60,40,20,0.08)',
    // Detailed map elements
    blockFill: '#dec5a0',
    blockStroke: 'rgba(60,40,20,0.22)',
    blockShadow: 'rgba(60,40,20,0.12)',
    plazaPaved: '#e8d6b3',
    plazaPark: '#bfca9a',
    plazaStroke: 'rgba(60,40,20,0.25)',
    fountainOuter: '#5C3F22',
    fountainInner: '#5C9499',
    treeColor: '#5F7B5C',
    treeShadow: 'rgba(60,40,20,0.2)',
    lakeTop: '#8BB4B8',
    lakeBottom: '#3F6E72',
    hbfFill: '#c6a878',
    hbfStroke: '#5C3F22',
    tramTrack: 'rgba(60,40,20,0.35)',
    contour: 'rgba(95,62,40,0.15)',
    // Lifted street style (Pokemon Go inspired)
    streetFill: '#FAF1D9',
    streetOutline: '#3A2818',
    streetShine: 'rgba(255,255,255,0.55)',
    streetShadow: 'rgba(60,40,20,0.25)',
    osmGhost: '#c6a978',          // OSM backdrop streets (always-visible context)
    osmGhostOutline: 'rgba(80,55,30,0.4)',
    // POI colors
    poiBarBg: '#7A3F5F',
    poiBarRing: '#F5C9DC',
    poiRestaurantBg: '#A8542C',
    poiRestaurantRing: '#F5D2A8',
    poiClubBg: '#3F4A8F',
    poiClubRing: '#C9D2F5',
    poiPinShadow: 'rgba(60,40,20,0.35)',
    poiLockedDesat: 0.55,        // grayscale ratio when not visited
    // Cloud upgrade
    cloudGradTop: '#FFFFFF',
    cloudGradBottom: '#E8DAC0',
    cloudShadow: 'rgba(60,40,20,0.22)',
    // OSM features
    osmBuildingFill: '#E8D2A8',
    osmBuildingStroke: 'rgba(80,55,30,0.55)',
    osmBuildingShadow: 'rgba(60,40,20,0.18)',
    osmBuildingChurch: '#D5BB8A',
    osmBuildingPart: 'rgba(80,55,30,0.18)',
    osmParkFill: '#C5D7A6',
    osmParkStroke: 'rgba(80,110,55,0.35)',
    osmWaterFill: '#A6CDD2',
    osmRailStroke: 'rgba(80,55,30,0.42)',
    osmParkingFill: '#DFD4BD',
    osmParkingStroke: 'rgba(80,55,30,0.25)',
    osmBarrierStroke: 'rgba(80,55,30,0.5)',
  },
  night: {
    name: 'night',
    pageBg: 'radial-gradient(circle at 30% 25%, #1f2541 0%, #141a30 50%, #0a0e1c 100%)',
    mapBg: '#0e1428',
    paperFill: '#10182e',
    paperNoiseColor: '0 0 0 0 0.5  0 0 0 0 0.55  0 0 0 0 0.7  0 0 0 0.08 0',
    paperNoiseOpacity: 0.35,
    starfieldVisible: true,
    text: '#E8E2D0',
    textMuted: 'rgba(232,226,208,0.55)',
    cardBg: 'rgba(20,26,48,0.85)',
    cardBorder: 'rgba(232,226,208,0.18)',
    cardShadow: '0 4px 14px rgba(0,0,0,0.4)',
    streetStroke: '#FFD27A',
    streetGhostStroke: '#3a4566',
    streetGhostOpacity: 0.45,
    bridgeAccent: '#FFE9B0',
    cloudA: '#1a223e',
    cloudB: '#252e4f',
    cloudC: '#1d2640',
    cloudOpA: 0.85,
    cloudOpB: 0.88,
    cloudOpC: 0.85,
    cloudOpacity: 1,
    riverTop: '#5B7DA8',
    riverBottom: '#2A4368',
    riverHighlight: '#B8C9DE',
    riverOpacity: 0.7,
    trailStroke: '#FFE9B0',
    trailOpacity: 0.7,
    compassStroke: '#B8C9DE',
    compassOpacity: 0.5,
    vignette: 'rgba(0,0,0,0.5)',
    userMarkerInner: '#FFD27A',
    userMarkerStroke: '#FFE9B0',
    userMarkerFill: '#0a0e1c',
    userPulseColor: '#FFD27A',
    starLockedStroke: '#B8C9DE',
    starLockedFill: 'rgba(232,226,208,0.18)',
    anekdoteLockedFill: 'rgba(232,226,208,0.15)',
    anekdoteLockedStroke: '#B8C9DE',
    anekdoteUnlockedFill: '#B98AC9',
    anekdoteUnlockedStroke: '#0a0e1c',
    anekdoteIconColor: '#0a0e1c',
    landmarkLabelStroke: 'rgba(10,14,28,0.85)',
    bottomBarBg: 'rgba(20,26,48,0.65)',
    bottomBarBorder: 'rgba(232,226,208,0.12)',
    headerBorder: 'rgba(232,226,208,0.12)',
    iconBtnBg: 'rgba(232,226,208,0.1)',
    simModeOnBg: 'rgba(91,125,168,0.5)',
    simModeOffBg: 'rgba(232,226,208,0.08)',
    // Detailed map elements
    blockFill: '#1a2240',
    blockStroke: 'rgba(232,226,208,0.12)',
    blockShadow: 'rgba(0,0,0,0.4)',
    plazaPaved: '#1f2848',
    plazaPark: '#1d3034',
    plazaStroke: 'rgba(232,226,208,0.15)',
    fountainOuter: '#B8C9DE',
    fountainInner: '#5B7DA8',
    treeColor: '#3a5b4a',
    treeShadow: 'rgba(0,0,0,0.5)',
    lakeTop: '#3a5d75',
    lakeBottom: '#1a2c44',
    hbfFill: '#26304d',
    hbfStroke: '#B8C9DE',
    tramTrack: 'rgba(232,226,208,0.18)',
    contour: 'rgba(232,226,208,0.08)',
    // Lifted street style (night)
    streetFill: '#FFE9B0',
    streetOutline: '#0A0E1C',
    streetShine: 'rgba(255,255,255,0.4)',
    streetShadow: 'rgba(0,0,0,0.55)',
    osmGhost: '#3a4566',
    osmGhostOutline: 'rgba(232,226,208,0.18)',
    // POI colors
    poiBarBg: '#B98AC9',
    poiBarRing: '#3D2148',
    poiRestaurantBg: '#E0A26E',
    poiRestaurantRing: '#3F2818',
    poiClubBg: '#7B96D9',
    poiClubRing: '#1F2848',
    poiPinShadow: 'rgba(0,0,0,0.6)',
    poiLockedDesat: 0.7,
    // Cloud upgrade
    cloudGradTop: '#2C3656',
    cloudGradBottom: '#161E36',
    cloudShadow: 'rgba(0,0,0,0.55)',
    // OSM features
    osmBuildingFill: '#1f2848',
    osmBuildingStroke: 'rgba(232,226,208,0.32)',
    osmBuildingShadow: 'rgba(0,0,0,0.5)',
    osmBuildingChurch: '#2a345a',
    osmBuildingPart: 'rgba(232,226,208,0.12)',
    osmParkFill: '#1d3034',
    osmParkStroke: 'rgba(140,180,140,0.2)',
    osmWaterFill: '#1a2c44',
    osmRailStroke: 'rgba(232,226,208,0.25)',
    osmParkingFill: '#212a4a',
    osmParkingStroke: 'rgba(232,226,208,0.18)',
    osmBarrierStroke: 'rgba(232,226,208,0.32)',
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
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=Manrope:wght@400;500;600;700&display=swap';
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
        savedAt: Date.now(),
      });
    }, 800);
    return () => clearTimeout(t);
  }, [unlocked, stars, anekdoten, pois, achievements, distance, elapsed, welcomeOpen, chapterDoneSeen, settings, journal, hydrated]);

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
        sub: names.length > 1 ? `+${names.length - 1} weitere Gassen` : 'Neu freigeschaltet',
      });
    }

    // Feedback (one signal per batch, prioritize the most exciting)
    if (newStars.length > 0) fbk('star');
    else if (newPois.length > 0) fbk('poi_' + newPois[0].kind);
    else if (newAnek.length > 0) fbk('anekdote');
    else if (newSegs.length > 0) fbk('street');

    // Journal — record everything discovered
    newStars.forEach((lm) => pushJournal({ type: 'star', name: lm.name, sub: lm.intro }));
    newAnek.forEach((an) => pushJournal({ type: 'anekdote', name: an.name, sub: an.intro }));
    newPois.forEach((p) => pushJournal({ type: 'poi', kind: p.kind, name: p.name, sub: p.intro }));
    const newStreetNames = [...new Set(newSegs.map((s) => s.streetName))];
    newStreetNames.forEach((n) => pushJournal({ type: 'street', name: n, sub: 'Gasse freigeschaltet' }));

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
      setLevelUp(LEVELS[levelIdx]);
      fbk('level');
      pushJournal({ type: 'level', name: LEVELS[levelIdx].name, sub: 'Neuer Rang erreicht' });
    }
  }, [levelIdx, hydrated, fbk, pushJournal]);

  /* Chapter complete (100%) */
  useEffect(() => {
    if (!hydrated) return;
    if (pct >= 99.99 && !chapterDoneSeen) {
      setChapterDoneSeen(true);
      setChapterDone(true);
      fbk('chapter');
      pushJournal({ type: 'chapter', name: 'Altstadt erobert', sub: 'Kapitel I abgeschlossen' });
    }
  }, [pct, hydrated, chapterDoneSeen, fbk, pushJournal]);

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
      enqueueToast({ type: 'error', title: 'GPS nicht verfügbar', sub: 'Simulationsmodus aktiviert' });
      setSimMode(true);
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setAccuracy(pos.coords.accuracy);
        processPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => enqueueToast({ type: 'error', title: 'GPS-Fehler', sub: err.message }),
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
    if (typeof window !== 'undefined' && !window.confirm('Wirklich alle Fortschritte löschen?')) return;
    stopDemo(); setTracking(false);
    setUnlocked(new Set()); setStars(new Set()); setAnekdoten(new Set()); setPois(new Set()); setAchievements(new Set());
    setTrail([]); setPosition(null); setElapsed(0); setDistance(0); setLevelUp(null); setChapterDone(false);
    setChapterDoneSeen(false); setJournal([]);
    lastPosRef.current = null; lastLevelIdxRef.current = 0; startTsRef.current = null;
    saveState({ unlocked: [], stars: [], anekdoten: [], pois: [], achievements: [], distance: 0, elapsed: 0, welcomeSeen: true, chapterDoneSeen: false, settings, journal: [], savedAt: Date.now() });
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
          onSelect={(id) => { if (id === 'altstadt') setView('explore'); }}
        />
      )}
      {view === 'explore' && (
        <ExploreScreen
          palette={palette}
          state={{ tracking, simMode, demoRunning, position, accuracy, unlocked, stars, anekdoten, pois, achievements, trail, elapsed, distance, level, nextLevel, levelIdx, pct, streetsTouched, bgActive, wakeLockActive, osmStreets, osmFeatures, osmStatus, themeName }}
          actions={{ handleStart, handleReset, setSimMode, runDemo, stopDemo, setShowLegend, setShowAchievements, setShowJournal, setShowSettings, setShowLokale, setActiveLandmark, setActiveAnekdote, setActivePoi, processPosition, lastPosRef, setView,
            cycleTheme: () => setSettings((s) => {
              const next = s.themeMode === 'auto' ? (themeName === 'night' ? 'day' : 'night')
                : s.themeMode === 'day' ? 'night'
                : 'auto';
              return { ...s, themeMode: next };
            })
          }}
        />
      )}

      {welcomeOpen && hydrated && <WelcomeScreen onClose={() => setWelcomeOpen(false)} />}
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

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          0% { transform: scale(0.85); opacity: 0; }
          60% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
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
        @keyframes confetti {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-fadeIn { animation: fadeIn 220ms ease-out; }
        .animate-popIn { animation: popIn 420ms cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-toast { animation: toastIn 2.8s ease-out forwards; }
      `}</style>
    </>
  );
}

/* ============================================================================
   WELCOME SCREEN
============================================================================ */

function WelcomeScreen({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: 'radial-gradient(circle at 30% 30%, #2b2113 0%, #15100a 70%)', fontFamily: '"Manrope", sans-serif' }}
    >
      {/* drifting cloud silhouettes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${[10, 55, 25, 70][i]}%`,
              top: `${[20, 35, 65, 55][i]}%`,
              width: `${[180, 240, 200, 280][i]}px`,
              height: `${[90, 110, 95, 120][i]}px`,
              background: 'radial-gradient(ellipse, rgba(245,233,208,0.12), transparent 70%)',
              animation: `drift ${8 + i * 2}s ease-in-out ${i * 0.7}s infinite`,
              filter: 'blur(20px)',
            }}
          />
        ))}
      </div>

      <div className="relative max-w-md text-center px-6 py-10 animate-popIn" style={{ color: '#F5E9D0' }}>
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #C8923C, #8C5C2A)', boxShadow: '0 0 0 6px rgba(200,146,60,0.15), 0 12px 30px rgba(0,0,0,0.4)' }}>
          <Compass size={32} color="#F5E9D0" strokeWidth={2} />
        </div>
        <p className="text-[10px] uppercase tracking-[0.4em] opacity-65 mb-3">Willkommen</p>
        <h1 className="leading-none mb-4" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 900, fontSize: '44px', letterSpacing: '-0.02em' }}>
          Zürich Altstadt
        </h1>
        <p className="text-base leading-relaxed opacity-85 mb-2" style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic' }}>
          Eine Stadt aus Wolken,<br />die nur deine Schritte vertreiben können.
        </p>
        <p className="text-xs uppercase tracking-[0.2em] opacity-75 mt-3" style={{ color: '#E6BE7A' }}>
          Tipp: Beginne beim Bahnhof!
        </p>
        <p className="text-sm leading-relaxed opacity-65 mt-5 mb-7">
          Lüfte den Wolken-Schleier Gasse für Gasse, sammle Sterne an Wahrzeichen, entdecke versteckte Geschichten — und finde die besten Bars, Restaurants und Clubs der Stadt.
        </p>
        <button
          onClick={onClose}
          className="px-7 py-3 rounded-full font-semibold transition active:scale-95"
          style={{ background: 'linear-gradient(135deg, #C8923C, #8C5C2A)', color: '#F5E9D0', fontFamily: '"Fraunces", Georgia, serif', letterSpacing: '0.02em', boxShadow: '0 8px 24px rgba(200,146,60,0.4)' }}
        >
          Reise beginnen
        </button>
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
      className="w-full min-h-screen flex flex-col"
      style={{
        background: palette.pageBg,
        fontFamily: '"Manrope", sans-serif', color: palette.text,
        transition: 'background 800ms ease, color 600ms ease',
      }}
    >
      <header className="px-5 pt-6 pb-4 flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] opacity-60 mb-1">Reise-Atlas</p>
          <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 800, fontSize: '32px', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Zürich
          </h1>
          <p className="text-sm opacity-65 mt-1.5">{isNight ? 'Eine Stadt bei Nacht' : 'Wähle dein Kapitel'}</p>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C8923C, #8C5C2A)', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)' }}>
          <Compass size={24} color="#F5E9D0" strokeWidth={2.2} />
        </div>
      </header>

      <div className="px-4 pb-8 flex-1 flex flex-col gap-3">
        {DISTRICTS.map((d) => {
          const isAlt = d.id === 'altstadt';
          const Icon = d.icon;
          const lockedBg = isNight ? 'rgba(232,226,208,0.05)' : 'rgba(60,40,20,0.06)';
          const lockedBorder = isNight ? 'rgba(232,226,208,0.18)' : 'rgba(60,40,20,0.2)';
          const lockedIcon = isNight ? 'rgba(232,226,208,0.4)' : 'rgba(60,40,20,0.5)';
          const lockedBadge = isNight ? 'rgba(232,226,208,0.1)' : 'rgba(60,40,20,0.12)';
          const lockedIconBg = isNight ? 'rgba(232,226,208,0.08)' : 'rgba(60,40,20,0.1)';
          return (
            <button
              key={d.id}
              onClick={() => d.available && onSelect(d.id)}
              disabled={!d.available}
              className="relative w-full text-left p-4 rounded-2xl transition active:scale-[0.99] overflow-hidden"
              style={{
                background: d.available
                  ? `linear-gradient(135deg, ${d.color} 0%, ${d.accent} 100%)`
                  : lockedBg,
                border: d.available ? 'none' : `1px dashed ${lockedBorder}`,
                color: d.available ? '#F5E9D0' : palette.text,
                boxShadow: d.available ? `0 6px 18px ${d.color}40, inset 0 1px 0 rgba(255,255,255,0.2)` : 'none',
                cursor: d.available ? 'pointer' : 'not-allowed',
                opacity: d.available ? 1 : 0.7,
              }}
            >
              {d.available && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15), transparent 60%)' }} />
              )}

              <div className="relative flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: d.available ? 'rgba(245,233,208,0.18)' : lockedIconBg,
                    border: d.available ? '1px solid rgba(245,233,208,0.3)' : 'none',
                  }}
                >
                  {d.available ? <Icon size={22} color="#F5E9D0" strokeWidth={2} /> : <Lock size={18} color={lockedIcon} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] uppercase tracking-[0.22em] opacity-75" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 }}>
                      Kapitel {d.roman}
                    </span>
                    {!d.available && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: lockedBadge }}>
                        Demnächst
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                    {d.name}
                  </h2>
                  <p className="text-[12px] opacity-80 mt-0.5 leading-snug">{d.subtitle}</p>

                  {isAlt && (
                    <div className="mt-3 space-y-2">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.18)' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stats.pct}%`, background: 'linear-gradient(90deg, #FFE9B0, #F5E9D0)' }} />
                      </div>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] opacity-90">
                        <span className="flex items-center gap-1"><stats.level.icon size={11} /> {stats.level.name}</span>
                        <span>·</span>
                        <span>{stats.pct.toFixed(0)}%</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Star size={10} fill="#FFE9B0" stroke="none" /> {stats.stars}/{altstadtStars}</span>
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

      <footer className="px-5 py-4 text-center text-[10px] opacity-50 tracking-wider">
        Mehr Kapitel folgen — und schon bald: ein Live-Modus für Einheimische.
      </footer>
    </div>
  );
}

/* ============================================================================
   EXPLORE SCREEN — main map view
============================================================================ */

function ExploreScreen({ palette, state, actions }) {
  const { tracking, simMode, demoRunning, position, accuracy, unlocked, stars, anekdoten, pois, achievements, trail, elapsed, distance, level, nextLevel, levelIdx, pct, streetsTouched, bgActive, wakeLockActive, osmStreets, osmFeatures, osmStatus, themeName } = state;
  const { handleStart, handleReset, setSimMode, runDemo, stopDemo, setShowLegend, setShowAchievements, setShowJournal, setShowSettings, setShowLokale, setActiveLandmark, setActiveAnekdote, setActivePoi, processPosition, lastPosRef, setView, cycleTheme } = actions;

  const svgRef = useRef(null);
  const LevelIcon = level.icon;
  const NextIcon = nextLevel?.icon;

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
      // Hit area: pin disc is centered ~22px above the location
      if (Math.hypot(pp.x - local.x, (pp.y - 18) - local.y) < 14) { setActivePoi(poi); return; }
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
    <div className="w-full min-h-screen flex flex-col" style={{ background: palette.pageBg, fontFamily: '"Manrope", sans-serif', color: palette.text, transition: 'background 800ms ease, color 600ms ease' }}>
      <header className="px-3 pt-4 pb-3 flex items-center justify-between border-b" style={{ borderColor: palette.headerBorder, transition: 'border-color 600ms ease' }}>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('districts')} className="w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95" style={{ background: palette.iconBtnBg, transition: 'background 400ms ease' }} aria-label="Zurück">
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[9px] uppercase tracking-[0.22em] opacity-60">Kapitel I</p>
            <h1 className="text-lg leading-none tracking-tight" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Altstadt
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={cycleTheme} className="w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95" style={{ background: palette.iconBtnBg, transition: 'background 400ms ease' }} aria-label="Tag/Nacht">
            {themeName === 'night' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button onClick={() => setShowJournal(true)} className="w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95" style={{ background: palette.iconBtnBg, transition: 'background 400ms ease' }} aria-label="Tagebuch">
            <NotebookPen size={16} />
          </button>
          <button onClick={() => setShowAchievements(true)} className="relative w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95" style={{ background: palette.iconBtnBg, transition: 'background 400ms ease' }} aria-label="Errungenschaften">
            <Trophy size={16} />
            {achievements.size > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: '#C8923C', color: '#F5E9D0' }}>
                {achievements.size}
              </span>
            )}
          </button>
          <button onClick={() => setShowSettings(true)} className="w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95" style={{ background: palette.iconBtnBg, transition: 'background 400ms ease' }} aria-label="Einstellungen">
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      <div className="relative flex-1 min-h-[420px]" style={{ background: palette.mapBg, transition: 'background 800ms ease' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWPORT.width} ${VIEWPORT.height}`}
          className="w-full h-full block"
          preserveAspectRatio="xMidYMid meet"
          onClick={handleSvgClick}
          style={{ cursor: simMode && tracking && !demoRunning ? 'crosshair' : 'default', touchAction: 'manipulation' }}
        >
          <defs>
            <filter id="paperNoise" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
              <feColorMatrix values={palette.paperNoiseColor} />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <filter id="cloudBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.2" />
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
            <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
              <stop offset="60%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor={palette.vignette} />
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
            <linearGradient id="cloudVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.cloudGradTop} stopOpacity="1" />
              <stop offset="100%" stopColor={palette.cloudGradBottom} stopOpacity="0.95" />
            </linearGradient>
            <filter id="cloudPuff" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
            <filter id="cloudDropShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" />
              <feOffset dy="1.5" />
              <feComponentTransfer><feFuncA type="linear" slope="0.4" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="poiPinShadow" x="-50%" y="-30%" width="200%" height="180%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" />
              <feOffset dy="2.5" />
              <feComponentTransfer><feFuncA type="linear" slope="0.55" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="streetEmboss" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" />
              <feOffset dy="1.2" />
              <feComponentTransfer><feFuncA type="linear" slope="0.45" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect width={VIEWPORT.width} height={VIEWPORT.height} fill={palette.paperFill} style={{ transition: 'fill 800ms ease' }} />
          <rect width={VIEWPORT.width} height={VIEWPORT.height} filter="url(#paperNoise)" opacity={palette.paperNoiseOpacity} />

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
                  <text x={center.x} y={center.y + 3} textAnchor="middle" fontSize="9" fontFamily="Fraunces, Georgia, serif" fontWeight="700" fill={palette.hbfStroke} opacity="0.85" style={{ pointerEvents: 'none' }}>
                    Hbf
                  </text>
                );
              })()}
            </g>
          )}

          {/* OSM buildings — Google Maps-like rendering with crisp outlines */}
          {osmFeatures && osmFeatures.buildings.length > 0 ? (
            <g style={{ pointerEvents: 'none' }}>
              {/* Pass 1: drop shadows */}
              {osmFeatures.buildings.map((b) => {
                const pts = b.points.map(([la, ln]) => { const p = project(la, ln); return `${p.x + 0.8},${p.y + 1.2}`; }).join(' ');
                return <polygon key={`bs-${b.id}`} points={pts} fill={palette.osmBuildingShadow} opacity="0.55" />;
              })}
              {/* Pass 2: fills */}
              {osmFeatures.buildings.map((b) => {
                const isChurch = b.kind === 'church' || b.kind === 'cathedral' || b.kind === 'chapel';
                const pts = b.points.map(([la, ln]) => { const p = project(la, ln); return `${p.x},${p.y}`; }).join(' ');
                return (
                  <polygon key={b.id} points={pts}
                    fill={isChurch ? palette.osmBuildingChurch : palette.osmBuildingFill}
                    stroke={palette.osmBuildingStroke}
                    strokeWidth="0.75"
                    strokeLinejoin="round"
                    style={{ transition: 'fill 600ms ease, stroke 600ms ease' }} />
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
            <text y="-36" textAnchor="middle" fontSize="11" fontFamily="Fraunces, Georgia, serif" fill={palette.compassStroke} fontWeight="700">N</text>
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

          {/* Core streets unlocked — lifted with outline + fill + bright shine */}
          <g filter="url(#streetEmboss)">
            {/* Outline pass */}
            {SEGMENTS.map((seg) => {
              if (!unlocked.has(seg.id)) return null;
              const a = project(seg.a[0], seg.a[1]);
              const b = project(seg.b[0], seg.b[1]);
              const isBridge = seg.side === 'bridge';
              return (
                <line key={`u-o-${seg.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={palette.streetOutline} strokeWidth={isBridge ? 7.5 : 6.4}
                  strokeLinecap="round" opacity="0.95" style={{ transition: 'stroke 600ms ease' }} />
              );
            })}
            {/* Fill pass */}
            {SEGMENTS.map((seg) => {
              if (!unlocked.has(seg.id)) return null;
              const a = project(seg.a[0], seg.a[1]);
              const b = project(seg.b[0], seg.b[1]);
              const isBridge = seg.side === 'bridge';
              return (
                <line key={`u-f-${seg.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={palette.streetFill} strokeWidth={isBridge ? 5.2 : 4.2}
                  strokeLinecap="round" opacity="1" style={{ transition: 'stroke 600ms ease' }} />
              );
            })}
            {/* Bridge accent */}
            {SEGMENTS.map((seg) => {
              if (!unlocked.has(seg.id) || seg.side !== 'bridge') return null;
              const a = project(seg.a[0], seg.a[1]);
              const b = project(seg.b[0], seg.b[1]);
              return (
                <line key={`u-b-${seg.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={palette.bridgeAccent} strokeWidth="1.4" strokeLinecap="round"
                  strokeDasharray="3 3" opacity="0.9" />
              );
            })}
            {/* Shine highlight (top edge of street, very subtle) */}
            {SEGMENTS.map((seg) => {
              if (!unlocked.has(seg.id)) return null;
              const a = project(seg.a[0], seg.a[1]);
              const b = project(seg.b[0], seg.b[1]);
              const dx = b.x - a.x, dy = b.y - a.y;
              const len = Math.hypot(dx, dy) || 1;
              const nx = -dy / len, ny = dx / len;
              const off = 1.0;
              return (
                <line key={`u-s-${seg.id}`}
                  x1={a.x + nx * off} y1={a.y + ny * off}
                  x2={b.x + nx * off} y2={b.y + ny * off}
                  stroke={palette.streetShine} strokeWidth="1" strokeLinecap="round" opacity="0.85" />
              );
            })}
          </g>

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

          {/* Clouds — fluffier multi-puff with ground shadow + volume gradient */}
          <g style={{ pointerEvents: 'none' }}>
            {SEGMENTS.map((seg) => {
              const isUnlocked = unlocked.has(seg.id);
              const a = project(seg.a[0], seg.a[1]);
              const b = project(seg.b[0], seg.b[1]);
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
              const dx = b.x - a.x, dy = b.y - a.y;
              const len = Math.hypot(dx, dy) || 1;
              const ux = dx / len, uy = dy / len;
              const baseR = Math.max(8, len * 0.28);
              return (
                <g key={`c-${seg.id}`}
                  style={{
                    transition: 'opacity 700ms ease-out, transform 900ms ease-out',
                    opacity: isUnlocked ? 0 : 1,
                    transform: isUnlocked ? `translate(0,-14px) scale(1.18) rotate(2deg)` : 'none',
                    transformOrigin: `${mx}px ${my}px`,
                    transformBox: 'fill-box',
                  }}
                >
                  {/* Ground shadow */}
                  <ellipse cx={mx} cy={my + baseR * 0.55} rx={baseR * 0.85} ry={baseR * 0.18}
                    fill={palette.cloudShadow} opacity="0.7" filter="url(#cloudPuff)" />
                  {/* Cloud body — multi-puff with volume gradient */}
                  <g filter="url(#cloudPuff)">
                    {/* Bottom layer — wider, slightly darker (gradient bottom) */}
                    <ellipse cx={mx - ux * baseR * 0.55} cy={my + 1.5} rx={baseR * 0.55} ry={baseR * 0.42}
                      fill="url(#cloudVolume)" opacity={palette.cloudOpA} />
                    <ellipse cx={mx + ux * baseR * 0.55} cy={my + 1.2} rx={baseR * 0.55} ry={baseR * 0.40}
                      fill="url(#cloudVolume)" opacity={palette.cloudOpC} />
                    {/* Center layer — tallest, dominant */}
                    <ellipse cx={mx} cy={my} rx={baseR * 0.72} ry={baseR * 0.50}
                      fill="url(#cloudVolume)" opacity={palette.cloudOpB} />
                    {/* Top puffs — give billowy crown */}
                    <ellipse cx={mx - ux * baseR * 0.25} cy={my - baseR * 0.32} rx={baseR * 0.42} ry={baseR * 0.36}
                      fill={palette.cloudGradTop} opacity={palette.cloudOpA} />
                    <ellipse cx={mx + ux * baseR * 0.25} cy={my - baseR * 0.36} rx={baseR * 0.46} ry={baseR * 0.38}
                      fill={palette.cloudGradTop} opacity={palette.cloudOpA} />
                    {/* Tiny highlight puff */}
                    <ellipse cx={mx - ux * baseR * 0.15} cy={my - baseR * 0.55} rx={baseR * 0.22} ry={baseR * 0.18}
                      fill={palette.cloudGradTop} opacity={palette.cloudOpB * 0.95} />
                  </g>
                </g>
              );
            })}
          </g>


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

          {/* Anekdoten — small bookmark dots */}
          {ANEKDOTEN.map((an) => {
            const p = project(an.coords[0], an.coords[1]);
            const isUnlocked = anekdoten.has(an.id);
            return (
              <g key={an.id} transform={`translate(${p.x},${p.y})`} style={{ cursor: 'pointer' }}>
                <circle r="14" fill="transparent" />
                <circle
                  r={isUnlocked ? 6 : 4}
                  fill={isUnlocked ? palette.anekdoteUnlockedFill : palette.anekdoteLockedFill}
                  stroke={isUnlocked ? palette.anekdoteUnlockedStroke : palette.anekdoteLockedStroke}
                  strokeWidth={isUnlocked ? 1.6 : 1}
                  opacity={isUnlocked ? 1 : 0.55}
                  style={{ transition: 'all 500ms ease-out', filter: isUnlocked ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none' }}
                />
                {isUnlocked && (
                  <text y="2" textAnchor="middle" fontSize="7" fontWeight="900" fill={palette.anekdoteIconColor} pointerEvents="none">!</text>
                )}
              </g>
            );
          })}

          {/* Landmarks */}
          {LANDMARKS.map((lm) => {
            const p = project(lm.coords[0], lm.coords[1]);
            const isUnlocked = stars.has(lm.id);
            const dist = landmarkDistances[lm.id];
            const isNear = dist != null && dist <= NEAR_STAR_HINT_M && !isUnlocked;
            return (
              <g key={lm.id} transform={`translate(${p.x},${p.y})`} style={{ cursor: 'pointer' }}>
                {(isUnlocked || isNear) && (
                  <circle r={isUnlocked ? 28 : 22} fill="url(#starGlow)">
                    {isUnlocked && <animate attributeName="r" values="22;32;22" dur="3s" repeatCount="indefinite" />}
                  </circle>
                )}
                {isUnlocked && (
                  <circle r="18" fill="none" stroke="#C8923C" strokeWidth="0.8" opacity="0.4">
                    <animate attributeName="r" values="14;22;14" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
                  </circle>
                )}
                <path
                  d={STAR_PATH_LG}
                  fill={isUnlocked ? 'url(#starFill)' : palette.starLockedFill}
                  stroke={isUnlocked ? '#7A4A1F' : palette.starLockedStroke}
                  strokeWidth={isUnlocked ? 1.4 : 1.2}
                  strokeLinejoin="round"
                  opacity={isUnlocked ? 1 : 0.55}
                  style={{ filter: isUnlocked ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none', transition: 'opacity 600ms ease-out' }}
                />
                <circle r="22" fill="transparent" />
                <text y="28" textAnchor="middle" fontSize="11" fontFamily="Fraunces, Georgia, serif" fontWeight="700" fill={palette.text} opacity={isUnlocked ? 0.95 : 0.6} style={{ pointerEvents: 'none', paintOrder: 'stroke', stroke: palette.landmarkLabelStroke, strokeWidth: 3, strokeLinejoin: 'round' }}>
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
            const pinY = -22; // disc center is 22px above the location
            // Stagger bob phases so pins don't bob in sync
            const bobDelay = (idx * 0.37) % 2.4;
            return (
              <g key={poi.id} transform={`translate(${p.x},${p.y})`} style={{ cursor: 'pointer' }}>
                {/* Ground shadow */}
                <ellipse cx="0" cy="2" rx="6" ry="1.8" fill={palette.poiPinShadow} opacity="0.7">
                  {!isUnlocked && (
                    <animate attributeName="rx" values="6;7;6" dur="2.4s" begin={`${bobDelay}s`} repeatCount="indefinite" />
                  )}
                </ellipse>

                {/* Open-now soft glow halo */}
                {isOpen && (
                  <circle cx="0" cy={pinY} r="16" fill={colors.bg} opacity="0.22">
                    <animate attributeName="r" values="14;20;14" dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0.10;0.35" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                )}

                <g style={{ filter: isUnlocked ? 'none' : 'grayscale(0.65)', opacity: isUnlocked ? 1 : 0.78, transition: 'filter 600ms ease, opacity 600ms ease' }}>
                  {/* Tail (teardrop) — triangle pointing down */}
                  <path d={`M -5,${pinY + 7} L 0,-2 L 5,${pinY + 7} Z`} fill={colors.bg} filter="url(#poiPinShadow)" />
                  {/* Outer ring (white/cream) */}
                  <circle cx="0" cy={pinY} r="11" fill={palette.streetFill} />
                  {/* Inner colored disc */}
                  <circle cx="0" cy={pinY} r="9" fill={colors.bg} />
                  {/* Inner highlight (subtle gradient) */}
                  <circle cx="-2" cy={pinY - 2} r="3" fill="rgba(255,255,255,0.35)" />

                  {/* Icon */}
                  <PoiIconSvg kind={poi.kind} cx={0} cy={pinY} color={colors.ring} disco={isUnlocked && poi.kind === 'club'} />

                  {/* Bob animation when not visited */}
                  {!isUnlocked && (
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-2.5; 0,0" dur="2.4s" begin={`${bobDelay}s`} repeatCount="indefinite" />
                  )}
                </g>

                {/* Pulse ring when unlocked */}
                {isUnlocked && (
                  <circle cx="0" cy={pinY} r="11" fill="none" stroke={colors.bg} strokeWidth="1.5" opacity="0.5">
                    <animate attributeName="r" values="11;18;11" dur="2.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Hit area */}
                <circle cx="0" cy={pinY} r="14" fill="transparent" />
              </g>
            );
          })}

          {/* User position */}
          {userPos && (
            <g pointerEvents="none">
              {accuracy && !simMode && (
                <circle cx={userPos.x} cy={userPos.y} r={Math.min(60, ((accuracy / LNG_M) / (BOUNDS.maxLng - BOUNDS.minLng)) * VIEWPORT.width)} fill="rgba(200,146,60,0.1)" stroke="rgba(200,146,60,0.3)" strokeWidth="1" />
              )}
              <circle cx={userPos.x} cy={userPos.y} r="22" fill="url(#userPulse)">
                <animate attributeName="r" values="14;28;14" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.1;0.7" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle cx={userPos.x} cy={userPos.y} r="9" fill={palette.userMarkerFill} stroke={palette.userMarkerStroke} strokeWidth="2.5" />
              <circle cx={userPos.x} cy={userPos.y} r="4" fill={palette.userMarkerInner} />
            </g>
          )}

          <rect width={VIEWPORT.width} height={VIEWPORT.height} fill="url(#vignette)" pointerEvents="none" />
        </svg>

        {/* Status card top-left */}
        <div className="absolute top-3 left-3 px-3.5 py-2.5 rounded-xl backdrop-blur-md" style={{ background: palette.cardBg, border: `1px solid ${palette.cardBorder}`, boxShadow: palette.cardShadow, maxWidth: '54%', transition: 'background 600ms ease, border-color 600ms ease' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: level.color, boxShadow: `0 0 0 2px ${level.accent}` }}>
              <LevelIcon size={17} color="#fff" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="text-[18px] leading-none truncate" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, color: level.color, letterSpacing: '-0.01em' }}>
                {level.name}
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] mt-1 opacity-65">
                {pct.toFixed(1)}% · {streetsTouched}/{STREETS.length} Gassen
              </div>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: palette.name === 'night' ? 'rgba(232,226,208,0.15)' : 'rgba(60,40,20,0.12)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressInBracket}%`, background: `linear-gradient(90deg, ${level.color}, ${level.accent})` }} />
            </div>
            {nextLevel ? (
              <div className="flex items-center justify-between mt-1.5 text-[10px] opacity-65">
                <span>nächste Stufe</span>
                <span className="flex items-center gap-1">
                  {NextIcon && <NextIcon size={10} />} {nextLevel.name} bei {nextLevel.threshold}%
                </span>
              </div>
            ) : (
              <div className="text-[10px] opacity-65 mt-1.5 italic">Höchste Stufe erreicht</div>
            )}
          </div>
        </div>

        {/* Stars + stats top-right */}
        <div className="absolute top-3 right-3 px-3 py-2 rounded-xl backdrop-blur-md" style={{ background: palette.cardBg, border: `1px solid ${palette.cardBorder}`, boxShadow: palette.cardShadow, transition: 'background 600ms ease, border-color 600ms ease' }}>
          <div className="flex items-center gap-1.5 justify-end">
            {LANDMARKS.map((lm) => {
              const isUnlocked = stars.has(lm.id);
              return (
                <button key={lm.id} onClick={() => setActiveLandmark(lm)} className="transition active:scale-90" aria-label={lm.name}>
                  <Star size={18} fill={isUnlocked ? '#C8923C' : 'transparent'} color={isUnlocked ? '#7A4A1F' : palette.textMuted} strokeWidth={isUnlocked ? 1.5 : 1.8} />
                </button>
              );
            })}
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] mt-1.5 opacity-65 text-right">
            {stars.size}/{LANDMARKS.length} Wahrzeichen
          </div>
          <div className="flex items-center gap-1 justify-end mt-1 text-[10px] opacity-65">
            <BookOpen size={10} /> {anekdoten.size}/{ANEKDOTEN.length} Anekdoten
          </div>
          <button onClick={() => setShowLokale(true)} className="flex items-center gap-1 justify-end mt-1 text-[10px] opacity-75 transition active:scale-95 ml-auto" aria-label="Alle Lokale ansehen">
            <Martini size={10} /> {pois.size}/{POIS.length} Lokale <ArrowUpRight size={9} className="opacity-60" />
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
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[11px] flex items-center gap-2" style={{ background: 'rgba(200,146,60,0.95)', color: '#2A1F12', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }}>
            <ArrowUpRight size={12} />
            <span>{nextStarHint.lm.name} · {Math.round(nextStarHint.d)} m</span>
          </div>
        )}

        {tracking && nearestPoi && nearestPoi.d > POI_RADIUS_M && nearestPoi.d < 90 && (!nextStarHint || nextStarHint.d >= 250) && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[11px] flex items-center gap-2" style={{
            background: nearestPoi.p.kind === 'bar' ? 'rgba(122,63,95,0.95)' : nearestPoi.p.kind === 'restaurant' ? 'rgba(168,84,44,0.95)' : 'rgba(63,74,143,0.95)',
            color: '#F5E9D0', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
          }}>
            <span>{nearestPoi.p.kind === 'bar' ? '🍸' : nearestPoi.p.kind === 'restaurant' ? '🍴' : '💿'}</span>
            <span>{nearestPoi.p.name} · {Math.round(nearestPoi.d)} m</span>
          </div>
        )}

        {osmStatus === 'loading' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1.5 backdrop-blur-md" style={{ background: palette.cardBg, border: `1px solid ${palette.cardBorder}`, color: palette.textMuted, boxShadow: palette.cardShadow }}>
            <Loader2 size={11} className="animate-spin" />
            <span>Karte wird geladen…</span>
          </div>
        )}

        {simMode && tracking && !demoRunning && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1.5" style={{ background: 'rgba(60,40,20,0.85)', color: '#F5E9D0' }}>
            <Wand2 size={11} /> Auf Karte tippen, um zu „gehen"
          </div>
        )}

        {tracking && (wakeLockActive || bgActive) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1.5" style={{ background: 'rgba(95,123,92,0.92)', color: '#F5E9D0' }}>
            <Moon size={10} /> {bgActive ? 'Hintergrund-Modus' : 'Bildschirm bleibt an'}
          </div>
        )}
      </div>

      <div className="px-4 py-4 flex flex-col gap-3 border-t" style={{ borderColor: palette.bottomBarBorder, background: palette.bottomBarBg, transition: 'background 600ms ease, border-color 600ms ease' }}>
        <button
          onClick={handleStart}
          className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold transition active:scale-[0.98]"
          style={{
            background: tracking ? 'linear-gradient(135deg, #7A3F5F, #5A2D45)' : 'linear-gradient(135deg, #C8923C, #8C5C2A)',
            color: '#F5E9D0',
            boxShadow: '0 4px 12px rgba(60,40,20,0.25), inset 0 1px 0 rgba(255,255,255,0.18)',
            fontFamily: '"Fraunces", Georgia, serif', letterSpacing: '0.01em',
          }}
        >
          {tracking ? <><Pause size={17} /> Tracking pausieren</> : <><Play size={17} /> Erkundung starten</>}
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setSimMode((v) => !v)} className="flex-1 h-10 rounded-lg text-xs flex items-center justify-center gap-2 transition active:scale-[0.98]" style={{ background: simMode ? palette.simModeOnBg : palette.simModeOffBg, color: simMode ? '#F5E9D0' : palette.text }}>
            <Wand2 size={13} /> Simulation {simMode ? 'an' : 'aus'}
          </button>
          <button onClick={demoRunning ? stopDemo : runDemo} className="flex-1 h-10 rounded-lg text-xs flex items-center justify-center gap-2 transition active:scale-[0.98]" style={{ background: demoRunning ? 'rgba(122,63,95,0.92)' : palette.simModeOffBg, color: demoRunning ? '#F5E9D0' : palette.text }}>
            <Navigation size={13} /> {demoRunning ? 'Demo stoppen' : 'Demo-Tour'}
          </button>
        </div>
        <p className="text-[10px] text-center opacity-55 px-4">
          {accuracy && !simMode ? `GPS-Genauigkeit: ±${Math.round(accuracy)} m. ` : ''}
          {wakeLockActive && tracking ? 'Bildschirm bleibt automatisch an. ' : ''}
          Sterne sind Wahrzeichen, kleine Punkte verbergen Geschichten.
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
  const sw = 1.3;
  if (kind === 'bar') {
    // Cocktail glass: triangle + stem + base
    return (
      <g transform={`translate(${cx},${cy})`} pointerEvents="none">
        {/* Bowl (V shape) */}
        <path d="M -4.5,-3.5 L 4.5,-3.5 L 0,2 Z" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        {/* Stem */}
        <line x1="0" y1="2" x2="0" y2="4.4" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        {/* Foot */}
        <line x1="-2.4" y1="4.4" x2="2.4" y2="4.4" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        {/* Olive on a pick */}
        <line x1="2.6" y1="-3.2" x2="0.5" y2="-1" stroke={c} strokeWidth="0.8" />
        <circle cx="0.3" cy="-0.8" r="0.7" fill={c} />
      </g>
    );
  }
  if (kind === 'restaurant') {
    // Crossed fork & knife
    return (
      <g transform={`translate(${cx},${cy})`} pointerEvents="none">
        {/* Fork */}
        <line x1="-2.6" y1="-4.4" x2="-2.6" y2="-1.6" stroke={c} strokeWidth="0.6" />
        <line x1="-1.6" y1="-4.4" x2="-1.6" y2="-1.6" stroke={c} strokeWidth="0.6" />
        <line x1="-3.6" y1="-4.4" x2="-3.6" y2="-1.6" stroke={c} strokeWidth="0.6" />
        <line x1="-2.6" y1="-1.6" x2="2.4" y2="4.4" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        {/* Knife */}
        <path d="M 3.5,-4.6 L 3.5,-0.6 L 2.6,-0.6 L 2.6,-4.0 Z" fill="none" stroke={c} strokeWidth={sw * 0.8} strokeLinejoin="round" />
        <line x1="3" y1="-0.6" x2="-2.6" y2="4.4" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      </g>
    );
  }
  if (kind === 'club') {
    // Disco ball — circle with grid facets
    return (
      <g transform={`translate(${cx},${cy})`} pointerEvents="none">
        <circle r="4.3" fill="none" stroke={c} strokeWidth={sw} />
        {/* Latitude lines */}
        <ellipse cx="0" cy="0" rx="4.3" ry="1.4" fill="none" stroke={c} strokeWidth="0.6" opacity="0.85" />
        <ellipse cx="0" cy="-2" rx="3.8" ry="0.9" fill="none" stroke={c} strokeWidth="0.5" opacity="0.7" />
        <ellipse cx="0" cy="2" rx="3.8" ry="0.9" fill="none" stroke={c} strokeWidth="0.5" opacity="0.7" />
        {/* Longitude */}
        <line x1="0" y1="-4.3" x2="0" y2="4.3" stroke={c} strokeWidth="0.5" opacity="0.85" />
        {/* Hanging string */}
        <line x1="0" y1="-4.3" x2="0" y2="-5.6" stroke={c} strokeWidth="0.6" />
        {/* Sparkle when active */}
        {disco && (
          <g>
            <circle cx="-1.6" cy="-1.6" r="0.6" fill={c}>
              <animate attributeName="opacity" values="1;0;1" dur="1.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="1.8" cy="0.5" r="0.5" fill={c}>
              <animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="-0.5" cy="2" r="0.5" fill={c}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
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
  const poiKind = isPoi ? toast.kind : null;
  const bg = isErr ? 'rgba(120,40,40,0.95)'
    : isStar ? 'linear-gradient(135deg, #C8923C, #8C5C2A)'
    : isAch ? 'linear-gradient(135deg, #7A3F5F, #5A2D45)'
    : isAnek ? 'linear-gradient(135deg, #5F4A6F, #3F2D55)'
    : poiKind === 'bar' ? 'linear-gradient(135deg, #7A3F5F, #4A2541)'
    : poiKind === 'restaurant' ? 'linear-gradient(135deg, #A8542C, #6B3318)'
    : poiKind === 'club' ? 'linear-gradient(135deg, #3F4A8F, #1F274F)'
    : 'rgba(27,58,95,0.95)';
  const Icon = isStar ? Star
    : isAch ? Trophy
    : isAnek ? BookOpen
    : poiKind === 'bar' ? Martini
    : poiKind === 'restaurant' ? UtensilsCrossed
    : poiKind === 'club' ? Disc3
    : Sparkles;
  const label = isStar ? '★ Wahrzeichen entdeckt'
    : isAch ? 'Errungenschaft'
    : isAnek ? 'Anekdote entdeckt'
    : poiKind === 'bar' ? '🍸 Bar besucht'
    : poiKind === 'restaurant' ? '🍴 Restaurant besucht'
    : poiKind === 'club' ? '💿 Club besucht'
    : toast.sub;
  return (
    <div
      key={toast.ts}
      className="fixed left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl flex items-center gap-2.5 animate-toast"
      style={{ top: '120px', background: bg, color: '#F5E9D0', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', maxWidth: '90%', zIndex: 30 }}
    >
      <Icon size={16} fill={isStar ? '#FFE9B0' : 'none'} />
      <div className="min-w-0">
        <div className="text-sm leading-tight truncate" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 }}>
          {toast.title}
        </div>
        <div className="text-[10px] opacity-80 uppercase tracking-wider">
          {label}
        </div>
      </div>
    </div>
  );
}

function LegendModal({ onClose, pct, levelIdx }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(20,15,10,0.55)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-5 max-h-[85vh] overflow-y-auto" style={{ background: '#F5E9D0', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '20px' }}>Wie funktioniert's?</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(60,40,20,0.1)' }}><X size={16} /></button>
        </div>
        <p className="text-sm opacity-80 leading-relaxed mb-4">
          Lauf durch die Altstadt — jede Gasse wird von Wolken befreit. Sterne markieren Wahrzeichen, kleine Punkte verbergen Geschichten.
        </p>

        <h3 className="text-[11px] uppercase tracking-[0.18em] opacity-65 mb-2 mt-4 flex items-center gap-1.5">
          <Star size={11} fill="#C8923C" stroke="none" /> Sterne (Wahrzeichen)
        </h3>
        <p className="text-[12px] opacity-75 leading-relaxed mb-3">
          Vier Wahrzeichen, vier Sterne. Sie sind als feine Konturen sichtbar — auch noch nicht eingesammelt — damit du dich sofort orientieren kannst. Komm näher als 32 m, um sie freizuschalten.
        </p>

        <h3 className="text-[11px] uppercase tracking-[0.18em] opacity-65 mb-2 mt-4 flex items-center gap-1.5">
          <BookOpen size={11} /> Anekdoten (Geschichten)
        </h3>
        <p className="text-[12px] opacity-75 leading-relaxed mb-3">
          {ANEKDOTEN.length} versteckte Geschichten warten in den Gassen — Lenins Wohnung, das Cabaret Voltaire, römische Spuren. Komm an einem Punkt vorbei, um die Geschichte zu lesen.
        </p>

        <h3 className="text-[11px] uppercase tracking-[0.18em] opacity-65 mb-2 mt-4 flex items-center gap-1.5">
          <Martini size={11} /> Lokale (Bars · Restaurants · Clubs)
        </h3>
        <p className="text-[12px] opacity-75 leading-relaxed mb-3">
          {POIS.length} ausgewählte Adressen — die besten Bars (🍸), legendäre Restaurants (🍴) und Clubs (💿) der Altstadt. Pin-Marker über der Karte. Komm näher als 28 m, um sie zu „besuchen" und Details freizuschalten.
        </p>

        <h3 className="text-[11px] uppercase tracking-[0.18em] opacity-65 mb-2 mt-4 flex items-center gap-1.5">
          Karte aus OpenStreetMap
        </h3>
        <p className="text-[12px] opacity-75 leading-relaxed mb-3">
          Häuser, Strassen, Parks und Wasserflächen kommen direkt von OpenStreetMap — millimetergenau und immer aktuell. Die hellen, hervorgehobenen Strecken sind die Gassen, die du bereits freigeschaltet hast.
        </p>

        <h3 className="text-[11px] uppercase tracking-[0.18em] opacity-65 mb-2 mt-4">Stufen</h3>
        <div className="space-y-1.5">
          {LEVELS.map((lv, i) => {
            const Icon = lv.icon;
            const reached = pct >= lv.threshold;
            return (
              <div key={lv.name} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: i === levelIdx ? 'rgba(200,146,60,0.15)' : 'transparent', opacity: reached ? 1 : 0.45 }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: lv.color }}>
                  <Icon size={15} color="#fff" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '14px', color: lv.color }}>{lv.name}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-60">ab {lv.threshold}%</span>
                  </div>
                  <div className="text-[11px] opacity-70 leading-tight">{lv.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="text-[11px] uppercase tracking-[0.18em] opacity-65 mb-2 mt-5">Hintergrund-Modus</h3>
        <p className="text-[12px] opacity-75 leading-relaxed">
          Während des Trackings hält der Bildschirm sich aktiv. Fortschritt wird automatisch gespeichert. Echtes Hintergrund-Tracking bei geschlossener App folgt mit der nativen Version.
        </p>
      </div>
    </div>
  );
}

function AchievementsModal({ onClose, earned, pct, stars, anekdoten, pois, distance, elapsed }) {
  const total = ACHIEVEMENTS.length;
  const poisSize = pois ? pois.size : 0;
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(20,15,10,0.55)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-5 max-h-[88vh] overflow-y-auto" style={{ background: '#F5E9D0', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '20px' }}>Errungenschaften</h2>
            <p className="text-[11px] uppercase tracking-[0.18em] opacity-60 mt-0.5">{earned.size} von {total}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(60,40,20,0.1)' }}><X size={16} /></button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Erkundung', value: `${pct.toFixed(1)}%`, icon: Compass },
            { label: 'Wahrzeichen', value: `${stars.size}/${LANDMARKS.length}`, icon: Star },
            { label: 'Anekdoten', value: `${anekdoten.size}/${ANEKDOTEN.length}`, icon: BookOpen },
            { label: 'Lokale', value: `${poisSize}/${POIS.length}`, icon: Martini },
            { label: 'Strecke', value: fmtDist(distance), icon: Route },
            { label: 'Zeit', value: fmtTime(elapsed), icon: Clock },
          ].map((stat) => {
            const I = stat.icon;
            return (
              <div key={stat.label} className="p-2.5 rounded-lg" style={{ background: 'rgba(60,40,20,0.06)' }}>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-60">
                  <I size={10} /> {stat.label}
                </div>
                <div className="mt-1 text-base tabular-nums" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 }}>
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Errungenschafts-Fortschritt</div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(60,40,20,0.12)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(earned.size / total) * 100}%`, background: 'linear-gradient(90deg, #C8923C, #FFE9B0)' }} />
          </div>
        </div>

        <h3 className="text-[11px] uppercase tracking-[0.18em] opacity-65 mb-2">Abzeichen</h3>
        <div className="space-y-2">
          {ACHIEVEMENTS.map((a) => {
            const isEarned = earned.has(a.id);
            const Icon = a.icon;
            return (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: isEarned ? 'rgba(200,146,60,0.12)' : 'rgba(60,40,20,0.04)', opacity: isEarned ? 1 : 0.6 }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative" style={{ background: isEarned ? a.color : 'rgba(60,40,20,0.15)' }}>
                  {isEarned ? <Icon size={16} color="#fff" strokeWidth={2.2} /> : <Lock size={14} color="rgba(60,40,20,0.5)" />}
                  {isEarned && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#5F7B5C' }}>
                      <CheckCircle2 size={10} color="#fff" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '13px', color: isEarned ? a.color : '#2A1F12' }}>
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
    if (s < 60) return 'gerade eben';
    const m = Math.floor(s / 60);
    if (m < 60) return `vor ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `vor ${h} Std`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'gestern';
    if (d < 7) return `vor ${d} Tagen`;
    return new Date(ts).toLocaleDateString('de-CH', { day: '2-digit', month: 'short' });
  };
  const groupOf = (ts) => {
    const d = new Date(ts);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 86400000);
    const dDay = new Date(d); dDay.setHours(0, 0, 0, 0);
    if (dDay.getTime() === today.getTime()) return 'Heute';
    if (dDay.getTime() === yesterday.getTime()) return 'Gestern';
    return 'Früher';
  };

  const grouped = useMemo(() => {
    const out = { Heute: [], Gestern: [], Früher: [] };
    entries.forEach((e) => out[groupOf(e.ts)].push(e));
    return out;
  }, [entries]);

  const iconFor = (type) => {
    const map = { street: MapPin, star: Star, anekdote: BookOpen, achievement: Award, level: Crown, chapter: Crown };
    return map[type] || Footprints;
  };
  const colorFor = (type) => {
    const map = { street: '#1B3A5F', star: '#C8923C', anekdote: '#7A3F5F', achievement: '#5F7B5C', level: '#A06840', chapter: '#C8923C' };
    return map[type] || '#5C3F22';
  };
  const labelFor = (type) => {
    const map = { street: 'Gasse', star: 'Wahrzeichen', anekdote: 'Anekdote', achievement: 'Errungenschaft', level: 'Neuer Rang', chapter: 'Kapitel' };
    return map[type] || '';
  };

  const total = entries.length;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(20,15,10,0.55)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[88vh] flex flex-col" style={{ background: '#F5E9D0', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-start justify-between" style={{ background: 'linear-gradient(135deg, #5C3F22, #3F2A14)', color: '#F5E9D0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,233,208,0.18)' }}>
              <NotebookPen size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '20px' }}>Tagebuch</h2>
              <p className="text-[11px] opacity-80 mt-0.5">{total} {total === 1 ? 'Eintrag' : 'Einträge'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}><X size={16} /></button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex-1">
          {total === 0 ? (
            <div className="text-center py-10">
              <Feather size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm opacity-65 leading-relaxed" style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic' }}>
                Noch keine Entdeckungen.<br />
                Fang an zu erkunden, um deine Reise zu dokumentieren.
              </p>
            </div>
          ) : (
            ['Heute', 'Gestern', 'Früher'].map((group) => {
              const items = grouped[group];
              if (!items || items.length === 0) return null;
              return (
                <div key={group} className="mb-4 last:mb-0">
                  <h3 className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-2 sticky top-0 py-1" style={{ background: '#F5E9D0' }}>
                    {group}
                  </h3>
                  <div className="space-y-1.5">
                    {items.map((entry) => {
                      const Icon = iconFor(entry.type);
                      const color = colorFor(entry.type);
                      return (
                        <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: 'rgba(60,40,20,0.04)' }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: color }}>
                            <Icon size={14} color="#fff" strokeWidth={2.2} fill={entry.type === 'star' ? '#FFE9B0' : 'none'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <div className="text-[13px] truncate" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, color }}>
                                {entry.name}
                              </div>
                              <div className="text-[10px] opacity-60 shrink-0 tabular-nums">{fmtRelative(entry.ts)}</div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] opacity-65 mt-0.5">
                              <span className="uppercase tracking-wider">{labelFor(entry.type)}</span>
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
      className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition active:scale-[0.99]"
      style={{ background: 'rgba(60,40,20,0.05)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: on ? '#C8923C' : 'rgba(60,40,20,0.15)' }}>
        <I size={16} color={on ? '#F5E9D0' : 'rgba(60,40,20,0.6)'} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px]" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 }}>{label}</div>
        <div className="text-[11px] opacity-65 leading-tight">{desc}</div>
      </div>
      <div className="w-10 h-6 rounded-full relative shrink-0" style={{ background: on ? '#C8923C' : 'rgba(60,40,20,0.2)', transition: 'background 200ms' }}>
        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white" style={{ left: on ? '20px' : '2px', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
    </button>
  );

  const themeOptions = [
    { id: 'auto',  label: 'Automatisch', desc: 'Nachts dunkel, tagsüber hell' },
    { id: 'day',   label: 'Tag',         desc: 'Pergament-Karte, hell' },
    { id: 'night', label: 'Nacht',       desc: 'Sternenhimmel, Lampenlicht' },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(20,15,10,0.55)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-5 max-h-[88vh] overflow-y-auto" style={{ background: '#F5E9D0', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '20px' }}>Einstellungen</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(60,40,20,0.1)' }}><X size={16} /></button>
        </div>

        <h3 className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-2 flex items-center gap-1.5">
          Erscheinung
          {settings.themeMode === 'auto' && (
            <span className="text-[9px] normal-case tracking-normal opacity-80 px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(60,40,20,0.08)' }}>
              gerade: {themeName === 'night' ? 'Nacht' : 'Tag'}
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
                className="relative p-3 rounded-xl text-left transition active:scale-[0.97] overflow-hidden"
                style={{
                  background: isActive
                    ? (isNight ? 'linear-gradient(135deg, #1f2541, #0a0e1c)' : isDay ? 'linear-gradient(135deg, #efe1c4, #C8923C)' : 'linear-gradient(135deg, #C8923C, #8C5C2A)')
                    : 'rgba(60,40,20,0.05)',
                  color: isActive ? '#F5E9D0' : '#2A1F12',
                  boxShadow: isActive ? '0 4px 12px rgba(60,40,20,0.25)' : 'none',
                  border: isActive ? 'none' : '1px solid rgba(60,40,20,0.1)',
                }}
              >
                {/* Decorative miniature */}
                {isNight && isActive && (
                  <div className="absolute top-1 right-1 opacity-70">
                    <svg width="20" height="20"><circle cx="6" cy="6" r="0.8" fill="#F5E9D0" /><circle cx="14" cy="9" r="0.6" fill="#F5E9D0" /><circle cx="10" cy="14" r="0.7" fill="#F5E9D0" /></svg>
                  </div>
                )}
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1.5" style={{ background: isActive ? 'rgba(245,233,208,0.2)' : 'rgba(60,40,20,0.08)' }}>
                  {opt.id === 'auto' ? (
                    <div className="text-[14px]" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 }}>A</div>
                  ) : Icon ? (
                    <Icon size={15} color={isActive ? '#F5E9D0' : '#2A1F12'} />
                  ) : null}
                </div>
                <div className="text-[12px] leading-tight" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 }}>
                  {opt.label}
                </div>
                <div className="text-[9px] opacity-75 leading-tight mt-0.5">{opt.desc}</div>
              </button>
            );
          })}
        </div>

        <h3 className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-2">Sinneserlebnis</h3>
        <div className="space-y-2 mb-5">
          <Toggle
            on={settings.soundOn}
            onChange={() => {
              if (!settings.soundOn) { getAudioCtx(); SFX.street(); }
              setSettings((s) => ({ ...s, soundOn: !s.soundOn }));
            }}
            label="Klänge"
            desc="Sanfte Töne bei jeder Entdeckung"
            icon={settings.soundOn ? Volume2 : VolumeX}
          />
          <Toggle
            on={settings.hapticsOn && vibrateSupported}
            onChange={() => setSettings((s) => ({ ...s, hapticsOn: !s.hapticsOn }))}
            label="Vibration"
            desc={vibrateSupported ? 'Haptisches Feedback auf dem Smartphone' : 'Auf diesem Gerät nicht verfügbar'}
            icon={Vibrate}
            disabled={!vibrateSupported}
          />
        </div>

        <h3 className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-2">Hilfe</h3>
        <div className="p-3 rounded-lg mb-5" style={{ background: 'rgba(60,40,20,0.05)' }}>
          <div className="text-[12px] leading-relaxed opacity-80">
            <p className="mb-2">
              <strong style={{ fontFamily: '"Fraunces", Georgia, serif' }}>Sterne</strong> markieren Wahrzeichen — komm näher als 32 m.
            </p>
            <p className="mb-2">
              <strong style={{ fontFamily: '"Fraunces", Georgia, serif' }}>Anekdoten</strong> sind versteckte Geschichten — komm näher als 28 m.
            </p>
            <p>
              <strong style={{ fontFamily: '"Fraunces", Georgia, serif' }}>Gassen</strong> werden bei 22 m Annäherung von Wolken befreit.
            </p>
          </div>
        </div>

        <h3 className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-2">Über</h3>
        <p className="text-[11px] opacity-60 leading-relaxed mb-5 px-1">
          Altstadt-Entdecker · Kapitel I (Zürich)<br />
          Eine Reise durch Wolken, eine Gasse nach der anderen.
        </p>

        <h3 className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-2">Daten</h3>
        <button
          onClick={onReset}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition active:scale-[0.99]"
          style={{ background: 'rgba(122,63,95,0.1)', border: '1px solid rgba(122,63,95,0.25)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#7A3F5F' }}>
            <RefreshCw size={16} color="#F5E9D0" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px]" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, color: '#7A3F5F' }}>
              Fortschritt zurücksetzen
            </div>
            <div className="text-[11px] opacity-65 leading-tight">Alle Wolken erscheinen wieder</div>
          </div>
        </button>
      </div>
    </div>
  );
}

function LandmarkModal({ lm, unlocked, dist, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(20,15,10,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden animate-popIn" style={{ background: '#F5E9D0', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 relative" style={{ background: unlocked ? 'linear-gradient(135deg, #C8923C, #8C5C2A)' : 'linear-gradient(135deg, #5C3F22, #3F2A14)', color: '#F5E9D0' }}>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}><X size={16} /></button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: unlocked ? '#FFE9B0' : 'rgba(245,233,208,0.2)' }}>
              {unlocked ? <Star size={26} fill="#C8923C" color="#7A4A1F" strokeWidth={1.5} /> : <Lock size={20} color="#F5E9D0" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">{unlocked ? 'Eingesammelt' : 'Noch nicht entdeckt'}</div>
              <h2 className="leading-tight" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '22px', letterSpacing: '-0.01em' }}>
                {lm.name}
              </h2>
              <div className="text-xs opacity-80 mt-0.5">{lm.intro}</div>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed">{lm.desc}</p>
          {lm.insider && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(200,146,60,0.12)', border: '1px solid rgba(200,146,60,0.3)' }}>
              <div className="text-[10px] uppercase tracking-[0.18em] opacity-65 mb-0.5 flex items-center gap-1">
                <Sparkles size={10} /> Insider-Tipp
              </div>
              <div className="text-[12px] leading-relaxed">{lm.insider}</div>
            </div>
          )}
          {!unlocked && dist != null && (
            <div className="mt-3 text-[12px] opacity-75 flex items-center gap-1.5">
              <Navigation size={12} /> ca. {Math.round(dist)} m entfernt — komm näher als 32 m, um den Stern einzusammeln.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnekdoteModal({ an, unlocked, dist, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(20,15,10,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden animate-popIn" style={{ background: '#F5E9D0', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 relative" style={{ background: unlocked ? 'linear-gradient(135deg, #7A3F5F, #5A2D45)' : 'linear-gradient(135deg, #4A3F5F, #2D2545)', color: '#F5E9D0' }}>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}><X size={16} /></button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: unlocked ? 'rgba(245,233,208,0.25)' : 'rgba(245,233,208,0.12)' }}>
              {unlocked ? <BookOpen size={22} color="#F5E9D0" strokeWidth={2} /> : <Lock size={18} color="#F5E9D0" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">{unlocked ? 'Anekdote' : 'Noch nicht entdeckt'}</div>
              <h2 className="leading-tight" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.01em' }}>
                {an.name}
              </h2>
              <div className="text-xs opacity-80 mt-0.5">{an.intro}</div>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          {unlocked ? (
            <p className="text-sm leading-relaxed" style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic' }}>
              {an.desc}
            </p>
          ) : (
            <p className="text-sm leading-relaxed opacity-70">
              Die Geschichte enthüllt sich, sobald du diesen Ort persönlich besuchst.
            </p>
          )}
          {!unlocked && dist != null && (
            <div className="mt-3 text-[12px] opacity-75 flex items-center gap-1.5">
              <Navigation size={12} /> ca. {Math.round(dist)} m entfernt — komm näher als 28 m.
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
    ? (poi.kind === 'bar' ? 'linear-gradient(135deg, #7A3F5F, #4A2541)'
        : poi.kind === 'restaurant' ? 'linear-gradient(135deg, #A8542C, #6B3318)'
        : 'linear-gradient(135deg, #3F4A8F, #1F274F)')
    : 'linear-gradient(135deg, #5A4D5A, #2D262D)';
  const accentEmoji = poi.kind === 'bar' ? '🍸' : poi.kind === 'restaurant' ? '🍴' : '💿';
  const h = new Date().getHours();
  const isOpen = poi.kind === 'bar' ? (h >= 17 || h < 2)
    : poi.kind === 'restaurant' ? ((h >= 11 && h < 14) || (h >= 18 && h < 23))
    : (h >= 22 || h < 4);
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(20,15,10,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden animate-popIn" style={{ background: '#F5E9D0', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 relative" style={{ background: headerBg, color: '#F5E9D0' }}>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}><X size={16} /></button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: unlocked ? 'rgba(245,233,208,0.25)' : 'rgba(245,233,208,0.12)' }}>
              {unlocked ? <Icon size={22} color="#F5E9D0" strokeWidth={2} /> : <Lock size={18} color="#F5E9D0" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">{accentEmoji} {unlocked ? `${kindLabel} besucht` : kindLabel}</div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider" style={{ background: isOpen ? 'rgba(154,208,143,0.25)' : 'rgba(0,0,0,0.25)', color: '#F5E9D0' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: isOpen ? '#9AD08F' : 'rgba(245,233,208,0.5)' }} />
                  {isOpen ? 'offen' : 'zu'}
                </div>
              </div>
              <h2 className="leading-tight" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.01em' }}>
                {poi.name}
              </h2>
              <div className="text-xs opacity-80 mt-0.5">{poi.intro}</div>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          {unlocked ? (
            <p className="text-sm leading-relaxed" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
              {poi.desc}
            </p>
          ) : (
            <p className="text-sm leading-relaxed opacity-70">
              Geh hin, schau rein — die Beschreibung schaltet sich frei, sobald du näher als 28 m kommst.
            </p>
          )}
          {!unlocked && dist != null && (
            <div className="mt-3 text-[12px] opacity-75 flex items-center gap-1.5">
              <Navigation size={12} /> ca. {Math.round(dist)} m entfernt
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
    { id: 'all', label: 'Alle', count: POIS.length },
    { id: 'bar', label: 'Bars', count: barCount, icon: Martini },
    { id: 'restaurant', label: 'Restaurants', count: restCount, icon: UtensilsCrossed },
    { id: 'club', label: 'Clubs', count: clubCount, icon: Disc3 },
    { id: 'visited', label: 'Besucht', count: visitedCount, icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(20,15,10,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl max-h-[88vh] overflow-hidden flex flex-col" style={{ background: '#F5E9D0', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-3 border-b" style={{ borderColor: 'rgba(60,40,20,0.12)' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: '20px' }}>Lokale</h2>
              <p className="text-[11px] uppercase tracking-[0.18em] opacity-60 mt-0.5">{visitedCount} von {POIS.length} besucht</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(60,40,20,0.1)' }}><X size={16} /></button>
          </div>
          {/* Filter chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
            {filters.map((f) => {
              const isActive = filter === f.id;
              const Icon = f.icon;
              return (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-[12px] flex items-center gap-1.5 transition active:scale-95"
                  style={{
                    background: isActive ? '#2A1F12' : 'rgba(60,40,20,0.08)',
                    color: isActive ? '#F5E9D0' : '#2A1F12',
                    fontWeight: isActive ? 600 : 500,
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
              Keine Einträge in dieser Kategorie.
            </div>
          ) : filtered.map((p) => {
            const Icon = p.kind === 'bar' ? Martini : p.kind === 'restaurant' ? UtensilsCrossed : Disc3;
            const accent = p.kind === 'bar' ? '#7A3F5F' : p.kind === 'restaurant' ? '#A8542C' : '#3F4A8F';
            const h = new Date().getHours();
            const isOpen = p.kind === 'bar' ? (h >= 17 || h < 2)
              : p.kind === 'restaurant' ? ((h >= 11 && h < 14) || (h >= 18 && h < 23))
              : (h >= 22 || h < 4);
            return (
              <button
                key={p.id}
                onClick={() => { onSelect(p); onClose(); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg transition active:scale-[0.99] text-left"
                style={{ background: p.visited ? 'rgba(200,146,60,0.10)' : 'transparent' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative" style={{ background: p.visited ? accent : 'rgba(60,40,20,0.12)' }}>
                  {p.visited ? <Icon size={16} color="#F5E9D0" /> : <Icon size={15} color="rgba(60,40,20,0.5)" />}
                  {p.visited && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#5F7B5C' }}>
                      <CheckCircle2 size={9} color="#fff" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="text-sm font-semibold truncate" style={{ fontFamily: '"Fraunces", Georgia, serif', color: p.visited ? '#2A1F12' : 'rgba(42,31,18,0.7)' }}>
                      {p.name}
                    </div>
                    {isOpen && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#5F7B5C' }} title="jetzt offen" />}
                  </div>
                  <div className="text-[11px] opacity-65 truncate">{p.intro}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-wider opacity-55" style={{ color: accent }}>
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
  const I = level.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(20,15,10,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="text-center px-6 py-8 rounded-3xl max-w-sm relative overflow-hidden animate-popIn" style={{ background: `linear-gradient(135deg, ${level.accent}, #F5E9D0 60%, ${level.accent})`, boxShadow: `0 24px 60px rgba(0,0,0,0.4), 0 0 0 3px ${level.color}` }} onClick={(e) => e.stopPropagation()}>
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: level.color, boxShadow: `0 0 0 6px ${level.accent}, 0 8px 24px rgba(0,0,0,0.25)` }}>
          <I size={36} color="#fff" strokeWidth={2} />
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] opacity-65 mb-1">Neuer Rang</div>
        <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 900, fontSize: '38px', color: level.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {level.name}
        </h2>
        <p className="mt-3 text-sm opacity-80 leading-snug">{level.desc}</p>
        <button onClick={onClose} className="mt-5 px-6 py-2.5 rounded-full text-sm font-semibold transition active:scale-95" style={{ background: level.color, color: '#F5E9D0', fontFamily: '"Fraunces", Georgia, serif' }}>
          Weiter erkunden
        </button>
      </div>
    </div>
  );
}

function ChapterCompleteModal({ stars, anekdoten, pois, elapsed, distance, onClose, onBack }) {
  const poisVal = pois != null ? pois : 0;
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(20,15,10,0.78)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => {
          const colors = ['#C8923C', '#FFE9B0', '#7A3F5F', '#5F7B5C', '#3F6E72'];
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

      <div className="relative max-w-md w-full text-center px-6 py-8 rounded-3xl animate-popIn" style={{ background: 'linear-gradient(135deg, #F5E9D0, #FFE9B0 50%, #F5E9D0)', boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 3px #C8923C' }} onClick={(e) => e.stopPropagation()}>
        <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #C8923C, #8C5C2A)', boxShadow: '0 0 0 8px rgba(200,146,60,0.2), 0 8px 24px rgba(0,0,0,0.3)' }}>
          <Crown size={44} color="#F5E9D0" strokeWidth={1.8} />
        </div>
        <p className="text-[11px] uppercase tracking-[0.35em] opacity-70 mb-1" style={{ color: '#7A4A1F' }}>Kapitel I abgeschlossen</p>
        <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 900, fontSize: '36px', color: '#7A4A1F', letterSpacing: '-0.02em', lineHeight: 1 }}>
          Altstadt erobert
        </h2>
        <p className="mt-3 text-sm leading-relaxed opacity-80 px-2" style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic' }}>
          Du hast jede Gasse berührt, jeden Stein gesehen — die Wolken sind verschwunden, die Stadt ist deine.
        </p>
        <div className="grid grid-cols-3 gap-2 mt-5 mb-5">
          <Stat icon={Star} value={`${stars}/${LANDMARKS.length}`} label="Wahrzeichen" />
          <Stat icon={BookOpen} value={`${anekdoten}/${ANEKDOTEN.length}`} label="Anekdoten" />
          <Stat icon={Martini} value={`${poisVal}/${POIS.length}`} label="Lokale" />
          <Stat icon={Route} value={fmtDist(distance)} label="Strecke" />
          <Stat icon={Clock} value={fmtTime(elapsed)} label="Zeit" />
          <Stat icon={Trophy} value="100%" label="Erkundet" />
        </div>
        <button onClick={onBack} className="w-full h-12 rounded-xl font-semibold transition active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #C8923C, #8C5C2A)', color: '#F5E9D0', fontFamily: '"Fraunces", Georgia, serif', boxShadow: '0 6px 18px rgba(200,146,60,0.4)' }}>
          Zum nächsten Kapitel
        </button>
        <button onClick={onClose} className="mt-2 text-xs opacity-65">Hier bleiben</button>
      </div>
    </div>
  );
}

function Stat({ icon: I, value, label }) {
  return (
    <div className="p-2.5 rounded-lg text-left" style={{ background: 'rgba(122,74,31,0.08)' }}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-60" style={{ color: '#7A4A1F' }}>
        <I size={10} /> {label}
      </div>
      <div className="mt-0.5 text-base tabular-nums" style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, color: '#7A4A1F' }}>
        {value}
      </div>
    </div>
  );
}
