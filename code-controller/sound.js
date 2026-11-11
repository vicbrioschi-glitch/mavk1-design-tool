// MAMD Creative Coding & Future Web, 2026, Amaury Hamon

// SOUND
// The effects the sound goes through, and play / pause.
// (mySound itself is loaded in preload(), in sketch.js)

let lowPass; // filter: removes the high frequencies (not called "filter": p5 already has filter())
let delay; // echo
let reverb; // room / hall
let amplitude; // how loud the sound is right now (makes the shape pulse)

function setupSound() {
  // sound → filter → delay → reverb → speakers
  // (every effect is connected to the speakers by default, so disconnect first)
  lowPass = new p5.LowPass();
  delay = new p5.Delay();
  reverb = new p5.Reverb();
  mySound.disconnect();
  mySound.connect(lowPass);
  lowPass.disconnect();
  lowPass.connect(delay);
  delay.disconnect();
  delay.connect(reverb);

  delay.delayTime(0.25); // 1/8 note at 120 bpm
  delay.feedback(0.45);
  reverb.set(3, 2); // 3 seconds long, decay rate 2
  mySound.setLoop(true);

  amplitude = new p5.Amplitude();
  amplitude.smooth(0.8);
}

function togglePlay() {
  userStartAudio(); // browsers only allow sound after a click
  if (mySound.isPlaying()) {
    mySound.pause();
  } else {
    mySound.play();
  }
}

// until the first click the sound is off:
// show a reminder instead of the message
function hint(message) {
  if (getAudioContext().state !== "running") return "click once to turn the sound on";
  return message;
}
