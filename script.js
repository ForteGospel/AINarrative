// ------------------------------------------------------------------
// Anubis & the Golem — scaffold
//
// Vanilla JS, no build step. Mirrors presentation_examples/script.js:
//   - percent-positioned hotspots over a background image
//   - inventory pickup + message tooltip + scene-state change
// Extended with:
//   - 4 scenes (workshop, storeroom, scroll_archive, assembly)
//   - 4 collectable materials
//   - assembly puzzle (click inventory to select, click slot to place)
//   - branching dialogue system with Anubis portraits + 2 endings
// ------------------------------------------------------------------

// --- Scene data ----------------------------------------------------
// Hotspots and items are positioned by `top` / `left` percentages
// relative to the background image. Toggle the debug background in
// style.css (.hotspot { background: ... }) while tuning positions.
const scenes = {
  workshop: {
    bg: "assets/workshop.jpeg",
    godRays: {
      sourceXFrac: 0.49,
      sourceYFrac: -0.2,
      numRays: 10,
      spreadDeg: 35,
      rayWidthFrac: 0.045,
      rayLengthFrac: 1.4,
      fadeEndFrac: 0.6,
      sideBlurFrac: 0.003,
    },
    fires: [
      { top: "57%", left: "17%", width: "12%", height: "16%" }, // left candle cluster
      { top: "32%", left: "22%", width: "12%", height: "16%" }, // torch in left doorway
      { top: "53%", left: "69%", width: "12%", height: "16%" }, // right candle cluster
      { top: "33%", left: "75%", width: "8%", height: "14%" }, // torch in right doorway
    ],
    hotspots: [
      {
        id: "sarcophagus",
        top: "60%",
        left: "50%",
        description: "The empty stone form. Approach to begin assembling the body.",
        goTo: "assembly",
      },
      {
        id: "scales",
        top: "75%",
        left: "39%",
        description: "Bronze scales. Anubis weighs everything — even his own creations.",
      },
      {
        id: "doorway-left",
        top: "50%",
        left: "25%",
        description: "A passage to the scroll archive.",
        goTo: "scroll_archive",
      },
      {
        id: "doorway-right",
        top: "50%",
        left: "80%",
        description: "A passage to the storerooms.",
        goTo: "storeroom",
      },
    ],
    items: [],
  },

  storeroom: {
    bg: "assets/storeroom.jpeg",
    fires: [
      { top: "83%", left: "17%", width: "12%", height: "16%" }, // left candle cluster
      { top: "13%", left: "60%", width: "12%", height: "16%" }, // torch in left doorway
      { top: "57%", left: "68%", width: "12%", height: "16%" }, // right candle cluster
      { top: "80%", left: "85%", width: "8%", height: "14%" }, // torch in right doorway
    ],
    hotspots: [
      {
        id: "exit",
        top: "10%",
        left: "5%",
        description: "Back to the workshop.",
        goTo: "workshop",
      },
      {
        id: "shelves",
        top: "20%",
        left: "36%",
        description: "Sealed jars and offering bowls. Most are empty.",
      },
    ],
    items: [
      { id: "clay", top: "60%", left: "50%", label: "Wet river clay", image: "Clay.png" },
      { id: "natron", top: "25%", left: "20%", label: "Natron — purifying salt", image: "Salt.png" },
    ],
  },

  scroll_archive: {
    bg: "assets/scroll_archive.jpeg",
    godRays: {
      sourceXFrac: 0.50,
      sourceYFrac: -0.1,
      numRays: 7,
      spreadDeg: 16,
      rayWidthFrac: 0.035,
      rayLengthFrac: 1.0,
      fadeEndFrac: 0.55,
      sideBlurFrac: 0.0025,
    },
    fires: [
      { top: "52%", left: "42%", width: "10%", height: "14%" }, // oil lamp on the table
    ],
    hotspots: [
      {
        id: "exit",
        top: "10%",
        left: "5%",
        description: "Back to the workshop.",
        goTo: "workshop",
      },
      {
        id: "ibis-statue",
        top: "20%",
        left: "82%",
        description: "Thoth's ibis. The scribe-god watches you steal his craft.",
      },
    ],
    items: [
      { id: "scroll-emet", top: "65%", left: "51%", label: "Scroll bearing אמת", image: "Scroll.png" },
      { id: "heart-amulet", top: "24%", left: "91%", label: "Heart amulet", image: "Heart.png" },
    ],
  },

  assembly: {
    bg: "assets/workshop_top.jpeg",
    godRays: {
      sourceXFrac: 0.61,
      sourceYFrac: -0.6,
      numRays: 10,
      spreadDeg: 35,
      tiltDeg: -7,
      rayWidthFrac: 0.06,
      rayLengthFrac: 1.2,
      fadeEndFrac: 0.35,
      sideBlurFrac: 0.003,
    },
    fires: [
      { top: "25%", left: "13%", width: "10%", height: "15%" }, // left-side candles by the basin
      { top: "27%", left: "85%", width: "10%", height: "14%" }, // upper-right candles
      { top: "78%", left: "85%", width: "10%", height: "14%" }, // lower-right candles
    ],
    hotspots: [
      {
        id: "back",
        top: "10%",
        left: "5%",
        description: "Step back from the sarcophagus.",
        goTo: "workshop",
      },
    ],
    items: [],
    slots: [
      // Body lies horizontally inside the basin: head on the left,
      // feet on the right.
      { id: "mouth", top: "50%", left: "35%", accepts: "scroll-emet", label: "in the mouth" },
      { id: "chest", top: "45%", left: "45%", accepts: "heart-amulet", label: "over the heart" },
      { id: "body", top: "50%", left: "55%", accepts: "clay", label: "as the body" },
      { id: "salts", top: "50%", left: "68%", accepts: "natron", label: "around the form" },
    ],
  },
};

// --- Dialogue data -------------------------------------------------
// Each line: { speaker?, portrait?, text, choices? }
//   speaker: "anubis" | "golem" | "narrator" | undefined
//   portrait: pose key — "anubis-idle" | "anubis-talking" | "anubis-gesturing" | "golem"
//   choices: array of { text, next } — when present, replaces the Continue button
const dialogues = {
  intro: [
    {
      speaker: "anubis",
      portrait: "anubis-talking",
      text: "I am Anubis. Tonight, in the dark of my own pyramid, I will do what no god has done.",
    },
    {
      speaker: "anubis",
      portrait: "anubis-idle",
      text: "I have stolen a secret from the wandering tribe at the river — a word that wakes clay.",
    },
    {
      speaker: "anubis",
      portrait: "anubis-gesturing",
      text: "Find what I need. Bring it here. We will see whether a god can make a man.",
    },
  ],

  golem_awakens: [
    {
      speaker: "anubis",
      portrait: "anubis-gesturing",
      text: "Open your eyes, child of clay.",
    },
    {
      speaker: "anubis",
      portrait: "anubis-talking",
      text: "I shaped you with the river. I salted your skin so it does not rot. The word in your mouth — that is the secret I took from them.",
    },
    {
      speaker: "golem",
      portrait: "golem-1",
      text: "...who are 'them'?",
    },
    {
      speaker: "anubis",
      portrait: "anubis-gesturing",
      text: "The ones at the walls. The Hebrews. They build my house in the sun. You were made from their word, but you serve me.",
    },
    {
      speaker: "narrator",
      text: "The Golem turns its heavy head toward the doorway. Below, in the heat, the slaves are still working.",
    },
    {
      speaker: "golem",
      portrait: "golem-2",
      text: "Their hands are the same color as mine.",
    },
    {
      speaker: "narrator",
      portrait: "golem-3",
      text: "It must choose.",
      choices: [
        { text: "Stand with the god who made you.", next: "ending_anubis" },
        { text: "Walk to the slaves at the wall.", next: "ending_slaves" },
      ],
    },
  ],

  ending_anubis: [
    {
      speaker: "anubis",
      portrait: "anubis-idle",
      text: "Good. You are mine.",
    },
    {
      speaker: "narrator",
      text: "The Golem stands beside Anubis as the sun goes down on the pyramid. — End of demo.",
    },
  ],

  ending_slaves: [
    {
      speaker: "narrator",
      text: "The Golem steps off the sarcophagus and walks out of the chamber. Anubis does not stop it.",
    },
    {
      speaker: "anubis",
      portrait: "anubis-idle",
      text: "...you took my word back, then.",
    },
    {
      speaker: "narrator",
      text: "— End of demo.",
    },
  ],
};

// --- Game state ----------------------------------------------------
const game = {
  currentScene: "workshop",
  inventory: [],
  selectedItem: null, // id of the inventory item the player has selected
  assembly: {}, // { [slotId]: itemId } — placed materials
  golemRevealed: false, // true after the fade-in has played at least once
};

// --- DOM refs ------------------------------------------------------
const sceneEl = document.querySelector(".scene");
const bgEl = document.querySelector(".bg");
const hotspotsEl = document.querySelector(".hotspots");
const itemsEl = document.querySelector(".items");
const messageEl = document.getElementById("message");
const inventoryEl = document.getElementById("inventory");
const dialogueEl = document.getElementById("dialogue");
const dialogueTextEl = document.getElementById("dialogue-text");
const dialogueNextEl = document.getElementById("dialogue-next");
const dialogueSpeakerEl = document.getElementById("dialogue-speaker");
const dialoguePortraitEl = document.getElementById("dialogue-portrait");
const dialogueChoicesEl = document.getElementById("dialogue-choices");
const assembledGolemEl = document.getElementById("assembled-golem");
const fireShimmersEl = document.querySelector(".fire-shimmers");

// --- Section 1: scene rendering (hotspots, items, assembly slots) --
function renderScene(sceneId) {
  game.currentScene = sceneId;
  const scene = scenes[sceneId];
  bgEl.src = scene.bg;

  // Only instant-show on re-entry (after the first fade has played).
  // The first reveal is handled by revealAssembledGolem() so the
  // opacity transition has a chance to run.
  if (sceneId === "assembly" && isAssemblyComplete() && game.golemRevealed) {
    assembledGolemEl.classList.remove("hidden");
    assembledGolemEl.classList.add("visible");
  } else if (sceneId !== "assembly") {
    hideAssembledGolem();
  }

  if (scene.godRays) {
    godRays.show(sceneId);
  } else {
    godRays.hide();
  }

  // Re-render fire-haze shimmer spots for this scene.
  fireShimmersEl.innerHTML = "";
  (scene.fires || []).forEach((fire) => {
    const el = document.createElement("div");
    el.className = "fire-shimmer";
    el.style.top = fire.top;
    el.style.left = fire.left;
    el.style.width = fire.width;
    el.style.height = fire.height;
    fireShimmersEl.appendChild(el);
  });

  hotspotsEl.innerHTML = "";
  scene.hotspots.forEach((h) => {
    const el = document.createElement("div");
    el.className = "hotspot";
    el.id = h.id;
    el.style.top = h.top;
    el.style.left = h.left;
    el.addEventListener("click", () => {
      showMessage(h.description);
      if (h.goTo) {
        transitionToScene(h.goTo, h.left, h.top);
      }
    });
    hotspotsEl.appendChild(el);
  });

  itemsEl.innerHTML = "";

  // Pickup sprites
  scene.items.forEach((item) => {
    if (game.inventory.includes(item.id) || game.assembly[lookupSlotFor(item.id)]) return;
    const el = document.createElement("div");
    el.className = "item-sprite";
    el.style.top = item.top;
    el.style.left = item.left;
    el.title = item.label;
    if (item.image) el.style.backgroundImage = `url("assets/${item.image}")`;
    el.addEventListener("click", () => {
      showMessage(`Picked up: ${item.label}.`);
      pickUp(item.id);
    });
    itemsEl.appendChild(el);
  });

  // Assembly slots (only on the assembly scene)
  if (scene.slots) {
    scene.slots.forEach((slot) => {
      const el = document.createElement("div");
      el.className = "assembly-slot";
      const placedItemId = game.assembly[slot.id];
      if (placedItemId) {
        el.classList.add("filled");
        const item = findItem(placedItemId);
        if (item && item.image) {
          el.style.backgroundImage = `url("assets/${item.image}")`;
        }
      }
      el.style.top = slot.top;
      el.style.left = slot.left;
      el.title = slot.label;
      el.addEventListener("click", () => onSlotClick(slot));
      itemsEl.appendChild(el);
    });
  }

  // One-line orientation hint the first time the player approaches the
  // sarcophagus with nothing placed yet. Once any item has been placed
  // (or the puzzle is complete), the hint stops appearing.
  if (sceneId === "assembly" && Object.keys(game.assembly).length === 0) {
    setTimeout(() => {
      showMessage("Place the materials you have gathered — select one below, then click a glowing slot.");
    }, 650);
  }
}

// Scene transition: zoom the world toward the clicked hotspot while
// fading to black, swap the scene, then fade + zoom back in.
const TRANSITION_MS = 550;
let isTransitioning = false;
const swooshSound = new Audio("assets/swoosh.wav");

function transitionToScene(sceneId, originX, originY) {
  if (isTransitioning) return;
  isTransitioning = true;

  // Play the swoosh from the start; .play() returns a promise that
  // can reject (e.g. before the user has interacted with the page),
  // which we swallow so a blocked autoplay doesn't break the transition.
  swooshSound.currentTime = 0;
  swooshSound.play().catch(() => {});

  // World layer: everything that should zoom + fade with the scene
  // (i.e. not the HUD: message, inventory, dialogue).
  const godRaysEl = document.getElementById("god-rays");
  const worldEls = [bgEl, hotspotsEl, itemsEl, godRaysEl, assembledGolemEl, fireShimmersEl];
  worldEls.forEach((el) => {
    el.style.transformOrigin = `${originX} ${originY}`;
  });

  sceneEl.classList.add("zoom-out");

  setTimeout(() => {
    // Render the new scene while the old one is invisible (opacity 0).
    renderScene(sceneId);
    // New scene zooms in from its center, not from the old hotspot.
    worldEls.forEach((el) => {
      el.style.transformOrigin = "center";
    });
    // Swap classes in the same tick so there's no flash of the new
    // scene at full opacity between the two phases.
    sceneEl.classList.remove("zoom-out");
    sceneEl.classList.add("zoom-in");

    setTimeout(() => {
      sceneEl.classList.remove("zoom-in");
      isTransitioning = false;
    }, TRANSITION_MS);
  }, TRANSITION_MS);
}

function lookupSlotFor(itemId) {
  const slot = scenes.assembly.slots.find((s) => s.accepts === itemId);
  return slot ? slot.id : null;
}

// --- Section 2: message tooltip ------------------------------------
let messageTimer;
function showMessage(text) {
  messageEl.textContent = text;
  messageEl.classList.add("visible");
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => messageEl.classList.remove("visible"), 2500);
}

// --- Section 3: inventory (click to select / deselect) -------------
function pickUp(itemId) {
  game.inventory.push(itemId);
  renderInventory();
  renderScene(game.currentScene); // re-render to remove the sprite
}

function renderInventory() {
  inventoryEl.innerHTML = "";

  const label = document.createElement("span");
  label.className = "inventory-label";
  label.textContent =
    game.inventory.length === 0
      ? "Inventory — empty (find materials in the storerooms)"
      : "Inventory:";
  inventoryEl.appendChild(label);

  game.inventory.forEach((itemId) => {
    const item = findItem(itemId);
    const slot = document.createElement("div");
    slot.className = "slot";
    if (game.selectedItem === itemId) slot.classList.add("selected");
    slot.title = item ? item.label : itemId;
    if (item && item.image) slot.style.backgroundImage = `url("assets/${item.image}")`;
    slot.addEventListener("click", () => {
      game.selectedItem = game.selectedItem === itemId ? null : itemId;
      if (game.selectedItem) {
        showMessage(`Selected: ${prettyLabel(game.selectedItem)}. Click a glowing slot on the sarcophagus.`);
      }
      renderInventory();
    });
    inventoryEl.appendChild(slot);
  });
}

function findItem(itemId) {
  // Look the item config up across all scenes.
  for (const scene of Object.values(scenes)) {
    const found = scene.items && scene.items.find((i) => i.id === itemId);
    if (found) return found;
  }
  return null;
}

function prettyLabel(itemId) {
  const item = findItem(itemId);
  return item ? item.label : itemId;
}

// --- Section 4: assembly puzzle ------------------------------------
function onSlotClick(slot) {
  if (game.assembly[slot.id]) return;
  if (!game.selectedItem) {
    if (game.inventory.length === 0) {
      showMessage(
        `Empty hands. Find the materials in the storerooms (left and right doorways from the workshop).`,
      );
    } else {
      showMessage(
        `Something belongs ${slot.label}. Click an item in the bar at the bottom of the screen to select it first.`,
      );
    }
    return;
  }
  if (game.selectedItem !== slot.accepts) {
    showMessage(`That doesn't belong ${slot.label}.`);
    return;
  }
  // Place it.
  game.assembly[slot.id] = game.selectedItem;
  const idx = game.inventory.indexOf(game.selectedItem);
  if (idx >= 0) game.inventory.splice(idx, 1);
  showMessage(`Placed ${slot.label}.`);
  game.selectedItem = null;
  renderInventory();
  renderScene("assembly");

  if (isAssemblyComplete()) {
    revealAssembledGolem();
  }
}

// Fade the assembled-golem image in over the assembly scene, then start
// the awakening dialogue once it's fully visible.
function revealAssembledGolem() {
  assembledGolemEl.classList.remove("hidden");
  // Force a reflow after display: none → display: flex so the
  // subsequent class change actually triggers an opacity transition.
  void assembledGolemEl.offsetWidth;
  assembledGolemEl.classList.add("visible");
  game.golemRevealed = true;
  setTimeout(() => playDialogue("golem_awakens"), 1800);
}

function hideAssembledGolem() {
  assembledGolemEl.classList.remove("visible");
  assembledGolemEl.classList.add("hidden");
}

function isAssemblyComplete() {
  return scenes.assembly.slots.every((s) => game.assembly[s.id]);
}

// --- Section 5: dialogue system ------------------------------------
let currentDialogue = null;
let currentDialogueIndex = 0;

function playDialogue(id) {
  currentDialogue = dialogues[id];
  currentDialogueIndex = 0;
  dialogueEl.classList.remove("hidden");
  renderDialogueLine();
}

function renderDialogueLine() {
  const line = currentDialogue[currentDialogueIndex];

  dialogueTextEl.textContent = line.text;
  dialogueSpeakerEl.textContent =
    line.speaker && line.speaker !== "narrator" ? line.speaker : "";

  // Portrait — keep the slot's space reserved even for narrator lines
  // (use visibility, not display) so the dialogue box layout doesn't
  // shift between lines with and without a portrait.
  dialoguePortraitEl.className = "portrait";
  if (line.portrait) {
    dialoguePortraitEl.classList.add(`pose-${line.portrait}`);
    dialoguePortraitEl.style.visibility = "visible";
  } else {
    dialoguePortraitEl.style.visibility = "hidden";
  }

  // Choices replace the Continue button when present.
  dialogueChoicesEl.innerHTML = "";
  if (line.choices) {
    dialogueNextEl.style.display = "none";
    line.choices.forEach((c) => {
      const btn = document.createElement("button");
      btn.textContent = c.text;
      btn.addEventListener("click", () => playDialogue(c.next));
      dialogueChoicesEl.appendChild(btn);
    });
  } else {
    dialogueNextEl.style.display = "inline-block";
  }
}

dialogueNextEl.addEventListener("click", () => {
  currentDialogueIndex++;
  if (currentDialogueIndex >= currentDialogue.length) {
    dialogueEl.classList.add("hidden");
    currentDialogue = null;
    return;
  }
  renderDialogueLine();
});

// --- Viewport sizing (matches the example) -------------------------
function setSceneHeight() {
  sceneEl.style.height = window.innerHeight + "px";
  godRays.resize();
}
window.addEventListener("load", setSceneHeight);
window.addEventListener("resize", setSceneHeight);
// The .scene element is inline-block sized to its bg image, so the
// width depends on the image having loaded. Re-size god rays each
// time the bg src changes and finishes loading.
bgEl.addEventListener("load", () => godRays.resize());

// --- Section 6: dynamic god rays (workshop scene) ------------------
// SVG-based volumetric rays emanating from a fixed source. The cursor
// occludes the rays via an SVG mask: a black circle at the cursor +
// a black wedge projected from the source through the cursor's tangent
// points out to the far edge of the scene. mix-blend-mode: screen on
// the SVG element means the rays additively brighten the scene, so
// masking them away just reveals the original (darker) background.
const godRays = {
  svg: null,
  group: null,
  cursorEl: null,
  shadowEl: null,
  maskBgEl: null,
  fadeEl: null,
  defsEl: null,
  blurEl: null,
  rayGradients: [],
  size: { w: 0, h: 0 },
  source: { x: 0, y: 0 },
  cursorRadius: 0,
  // Base defaults. Each scene that wants god rays declares its own
  // `godRays: {...}` overrides on its scene object; show(sceneId)
  // merges those overrides onto these defaults into `activeConfig`.
  defaults: {
    sourceXFrac: 0.5,
    sourceYFrac: -0.05,
    numRays: 8,
    spreadDeg: 25,
    tiltDeg: 0, // angle of the fan's center axis off vertical (negative = lean left, positive = lean right)
    rayWidthFrac: 0.04,
    rayLengthFrac: 1.2,
    cursorRadiusFrac: 0.025,
    fadeEndFrac: 0.6, // rays fully faded by this fraction of scene height
    sideBlurFrac: 0.003, // horizontal-only Gaussian blur (fraction of scene width) — softens left/right edges
  },
  activeConfig: null,

  init() {
    this.svg = document.getElementById("god-rays");
    this.group = document.getElementById("god-rays-group");
    this.cursorEl = document.getElementById("god-rays-cursor");
    this.shadowEl = document.getElementById("god-rays-shadow");
    this.maskBgEl = document.getElementById("god-rays-mask-bg");
    this.fadeEl = document.getElementById("god-rays-fade");
    this.defsEl = document.getElementById("god-rays-defs");
    this.blurEl = document.getElementById("god-rays-blur-amount");
    sceneEl.addEventListener("mousemove", (e) => this.onMouseMove(e));
    sceneEl.addEventListener("mouseleave", () => this.parkCursor());
  },

  resize() {
    if (!this.svg || !this.activeConfig) return;
    if (this.svg.classList.contains("hidden")) return;
    const rect = sceneEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const cfg = this.activeConfig;
    this.size = { w: rect.width, h: rect.height };
    this.svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    this.source = {
      x: rect.width * cfg.sourceXFrac,
      y: rect.height * cfg.sourceYFrac,
    };
    this.cursorRadius = Math.min(rect.width, rect.height) * cfg.cursorRadiusFrac;
    this.cursorEl.setAttribute("r", this.cursorRadius);
    this.maskBgEl.setAttribute("width", rect.width);
    this.maskBgEl.setAttribute("height", rect.height);
    // Vertical fade: white (rays visible) at top of scene → black
    // (rays masked) by fadeEndFrac of scene height.
    if (this.fadeEl) {
      this.fadeEl.setAttribute("y1", 0);
      this.fadeEl.setAttribute("y2", rect.height * cfg.fadeEndFrac);
    }
    // Horizontal-only Gaussian blur softens the polygon side edges
    // without smearing the top/bottom (which the mask already handles).
    if (this.blurEl) {
      const blur = rect.width * cfg.sideBlurFrac;
      this.blurEl.setAttribute("stdDeviation", `${blur.toFixed(2)} 0`);
    }
    this.generateRays();
    this.parkCursor();
  },

  generateRays() {
    this.group.innerHTML = "";
    // Remove any per-ray gradients from a previous resize.
    this.rayGradients.forEach((g) => g.remove());
    this.rayGradients = [];

    const SVG_NS = "http://www.w3.org/2000/svg";
    const { numRays, spreadDeg, tiltDeg, rayWidthFrac, rayLengthFrac } = this.activeConfig;
    const rayWidth = this.size.w * rayWidthFrac;
    const rayLength = this.size.h * rayLengthFrac;
    for (let i = 0; i < numRays; i++) {
      const t = numRays === 1 ? 0 : i / (numRays - 1) - 0.5;
      const angle = ((t * spreadDeg + tiltDeg) * Math.PI) / 180;
      const dx = Math.sin(angle);
      const dy = Math.cos(angle);
      const bx = this.source.x + dx * rayLength;
      const by = this.source.y + dy * rayLength;
      const px = (dy * rayWidth) / 2;
      const py = (-dx * rayWidth) / 2;
      const blX = bx + px;
      const blY = by + py;
      const brX = bx - px;
      const brY = by - py;

      // Linear gradient perpendicular to the ray axis (from base-left
      // to base-right). At the apex this still resolves to the center
      // of that line, so the apex stays opaque while both side edges
      // feather to transparent — softening the hard polygon edges.
      const gradId = `god-ray-grad-${i}`;
      const grad = document.createElementNS(SVG_NS, "linearGradient");
      grad.setAttribute("id", gradId);
      grad.setAttribute("gradientUnits", "userSpaceOnUse");
      grad.setAttribute("x1", blX);
      grad.setAttribute("y1", blY);
      grad.setAttribute("x2", brX);
      grad.setAttribute("y2", brY);
      const stops = [
        { offset: "0%", opacity: 0 },
        { offset: "25%", opacity: 0.05 },
        { offset: "50%", opacity: 0.1 },
        { offset: "75%", opacity: 0.05 },
        { offset: "100%", opacity: 0 },
      ];
      stops.forEach((s) => {
        const stop = document.createElementNS(SVG_NS, "stop");
        stop.setAttribute("offset", s.offset);
        stop.setAttribute("stop-color", "rgb(255, 225, 170)");
        stop.setAttribute("stop-opacity", s.opacity);
        grad.appendChild(stop);
      });
      this.defsEl.appendChild(grad);
      this.rayGradients.push(grad);

      const ray = document.createElementNS(SVG_NS, "polygon");
      ray.setAttribute(
        "points",
        `${this.source.x},${this.source.y} ${blX},${blY} ${brX},${brY}`,
      );
      ray.setAttribute("class", "god-ray");
      ray.setAttribute("fill", `url(#${gradId})`);
      // Per-ray random duration + negative delay so each ray breathes
      // at its own rhythm and they don't all peak in sync.
      const duration = 4 + Math.random() * 5;
      const delay = Math.random() * duration;
      ray.style.animationDuration = `${duration.toFixed(2)}s`;
      ray.style.animationDelay = `-${delay.toFixed(2)}s`;
      this.group.appendChild(ray);
    }
  },

  onMouseMove(e) {
    if (this.svg.classList.contains("hidden")) return;
    const rect = this.svg.getBoundingClientRect();
    this.updateMask(e.clientX - rect.left, e.clientY - rect.top);
  },

  parkCursor() {
    if (!this.cursorEl) return;
    this.cursorEl.setAttribute("cx", -9999);
    this.cursorEl.setAttribute("cy", -9999);
    this.shadowEl.setAttribute("points", "");
  },

  updateMask(cx, cy) {
    this.cursorEl.setAttribute("cx", cx);
    this.cursorEl.setAttribute("cy", cy);
    const sx = this.source.x;
    const sy = this.source.y;
    const dx = cx - sx;
    const dy = cy - sy;
    const dist = Math.hypot(dx, dy);
    if (dist < this.cursorRadius) {
      this.shadowEl.setAttribute("points", "");
      return;
    }
    // Perpendicular unit vector to the source→cursor line.
    const px = -dy / dist;
    const py = dx / dist;
    const r = this.cursorRadius;
    const t1x = cx + px * r;
    const t1y = cy + py * r;
    const t2x = cx - px * r;
    const t2y = cy - py * r;
    // Project the tangent lines from the source outward to a far point
    // well past the scene edges.
    const far = Math.max(this.size.w, this.size.h) * 3;
    const d1 = Math.hypot(t1x - sx, t1y - sy);
    const d2 = Math.hypot(t2x - sx, t2y - sy);
    const f1x = sx + ((t1x - sx) * far) / d1;
    const f1y = sy + ((t1y - sy) * far) / d1;
    const f2x = sx + ((t2x - sx) * far) / d2;
    const f2y = sy + ((t2y - sy) * far) / d2;
    this.shadowEl.setAttribute(
      "points",
      `${t1x},${t1y} ${f1x},${f1y} ${f2x},${f2y} ${t2x},${t2y}`,
    );
  },

  show(sceneId) {
    if (!this.svg) return;
    const sceneCfg = scenes[sceneId] && scenes[sceneId].godRays;
    if (!sceneCfg) {
      this.hide();
      return;
    }
    this.activeConfig = Object.assign({}, this.defaults, sceneCfg);
    this.svg.classList.remove("hidden");
    this.resize();
  },
  hide() {
    if (!this.svg) return;
    this.svg.classList.add("hidden");
    this.parkCursor();
  },
};

// --- Section 7: background music + mute toggle --------------------
// `new Audio(...)` streams in the background, so this constructor
// returns immediately — the rest of the game boots and is fully
// playable while the .wav is still downloading.
const music = new Audio("assets/golemmusicdraft.wav");
music.loop = true;
music.volume = 0.4;

// Browsers block .play() until the user has interacted with the page.
// Try to start immediately; if blocked, queue a one-shot listener so
// the very first click (anywhere) starts playback.
function tryStartMusic() {
  music.play().catch(() => {
    const startOnGesture = () => {
      music.play().catch(() => {});
    };
    window.addEventListener("pointerdown", startOnGesture, { once: true });
  });
}
tryStartMusic();

const musicToggleEl = document.getElementById("music-toggle");
musicToggleEl.addEventListener("click", (e) => {
  // Don't let the toggle click count as a "scene interaction" — it
  // sits over the workshop, so without this it'd also fire a hotspot
  // click underneath.
  e.stopPropagation();
  music.muted = !music.muted;
  musicToggleEl.classList.toggle("muted", music.muted);
  musicToggleEl.title = music.muted ? "Unmute music" : "Mute music";
  // If the page has been waiting for a gesture to start playback,
  // toggling the button counts — kick it off here too.
  if (!music.muted && music.paused) {
    music.play().catch(() => {});
  }
});

// --- Section 8: heat-haze shimmer animation ------------------------
// Continuously morph the SVG turbulence's baseFrequency so each
// .fire-shimmer's backdrop-filter warp keeps changing — making the
// fire spots feel alive instead of frozen. Tiny amplitude so the
// shimmer reads as heat haze, not as wobbly water.
const heatTurbulence = document.getElementById("heat-turbulence");
let heatT = 0;
function animateHeatHaze() {
  heatT += 0.02;
  const bx = (0.018 + Math.sin(heatT) * 0.004).toFixed(4);
  const by = (0.045 + Math.cos(heatT * 0.7) * 0.006).toFixed(4);
  heatTurbulence.setAttribute("baseFrequency", `${bx} ${by}`);
  requestAnimationFrame(animateHeatHaze);
}
animateHeatHaze();

// --- Boot ----------------------------------------------------------
godRays.init();
renderScene("workshop");
renderInventory();
playDialogue("intro");
