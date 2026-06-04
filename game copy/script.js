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
      { id: "clay", top: "60%", left: "50%", label: "Wet river clay" },
      { id: "natron", top: "25%", left: "20%", label: "Natron — purifying salt" },
    ],
  },

  scroll_archive: {
    bg: "assets/scroll_archive.jpeg",
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
      { id: "scroll-emet", top: "65%", left: "51%", label: "Scroll bearing אמת" },
      { id: "heart-amulet", top: "24%", left: "91%", label: "Heart amulet" },
    ],
  },

  assembly: {
    bg: "assets/workshop_top.jpeg",
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
      if (game.assembly[slot.id]) el.classList.add("filled");
      el.style.top = slot.top;
      el.style.left = slot.left;
      el.title = slot.label;
      el.addEventListener("click", () => onSlotClick(slot));
      itemsEl.appendChild(el);
    });
  }
}

// Scene transition: zoom the world toward the clicked hotspot while
// fading to black, swap the scene, then fade + zoom back in.
const TRANSITION_MS = 550;
let isTransitioning = false;

function transitionToScene(sceneId, originX, originY) {
  if (isTransitioning) return;
  isTransitioning = true;

  const worldEls = [bgEl, hotspotsEl, itemsEl];
  worldEls.forEach((el) => {
    el.style.transformOrigin = `${originX} ${originY}`;
  });

  sceneEl.classList.add("zoom-out");

  setTimeout(() => {
    // Render the new scene while the old one is invisible (opacity 0).
    renderScene(sceneId);
    // New scene zooms in from its center, not from the old hotspot.
    [bgEl, hotspotsEl, itemsEl].forEach((el) => {
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
    const slot = document.createElement("div");
    slot.className = "slot";
    if (game.selectedItem === itemId) slot.classList.add("selected");
    slot.title = itemId;
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

function prettyLabel(itemId) {
  // Look the item up across scenes to grab its label.
  for (const scene of Object.values(scenes)) {
    const found = scene.items.find((i) => i.id === itemId);
    if (found) return found.label;
  }
  return itemId;
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
}
window.addEventListener("load", setSceneHeight);
window.addEventListener("resize", setSceneHeight);

// --- Boot ----------------------------------------------------------
renderScene("workshop");
renderInventory();
playDialogue("intro");
