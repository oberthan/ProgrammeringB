// kode fra Nature of code-bog 
// Position
let angle = 0;
// Velocity
let angleVelocity = 0;
// Acceleration
let angleAcceleration = 0.0001;

function setup() {
  const c = createCanvas(300, 100);
  c.id('canvas2');  // giver det en id
}

function draw() {
  clear();

  translate(width / 2, height / 2);
  rotate(angle);

  fill('#694551');
  stroke(0);
  strokeWeight(2);
  line(-30, 0, 30, 0);

  noStroke();
  circle(30, 0, 16);
  circle(-30, 0, 16);

  let disX = width/2 - mouseX;
  let disY = height/2 - mouseY;
    if (sqrt(disX*disX + disY*disY) < 60/2) {
        angleVelocity -= angleAcceleration *2;
        console.log("vend turen");
    } else if(angleVelocity < 0.25) {
        angleVelocity += angleAcceleration;
    }
  
  angle += angleVelocity;
}