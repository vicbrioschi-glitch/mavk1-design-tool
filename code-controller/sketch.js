// MAMD Creative Coding & Future Web, 2026, Amaury Hamon

// MIDI controller
// Control the sound AND the visuals with a USB MIDI controller (here: Evolution UC-33).
// Two views, switch with the tabs at the top, the Tab key, or a linked button:
// - "link controls": click a setting, then move a knob, fader or button → they are linked
// - "visuals": the same settings move a shape, the background and a text
// Click anywhere else (or press space) to play / pause.
// Press U (or a linked button) to hide the UI in the visuals view.
//
// The code is split in several files, all loaded in index.html:
// - sketch.js        → start here: preload, setup, draw, mouse and keyboard
// - settings.js      → the list of settings the controller can change
// - sound.js         → the effects (filter, delay, reverb) and play / pause
// - midi.js          → reading the controller, linking controls to settings
// - link-view.js     → view 1: the list of settings
// - visuals-view.js  → view 2: shape, background and text
// The files share their variables and functions, as if they were one long file.

let mySound;
let view = "link"; // "link" or "visuals"
let showUI = true; // false = only the visuals: no tabs, no texts, no mouse cursor

const TABS = [
  { view: "link", label: "link controls" },
  { view: "visuals", label: "visuals" },
];

function preload() {
  mySound = loadSound("assets/878406__josefpres__piano-loops-217-octave-down-short-loop-120-bpm.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  setupSound(); // sound.js
  applyAllSettings(); // settings.js (after setupSound: the effects must exist)
  setupMIDI(); // midi.js
}

function draw() {
  if (view === "link") {
    drawLinkView(); // link-view.js
  } else {
    drawVisuals(); // visuals-view.js
  }

  // the link view always has its UI (you need it to link controls)
  if (isUIVisible()) {
    drawTabs();
    cursor();
  } else {
    noCursor();
  }
}

function isUIVisible() {
  return view === "link" || showUI;
}

function toggleUI() {
  showUI = !showUI;
}

// ---------------------------------------------------------------------------
// tabs at the top

function drawTabs() {
  push();
  textSize(14);
  textAlign(CENTER, CENTER);
  for (let i = 0; i < TABS.length; i++) {
    let box = tabBox(i);
    let isActive = TABS[i].view === view;
    fill(255, isActive ? 255 : 60);
    rect(box.x, box.y, box.w, box.h, box.h / 2);
    fill(isActive ? color("orangered") : color(255));
    text(TABS[i].label, box.x + box.w / 2, box.y + box.h / 2);
  }
  pop();
}

// position and size of tab number i
function tabBox(i) {
  let w = 140;
  let gap = 8;
  let totalWidth = TABS.length * w + (TABS.length - 1) * gap;
  return { x: width / 2 - totalWidth / 2 + i * (w + gap), y: 20, w: w, h: 32 };
}

// the view of the tab under the mouse, or undefined
function tabAt(x, y) {
  for (let i = 0; i < TABS.length; i++) {
    if (isInside(x, y, tabBox(i))) return TABS[i].view;
  }
  return undefined;
}

function toggleView() {
  view = view === "link" ? "visuals" : "link";
  learning = undefined; // stop waiting for a control (midi.js)
}

// is the point (x, y) inside the box { x, y, w, h }?
function isInside(x, y, box) {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

// ---------------------------------------------------------------------------
// mouse and keyboard

function mousePressed() {
  userStartAudio(); // browsers only allow sound after a click

  // hidden tabs can't be clicked
  let tab = isUIVisible() ? tabAt(mouseX, mouseY) : undefined;
  if (tab) {
    view = tab;
    learning = undefined;
    return;
  }

  if (view === "link") {
    let clicked = settingAt(mouseX, mouseY);
    if (clicked) {
      // click the same setting again to cancel
      learning = clicked === learning ? undefined : clicked;
      return;
    }
  }

  togglePlay();
}

function keyPressed() {
  if (keyCode === TAB) {
    toggleView();
    return false; // stop the browser from moving the focus
  }
  if (key === " ") togglePlay();
  if (key === "u" || key === "U") toggleUI();
  if (keyCode === ESCAPE) learning = undefined;
  if (keyCode === BACKSPACE && learning) {
    unlink(learning);
    saveMapping();
    learning = undefined;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
