// MAMD Creative Coding & Future Web, 2026, Amaury Hamon

// MIDI
// Read the controller with Web MIDI, and link its controls to the settings.
// Web MIDI works in Chrome / Edge, not in Safari.

let midiStatus = "waiting for MIDI…";
let lastMessage = "nothing yet"; // last MIDI message, to see what the controller sends
let mapping = {}; // which control → which setting, e.g. { "cc 7 · ch 1": "volume" }
let lastValues = {}; // last value of each control (to detect button presses)
let learning; // the setting waiting for a control, or undefined

let lastMoved; // last setting moved on the controller (shown in the visuals)
let lastMovedTime = 0;

function setupMIDI() {
  loadMapping();

  // ask the browser for the MIDI devices
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDIReady, () => {
      midiStatus = "MIDI access refused (allow it in the browser address bar)";
    });
  } else {
    midiStatus = "Web MIDI is not supported in this browser, try Chrome or Edge";
  }
}

function onMIDIReady(midiAccess) {
  connectInputs(midiAccess);
  // run again when a controller is plugged in or unplugged
  midiAccess.onstatechange = () => connectInputs(midiAccess);
}

function connectInputs(midiAccess) {
  let names = [];
  for (let input of midiAccess.inputs.values()) {
    if (input.state !== "connected") continue;
    input.onmidimessage = onMIDIMessage; // called for every knob / fader move
    names.push(input.name);
  }
  if (names.length > 0) {
    midiStatus = `connected: ${names.join(", ")}`;
  } else {
    midiStatus = "no MIDI controller found, plug one in";
  }
}

function onMIDIMessage(message) {
  // a MIDI message is 3 numbers: [status, number, value]
  let [status, number, value] = message.data;
  // the status number holds 2 things: the message type and the channel
  let type = status & 0xf0; // 0xB0 = knob / fader (CC), 0x90 = note on, 0x80 = note off
  let channel = (status & 0x0f) + 1; // 1 to 16

  if (type === 0x80) {
    // note off is the same as a note with value 0
    type = 0x90;
    value = 0;
  }
  // ignore all the other messages (clock, sysex…)
  if (type !== 0xb0 && type !== 0x90) return;

  // a name for this control, e.g. "cc 7 · ch 1" or "note 60 · ch 1"
  let control = `${type === 0xb0 ? "cc" : "note"} ${number} · ch ${channel}`;
  lastMessage = `${control} → ${value}`;

  if (learning) {
    linkControl(control, learning);
    learning = undefined;
    lastValues[control] = value;
    return;
  }

  let setting = settings.find((s) => s.name === mapping[control]);
  if (setting && setting.isButton) {
    // buttons send 127 when pressed and 0 when released: react on press only
    let wasUp = (lastValues[control] || 0) < 64;
    if (value >= 64 && wasUp) {
      setting.press();
      lastMoved = setting;
      lastMovedTime = millis();
    }
  } else if (setting) {
    setting.value = value / 127;
    setting.text = setting.apply(setting.value);
    lastMoved = setting;
    lastMovedTime = millis();
  }
  lastValues[control] = value;
}

// ---------------------------------------------------------------------------
// linking controls to settings

function linkControl(control, setting) {
  // one setting = one control: remove the old link of this setting
  unlink(setting);
  mapping[control] = setting.name;
  saveMapping();
}

function unlink(setting) {
  for (let control in mapping) {
    if (mapping[control] === setting.name) delete mapping[control];
  }
}

// the control linked to a setting, e.g. "cc 7 · ch 1", or undefined
function linkedControl(setting) {
  for (let control in mapping) {
    if (mapping[control] === setting.name) return control;
  }
  return undefined;
}

// keep the links after reloading the page
function saveMapping() {
  try {
    localStorage.setItem("midi-controller-mapping", JSON.stringify(mapping));
  } catch (error) {}
  console.log("mapping =", JSON.stringify(mapping));
}

function loadMapping() {
  try {
    mapping = JSON.parse(localStorage.getItem("midi-controller-mapping")) || {};
  } catch (error) {
    mapping = {};
  }
}
