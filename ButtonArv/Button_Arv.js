// tilføj et par subklasser til projektet

let button, button2;
function setup() {
  createCanvas(800,800);
  button = new ButtonCircle(width/2, height/2, 200, color(200,0,0), color(200,200,0));
  button2 = new ButtonTriangle(width/1.25, height/2, -200, 200,0,-200, color(200,0,0), color(200,200,0));
  console.log(button);  // se button-objektets arvekæde
  console.log(Object.getPrototypeOf(button));  // se button-objektets prototype-klasse
  
}


function draw() {
  button.drawKnap();
  button2.drawKnap();
}
