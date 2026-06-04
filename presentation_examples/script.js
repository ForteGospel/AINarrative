document.querySelectorAll(".hotspot").forEach((el) => {
  el.addEventListener("click", () => {
    console.log("clicked:", el.id);
  });
});

// Fix for viewport height including bookmarks bar
function setSceneHeight() {
  const scene = document.querySelector(".scene");
  scene.style.height = window.innerHeight + "px";
}

window.addEventListener("load", setSceneHeight);
window.addEventListener("resize", setSceneHeight);

// section 2
const message = document.getElementById("message");

function show(text) {
  message.textContent = text;
  message.style.opacity = "1";
  //   setTimeout(() => {
  //     message.style.opacity = "0";
  //   }, 2000);
}

const descriptions = {
  painting: "A beautiful painting of fruits.",
  drawer: "The drawer is locked.",
  key: "A brass key.",
};

document.querySelectorAll(".hotspot").forEach((el) => {
  el.addEventListener("click", () => show(descriptions[el.id]));
});

// section 3
const SPRITES = {
  apple: "assets/apple_sprite.png",
};
const game = { inventory: [] }; //, currentScene: "room"

function pickUp(item, el) {
  game.inventory.push(item);
  el.style.display = "none"; // remove from scene
  renderInventory();
}

function renderInventory() {
  const bar = document.getElementById("inventory");
  bar.innerHTML = "";
  game.inventory.forEach((item) => {
    const slot = document.createElement("div");
    slot.className = "item";
    const img = document.createElement("img");
    img.src = SPRITES[item];
    slot.appendChild(img);
    bar.appendChild(slot);
  });
}

// spawn apples at random positions each page load
const APPLE_COUNT = 3;
const scene = document.querySelector(".scene");

for (let i = 0; i < APPLE_COUNT; i++) {
  const apple = document.createElement("img");
  apple.src = SPRITES.apple;
  apple.classList.add("apple");
  apple.style.top = Math.random() * 70 + 5 + "%";
  apple.style.left = Math.random() * 85 + 5 + "%";
  apple.addEventListener("click", () => pickUp("apple", apple));
  scene.appendChild(apple);
}

// section 4
// Change background image when key is clicked
const keyHotspot = document.getElementById("key");
keyHotspot.addEventListener("click", () => {
  const bgImage = document.querySelector(".bg");
  bgImage.src = "assets/room.png";
});
