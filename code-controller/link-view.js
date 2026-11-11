// MAMD Creative Coding & Future Web, 2026, Amaury Hamon

// VIEW 1: LINK CONTROLS
// One row per setting: click a row, then move a control on the controller
// to link them (the linking itself happens in midi.js).

const FIRST_ROW_Y = 96;

function drawLinkView() {
  background("orangered");
  fill(255);

  textAlign(CENTER, TOP);
  textSize(14);
  text(midiStatus, width / 2, 70);

  drawSettings();

  fill(255);
  textAlign(CENTER, BOTTOM);
  textSize(14);
  text(`last message: ${lastMessage}`, width / 2, height - 34);
  textSize(12);
  text(hint("click a setting, then move a control to link it · backspace unlink · esc cancel"), width / 2, height - 14);
}

function drawSettings() {
  for (let i = 0; i < settings.length; i++) {
    let setting = settings[i];
    let box = rowBox(i);

    let linkText = linkedControl(setting) || "click to link";
    if (setting === learning) {
      linkText = "move a knob, fader or button…";
      // blinking highlight
      if (frameCount % 40 < 20) {
        fill(255, 50);
        rect(box.x - 10, box.y - 6, box.w + 20, box.h + 12, 8);
      }
    }

    // line 1: name and value
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    text(setting.name, box.x, box.y);
    textAlign(RIGHT, TOP);
    text(valueText(setting), box.x + box.w, box.y);

    // line 2: what it changes in the visuals, and the linked control
    textSize(11);
    textAlign(LEFT, TOP);
    fill(255, 170);
    text(`→ ${setting.visual}`, box.x, box.y + 20);
    textAlign(RIGHT, TOP);
    fill(255);
    text(linkText, box.x + box.w, box.y + 20);

    // line 3: bar (buttons have no value, only the empty bar)
    fill(255, 70);
    rect(box.x, box.y + 36, box.w, 10, 5);
    if (!setting.isButton) {
      fill(255);
      rect(box.x, box.y + 36, box.w * setting.value, 10, 5);
    }
  }
}

// position and size of the row of setting number i
// 2 columns: the first half of the settings on the left, the rest on the right
// (1 column if the window is narrow)
function rowBox(i) {
  let columns = width > 800 ? 2 : 1;
  let rowsPerColumn = ceil(settings.length / columns);
  let column = floor(i / rowsPerColumn); // 0 = left, 1 = right
  let row = i % rowsPerColumn; // position inside the column

  let gap = 48; // space between the columns
  let w = min((width - 80 - gap * (columns - 1)) / columns, 520);
  let totalWidth = columns * w + (columns - 1) * gap;
  // the shorter the window, the closer the rows
  let rowHeight = constrain((height - FIRST_ROW_Y - 60) / rowsPerColumn, 50, 60);

  return {
    x: (width - totalWidth) / 2 + column * (w + gap),
    y: FIRST_ROW_Y + row * rowHeight,
    w: w,
    h: 46,
  };
}

// the setting under the mouse, or undefined
function settingAt(x, y) {
  for (let i = 0; i < settings.length; i++) {
    if (isInside(x, y, rowBox(i))) return settings[i];
  }
  return undefined;
}
