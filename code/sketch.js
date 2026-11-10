let soundfile, fft;
let ui = {};
const PANEL_W = 240;
let panelOpen = true;
let panelCur = PANEL_W;
let sBass = 0, sVoice = 0;
let voiceMix = 0;

// Points aléatoires : angle + distance relative (0 → 1)
const NB_DOTS = 40;
let dots = [];

async function setup() {
  createCanvas(windowWidth, windowHeight);
  buildPanel();

  for (let i = 0; i < NB_DOTS; i++) {
    dots.push({ a: random(TWO_PI), r: random(1), e: 0 });
  }

  soundfile = await loadSound('/code/son/queen.mov');
  fft = new p5.FFT(0.8, 1024);
  soundfile.connect(fft);
  soundfile.loop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed(event) {
  if (!soundfile) return;
  if (event && event.target && event.target.closest('#panel, #open')) return;
  if (!soundfile.isPlaying()) soundfile.play();
  else soundfile.pause();
}

function draw() {
  if (!fft) return;

  fft.smooth(ui.smooth.value());
  const spectrum = fft.analyze();
  const sens = ui.sens.value();

  const bass  = fft.getEnergy('bass') / 255;
  const voice = fft.getEnergy(300, 3000) / 255;

  sBass  = lerp(sBass, bass, 0.3);
  sVoice = lerp(sVoice, voice, 0.3);

  // Fond qui change quand la voix est détectée
  const voiceActive = sVoice > ui.threshold.value();
  voiceMix = lerp(voiceMix, voiceActive ? 1 : 0, 0.15);
  background(lerpColor(color(ui.bg.value()), color(ui.bgVoice.value()), voiceMix));

  // Centre qui s'adapte au panneau
  panelCur = lerp(panelCur, panelOpen ? PANEL_W : 0, 0.15);
  const cx = (width - panelCur) / 2;
  const cy = height / 2;
  const base = ui.size.value();

  // Cercle central : basses
  if (ui.showBass.checked()) {
    noStroke();
    fill(ui.cBass.value());
    circle(cx, cy, (base + sBass * sens * 150) * 2);
  }

}

/* ---------- Panneau (HTML) ---------- */

function buildPanel() {
  const el  = id => document.getElementById(id);
  const num = id => ({ value: () => parseFloat(el(id).value) });
  const str = id => ({ value: () => el(id).value });
  const chk = id => ({ checked: () => el(id).checked });

  ui.size = num('size');       ui.zone = num('zone');
  ui.dotSize = num('dotSize'); ui.sens = num('sens');
  ui.smooth = num('smooth');   ui.threshold = num('threshold');

  ui.showBass = chk('showBass');   ui.showTreble = chk('showTreble');

  ui.bg = str('bg');           ui.bgVoice = str('bgVoice');
  ui.cBass = str('cBass');     ui.cTreble = str('cTreble');

  document.querySelectorAll('input[type="range"]').forEach(r => {
    const out = document.querySelector(`output[for="${r.id}"]`);
    const update = () => out.textContent = r.value;
    r.addEventListener('input', update);
    update();
  });

  // Fermer / rouvrir
  const setPanel = open => {
    panelOpen = open;
    document.body.classList.toggle('closed', !open);
  };
  el('close').addEventListener('click', () => setPanel(false));
  el('open').addEventListener('click', () => setPanel(true));
}