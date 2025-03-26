class ButtonTriangle extends ButtonBase {

  constructor(posX, posY, oneX, oneY, twoX, twoY, farve, hoverFarve) {
    super(posX, posY);
    this.farve = farve;
    this.hoverFarve = hoverFarve;
    this.oneX = oneX;
    this.oneY = oneY;
    this.twoX = twoX;
    this.twoY = twoY;
    noStroke();
  }
  
  drawKnap() {
    if (this.isInside() === true)
      fill(this.hoverFarve);
    else
      fill(this.farve);

    let x1 = this.posX;
    let y1 = this.posY;
    let x2 = this.posX + this.oneX;
    let y2 = this.posY + this.oneY;
    let x3 = this.posX + this.twoX;
    let y3 = this.posY + this.twoY;
    triangle(x1, y1, x2, y2, x3, y3);
  }
  area(x1, y1, x2, y2, x3, y3)
  {
    return Math.abs((x1*(y2-y3) + x2*(y3-y1)+ x3*(y1-y2))/2.0);
  }

  /* A function to check whether point P(x, y) lies inside the triangle formed
  by A(x1, y1), B(x2, y2) and C(x3, y3) */
  isInside()
  {
    let x1 = this.posX;
    let y1 = this.posY;
    let x2 = this.posX + this.oneX;
    let y2 = this.posY + this.oneY;
    let x3 = this.posX + this.twoX;
    let y3 = this.posY + this.twoY;
    let x = mouseX;
    let y = mouseY;
    /* Calculate area of triangle ABC */
    let A = this.area (x1, y1, x2, y2, x3, y3);

    /* Calculate area of triangle PBC */
    let A1 = this.area (x, y, x2, y2, x3, y3);

    /* Calculate area of triangle PAC */
    let A2 = this.area (x1, y1, x, y, x3, y3);

    /* Calculate area of triangle PAB */
    let A3 = this.area (x1, y1, x2, y2, x, y);

    /* Check if sum of A1, A2 and A3 is same as A */
    return (A === A1 + A2 + A3);
  }
}
