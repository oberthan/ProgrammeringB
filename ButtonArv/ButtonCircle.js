class ButtonCircle extends ButtonBase {

  constructor(posX, posY, diameter, farve, hoverFarve) {
    super(posX, posY);
    this.farve = farve;
    this.hoverFarve = hoverFarve;
    this.diameter = diameter;
    noStroke();
  }
  
  drawKnap() {
    if (this.overCircle() == true)
      fill(this.hoverFarve);
    else
      fill(this.farve);
    ellipse(this.posX, this.posY, this.diameter, this.diameter);
  }
  overCircle() {
    let disX = this.posX - mouseX;
    let disY = this.posY - mouseY;
    if (sqrt(disX*disX + disY*disY) < this.diameter/2) {
      return true;
    } else {
      return false;
    }
  }
}
