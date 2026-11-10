let soundfile, fft; 

async function setup() {
 createCanvas(windowWidth, windowHeight);
 soundfile = await loadSound('/code/son/queen.mov');
 textAlign(RIGHT);
 textSize(10);

 fft = new p5.FFT();
 soundfile.connect(fft);
 soundfile.loop();
}

function mousePressed() {
 if(!soundfile.isPlaying()) {
   soundfile.play();
 }
 else {
   soundfile.stop();
 }
}

function draw() {
 background(220);
 
 text('tap to play', width -10, height/2 - 20);
 let spectrum = fft.analyze();
 
 noStroke();
 fill(0);

 for (let i = 0; i < spectrum.length; i++) {
   let x = map(i, 0, spectrum.length, 0, width);     
   let h = -height + map(spectrum[i], 0, 0.1, height, 0);
   rect(x, height, width / spectrum.length, h * 4)
 }
}