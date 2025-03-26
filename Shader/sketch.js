let shdr;
let vertSource, fragSource;

function preload() {
  vertSource = loadStrings('assets/basic.vert');
  fragSource = loadStrings('assets/basic.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  vertSource = resolveLygia(vertSource);
  fragSource = resolveLygia(fragSource);
  // Hi There! this ^ two lines ^ use `resolveLygia( ... )` to resolve the LYGIA dependencies from the preloaded `shader.vert` and `shader.frag` files. 
  // Check `index.html` to see how it's first added to the project. 
  // And then, the `shader.frag` file to how it's used.

  shdr = createShader(vertSource, fragSource);


}

function draw() {
  shader(shdr);

  shdr.setUniform('u_resolution', [width, height] );
  shdr.setUniform('u_mouse', [mouseX, mouseY]);
  shdr.setUniform('u_time', millis() / 1000.0);

  rect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}