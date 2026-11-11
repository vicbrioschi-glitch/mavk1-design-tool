// MAMD Creative Coding & Future Web, 2026, Amaury Hamon

// SETTINGS
// Everything the controller can change.
// Every setting has a value from 0 to 1 (MIDI sends 0 to 127).
// - apply() sends the value to the sound and returns the text to display
//   (visual-only settings just return the text)
// - visual: what it changes in the "visuals" view (see visuals-view.js)
// To add a setting: copy a block, change it, then use it in drawVisuals().

let settings = [
  {
    name: "volume",
    visual: "shape size",
    value: 0.8,
    apply: (v) => {
      mySound.setVolume(v);
      return `${round(v * 100)}%`;
    },
  },
  {
    name: "speed",
    visual: "rotation",
    value: 0.5,
    apply: (v) => {
      // 0 → half speed, 0.5 → normal, 1 → double speed
      let rate = pow(2, map(v, 0, 1, -1, 1));
      mySound.rate(rate);
      return `x${nf(rate, 1, 2)}`;
    },
  },
  {
    name: "pan",
    visual: "shape position",
    value: 0.5,
    apply: (v) => {
      let pan = v * 2 - 1; // -1 left, 0 center, 1 right
      mySound.pan(pan);
      if (abs(pan) < 0.05) return "center";
      return `${pan < 0 ? "left" : "right"} ${round(abs(pan) * 100)}%`;
    },
  },
  {
    name: "filter",
    visual: "background color",
    value: 1,
    apply: (v) => {
      // we hear frequencies on a curve, so pow() feels better than map()
      let frequency = 80 * pow(250, v); // 80 Hz → 20000 Hz
      lowPass.freq(frequency);
      return `${round(frequency)} Hz`;
    },
  },
  {
    name: "resonance",
    visual: "spikes + color",
    value: 0,
    apply: (v) => {
      let q = 0.001 + v * 20; // boost around the filter frequency
      lowPass.res(q);
      return nf(q, 1, 1);
    },
  },
  {
    name: "delay",
    visual: "echo opacity",
    value: 0,
    apply: (v) => {
      delay.drywet(v); // 0 = no echo, 1 = only echo
      return `${round(v * 100)}%`;
    },
  },
  {
    name: "reverb",
    visual: "glow",
    value: 0,
    apply: (v) => {
      reverb.drywet(v); // 0 = dry room, 1 = big hall
      return `${round(v * 100)}%`;
    },
  },
  // buttons react to presses, not to values
  {
    name: "play / pause",
    visual: "motion",
    isButton: true,
    press: () => togglePlay(),
    status: () => (mySound.isPlaying() ? "playing" : "paused"),
  },

  // visual only: changes the shape, not the sound
  {
    name: "light",
    visual: "pitch black → full brightness",
    value: 1, // → full brightness
    apply: (v) => (v < 0.01 ? "pitch black" : `${round(v * 100)}%`),
  },
  {
    name: "wander",
    visual: "noise + sound movement",
    value: 0, // → the star stays in place
    apply: (v) => (v < 0.01 ? "fixed" : `${round(v * 100)}%`),
  },
  {
    name: "star points",
    visual: "number of spikes",
    value: 0.53, // → 54 points
    apply: (v) => `${starPoints(v)}`, // starPoints() is in visuals-view.js
  },
  {
    name: "echo outlines",
    visual: "number of outlines",
    value: 0.3, // → 6 outlines
    apply: (v) => `${echoCount(v)}`, // echoCount() is in visuals-view.js
  },
  {
    name: "echo grow",
    visual: "echo spacing",
    value: 1 / 3, // → x1
    apply: (v) => `x${nf(echoGrow(v), 1, 2)}`, // echoGrow() is in visuals-view.js
  },
  {
    name: "echo rotation",
    visual: "twist between outlines",
    value: 0.25, // → x1
    apply: (v) => `x${nf(echoRotation(v), 1, 2)}`, // echoRotation() is in visuals-view.js
  },
  {
    name: "switch view",
    visual: "link ↔ visuals",
    isButton: true,
    press: () => toggleView(),
    status: () => view,
  },
  {
    name: "UI on / off",
    visual: "hide tabs, hints + texts in visuals",
    isButton: true,
    press: () => toggleUI(),
    status: () => (showUI ? "on" : "off"),
  },
];
// (the list is shown in 2 columns: the first half on the left, the rest on the right)

// send every starting value to the sound
function applyAllSettings() {
  for (let setting of settings) {
    if (!setting.isButton) setting.text = setting.apply(setting.value);
  }
}

// the value (0 to 1) of a setting, found by its name
function settingValue(name) {
  return settings.find((s) => s.name === name).value;
}

// the text to display for a setting, e.g. "80%" or "playing"
function valueText(setting) {
  return setting.isButton ? setting.status() : setting.text;
}
