# Anubis & the Golem

A short first-person narrative point-and-click game.

## Team
- Jonathan Quiben
- Lital Bamnulker

## Description
You play as Anubis, deep inside your own pyramid. You have stolen a word
from the wandering tribe at the river — *emet* (אמת), the word that wakes
clay. Explore the chambers, gather what you need, and assemble a Golem on
the sarcophagus. When it wakes, it sees the Hebrew slaves outside the
pyramid walls, and a quiet conversation follows about whose side it is on.

## How to run
This is a static site with no build step.

Recommended (a static server, since some browsers block local image loads):

```
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

Or, if `python3` is unavailable: `npx serve .`

You can also try opening `index.html` directly in a browser, but local
file:// loading is unreliable.

## Tech
- HTML
- CSS
- Vanilla JavaScript (no framework, no build tool)

## Project layout
```
.
├── index.html              # scene markup, HUD, SVG defs (god-rays, heat-haze filter), music toggle
├── style.css               # absolute-positioning + theme + atmospheric effects
├── script.js               # scene data, render loop, dialogue, god-rays, shimmer, audio
└── assets/
    ├── workshop.jpeg            # Scene 1 — tomb chamber with sarcophagus
    ├── workshop_top.jpeg        # close-up of the empty sarcophagus (assembly view)
    ├── storeroom.jpeg           # Scene 2 — pots, baskets, torch
    ├── scroll_archive.jpeg      # Scene 3 — scroll archive with oil lamp
    ├── anubis.png               # Anubis full-body portrait (unused, available)
    ├── anubis_poses.png         # Anubis three-pose sheet (dialogue portraits)
    ├── golem pose1.png          # Golem portrait — first line
    ├── golem pose2.png          # Golem portrait — second line
    ├── golem pose3.png          # Golem portrait — decision moment
    ├── golen 1.png              # Fully-assembled Golem (fades in on completion)
    ├── swoosh.wav               # Scene-transition SFX
    └── golemmusicdraft.wav      # Looping background music
```

## What's implemented

### Story + interaction
- **4 scenes** — `workshop` (hub), `storeroom`, `scroll_archive`,
  `assembly` (top-down sarcophagus close-up).
- **Hotspot tooltips** on click — descriptions and/or scene transitions.
- **4 collectable materials** — `clay` and `natron` in the storeroom;
  `scroll-emet` and `heart-amulet` in the scroll archive.
- **Inventory** — click an item in the inventory bar to select it
  (gold outline). Click again to deselect.
- **Assembly puzzle** — click a pulsing slot on the sarcophagus while an
  item is selected to place it; wrong items are rejected.
- **Assembled-golem reveal** — once all four materials are placed,
  `golen 1.png` fades in over the basin, then the awakening dialogue
  begins.
- **Branching dialogue system** with Anubis + Golem PNG portraits.
  Dialogue box is fixed-size so the Continue button doesn't jump
  between lines. Intro plays on load; the Golem-awakens scene triggers
  automatically once the puzzle completes and ends with a 2-way player
  choice → two distinct endings.

### Atmosphere
- **Zoom-and-fade scene transitions** — clicking a doorway hotspot
  zooms the world toward the click origin while fading to black, swaps
  the scene, then zooms back in. A `swoosh.wav` plays alongside.
- **Dynamic god rays** — an SVG overlay paints volumetric light rays
  from a per-scene source point, with each ray pulsing independently.
  The mouse casts a real-time shadow cone (cursor occluder + projected
  wedge) that "blocks" the light. Configured per-scene on each scene
  object: `sourceXFrac`, `sourceYFrac`, `numRays`, `spreadDeg`,
  `tiltDeg`, `rayWidthFrac`, `rayLengthFrac`, `fadeEndFrac`,
  `sideBlurFrac`.
- **Heat-haze shimmer over fire** — each scene's `fires: [...]` array
  declares positions of candles/torches/lamps; each spot gets a
  `backdrop-filter`-driven displacement-map warp whose turbulence is
  morphed each frame, so the air above the flames feels alive.
- **Background music + mute toggle** — looping `golemmusicdraft.wav`,
  loaded asynchronously so the page is interactive immediately. Mute
  button (circular amber, top-left) toggles `muted` and shows a
  diagonal strike when off.

## Tuning notes
- Each scene's `godRays: {...}` block merges over `godRays.defaults` in
  `script.js`. Only override what differs.
- Each scene's `fires: [...]` block lists `{ top, left, width, height }`
  for warm spots. The filter itself is global; intensity is set by
  `<feDisplacementMap scale="...">` in `index.html`.
- The music's default volume is `0.4` (`music.volume = …` in
  `script.js`); raise/lower there.
