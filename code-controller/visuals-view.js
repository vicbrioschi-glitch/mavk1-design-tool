// MAMD Creative Coding & Future Web, 2026, Amaury Hamon

// VIEW 2: VISUALS
// The same settings move a shape, the background and a text.
// Every setting goes from 0 to 1:
// use map() or lerpColor() to turn it into a position, a size, a color…

let angle = 0; // rotation of the shape
let noiseTime = 0; // where we are in the perlin noise (for "wander")

function drawVisuals() {
  let volume = settingValue("volume");
  let speed = settingValue("speed");
  let pan = settingValue("pan");
  let filterValue = settingValue("filter");
  let resonance = settingValue("resonance");
  let echo = settingValue("delay");
  let glow = settingValue("reverb");
  let light = settingValue("light");
  let wander = settingValue("wander");
  let points = starPoints(settingValue("star points"));
  let echoes = echoCount(settingValue("echo outlines"));
  let growMultiplier = echoGrow(settingValue("echo grow"));
  let twistMultiplier = echoRotation(settingValue("echo rotation"));

  // BACKGROUND color ← filter (closed filter = dark sound = dark night)
  let bg = lerpColor(color("#140f2d"), color("orangered"), filterValue);
  background(bg);

  // SHAPE position ← pan
  let x = map(pan, 0, 1, width * 0.2, width * 0.8);
  let y = height * 0.45;

  // SHAPE movement ← wander: 0 = stays in place, 1 = wanders around the screen
  // perlin noise gives a smooth random position,
  // and the louder the music, the faster we move through the noise
  let level = amplitude.getLevel(); // sound analysis: 0 (silence) to about 0.5 (loud)
  noiseTime += 0.003 + level * 0.04;
  // noise() mostly gives values between 0.2 and 0.8:
  // stretch them to 15%-85% of the screen (true = never go further)
  let wanderX = map(noise(noiseTime), 0.2, 0.8, 0.15, 0.85, true) * width;
  let wanderY = map(noise(noiseTime + 1000), 0.2, 0.8, 0.15, 0.85, true) * height; // +1000: another part of the noise
  x = lerp(x, wanderX, wander);
  y = lerp(y, wanderY, wander);

  // SHAPE size ← volume, and it pulses with the music
  let radius = map(volume, 0, 1, 0.03, 0.25) * min(width, height);
  radius *= 1 + level * 1.5;

  // SHAPE rotation speed ← speed (only turns while playing)
  if (mySound.isPlaying()) {
    angle += map(speed, 0, 1, 0.002, 0.06);
  }

  // SHAPE number of spikes ← star points
  // SHAPE spikes and color ← resonance (smooth white circle → spiky yellow star)
  let innerRadius = radius * map(resonance, 0, 1, 1, 0.4);
  let shapeColor = lerpColor(color(255), color("#ffe14d"), resonance);

  push();
  translate(x, y);
  rotate(angle);

  // GLOW ← reverb (a canvas shadow, blurred, same color as the shape)
  drawingContext.shadowBlur = glow * 80;
  drawingContext.shadowColor = shapeColor.toString();

  // ECHOES: outlines growing and trailing behind the shape
  // how many ← echo outlines
  // how visible ← delay (dry sound = no echo to see)
  // how much each one grows ← echo grow
  // how much each one turns ← echo rotation
  noFill();
  strokeWeight(3);
  for (let i = echoes; i >= 1; i--) {
    // the further the echo, the more transparent
    let opacity = map(i, 0, echoes + 1, 255, 0) * echo;
    stroke(red(shapeColor), green(shapeColor), blue(shapeColor), opacity);
    let grow = 1 + i * 0.2 * growMultiplier;
    push();
    rotate(-i * 0.12 * twistMultiplier);
    star(0, 0, radius * grow, innerRadius * grow, points);
    pop();
  }

  noStroke();
  fill(shapeColor);
  star(0, 0, radius, innerRadius, points);

  fill("red");
  anotherShape(radius);
  pop();

  drawVisualsText(filterValue, glow);

  // LIGHT ← light: a black layer over everything
  // (light 1 = see-through, light 0 = solid black)
  push();
  noStroke();
  fill(0, (1 - light) * 255);
  rect(0, 0, width, height);
  pop();
}

function drawVisualsText(filterValue, glow) {
  if (!showUI) return; // UI off: no text at all

  // TEXT shows the last setting you moved, then fades out
  let label = "move a control";
  let opacity = 120;
  let popScale = 1;
  if (lastMoved) {
    let elapsed = millis() - lastMovedTime;
    label = `${lastMoved.name}  ${valueText(lastMoved)}`;
    opacity = map(elapsed, 1500, 2500, 255, 0, true);
    popScale = map(elapsed, 0, 250, 1.25, 1, true); // bigger for a moment when it changes
  }

  // TEXT color ← filter: dark text on a bright background, white text on a dark one
  let textColor = filterValue > 0.55 ? color("#140f2d") : color(255);
  let r = red(textColor);
  let g = green(textColor);
  let b = blue(textColor);

  push();
  textAlign(CENTER, CENTER);
  drawingContext.shadowBlur = glow * 30; // GLOW ← reverb, on the text too
  drawingContext.shadowColor = textColor.toString();
  textSize(min(width * 0.06, 64) * popScale);
  fill(r, g, b, opacity);
  text(label, width / 2, height * 0.85);

  textSize(12);
  fill(r, g, b, 160);
  text(hint("tab: link controls · click: play / pause · U: hide UI"), width / 2, height - 30);
  pop();
}

// These turn a setting (0 to 1) into the number the visuals use.
// They are used by drawVisuals() and by the text in the settings list.

// "star points" → a number of spikes, from 3 to 100
function starPoints(v) {
  return round(map(v, 0, 1, 3, 100));
}

// "echo outlines" → how many outlines, from 0 to 20
function echoCount(v) {
  return round(map(v, 0, 1, 0, 20));
}

// "echo grow" → how much bigger each echo is: x0 (all the same size) to x3
function echoGrow(v) {
  return map(v, 0, 1, 0, 3);
}

// "echo rotation" → how much each echo turns: x0 (all aligned) to x4
function echoRotation(v) {
  return map(v, 0, 1, 0, 4);
}

// a star with `points` spikes, a circle when both radiuses are the same
function star(x, y, outerRadius, innerRadius, points) {
  beginShape();
  for (let i = 0; i < points * 2; i++) {
    let a = (i * PI) / points;
    let r = i % 2 === 0 ? outerRadius : innerRadius;
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape(CLOSE);
}

function anotherShape(outerRadius){
  rect(100, 100, outerRadius, 50)
}
