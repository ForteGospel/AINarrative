# Anubis & the Golem

A short first-person narrative point-and-click game.

## Team
- [name 1]
- [name 2]

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
cd game
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
game/
├── index.html        # scene markup: bg image, hotspot/item layers, message, inventory, dialogue
├── style.css         # absolute-positioning + theme
├── script.js         # scene data, render loop, message/inventory/dialogue
└── assets/
    ├── workshop.jpeg       # Scene 1 — tomb chamber with sarcophagus
    ├── workshop_top.jpeg   # close-up of the empty sarcophagus (for assembly view)
    ├── storeroom.jpeg      # Scene 2 — pots, baskets, torch
    ├── scroll_archive.jpeg # (future) scroll-archive scene
    ├── anubis.jpeg         # Anubis full-body portrait
    └── anubis_poses.jpeg   # Anubis three-pose sheet (for dialogue portraits)
```

## What's implemented
- **4 scenes** — `workshop` (hub), `storeroom`, `scroll_archive`,
  `assembly` (top-down sarcophagus close-up).
- **Hotspot tooltips** on click — descriptions and/or scene transitions.
- **4 collectable materials** — `clay` and `natron` in the storeroom;
  `scroll-emet` and `heart-amulet` in the scroll archive.
- **Inventory** — click an item in the inventory bar to select it
  (gold outline). Click again to deselect.
- **Assembly puzzle** — click a pulsing slot on the sarcophagus while an
  item is selected to place it; wrong items are rejected.
- **Branching dialogue system** with Anubis portraits (cropped from the
  `anubis_poses.jpeg` 3-pose sheet) and a CSS-shape Golem silhouette.
  Intro plays on load; the Golem-awakens scene triggers automatically
  once all four materials are placed, and ends with a 2-way player
  choice → two distinct endings.

That's already **3 distinct interaction types** (hotspot inspect + scene
transition, item pickup, assembly placement) plus dialogue plus 4 scenes
— comfortably over the brief's minimums.

## What's left
- **Visual polish**: the Anubis portraits use the JPEG-with-checkerboard
  pose sheet. `mix-blend-mode: multiply` hides most of the gray, but for
  a clean look the pose sheet should be re-exported as a **transparent
  PNG**. Replace `assets/anubis_poses.jpeg` with `assets/anubis_poses.png`
  and update the three `background-image` URLs in `style.css`.
- **Hotspot/slot position tuning**: every `top`/`left` percentage is a
  first guess. Uncomment the debug background in `.hotspot` (style.css)
  while playtesting to drag them to the right pixels.
- **Sound** — ambient pyramid tone + creak when the Golem wakes.
- **Per-material sprite art** — replace the brown radial-gradient
  placeholder with distinct sprites for clay / natron / scroll / amulet.
- **Sarcophagus prompt** — currently the player has to discover that the
  glowing dashed circles are placement targets. A one-line on-enter
  hint ("place the materials you have gathered") would help.
