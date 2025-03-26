let boidgrid = [];

let leftmargin = 100;
let rightmargin = 100;
let bottommargin = 100;
let topmargin = 100;

let gridsize;

let tpf;

function setup() {
    createCanvas(900, 600);

    textSize(16);

    let viewRange = 14;
    let getOutRange = 5;
    let alignFactor = 0.075;
    let separateFactor = 0.005;
    let centerFactor = 0.002;
    let speedlimit = 3;
    let minSpeed = 1;
    let turnFactor = 0.3;

    gridsize = viewRange;

    boidgrid = Array.from({ length: ceil(width / viewRange) }, () =>
        Array.from({ length: ceil(height / viewRange) }, () => [])
    );



    for (let i = 0; i < 2000; i++) {
        let team = floor(random(2));
        boidgrid[0][0].push(
            new Boid(
                viewRange,
                getOutRange,
                alignFactor,
                separateFactor,
                centerFactor,
                speedlimit*(2-team),
                minSpeed,
                turnFactor,
                [255-255*team,0+155*team,0]
            )
        );
    }
}

let lastMillis = 0;
let lastLastMillis = 0;

function draw() {
    //console.log("new frame" + frameCount);
    background(255, 255, 255, 180);

    fill(255);
    stroke(0,0,0,0);
    rect(60,0,120, 20);
    fill(0);
    stroke(0);
    tpf = text('Time/Frame: ' + round((millis()-lastLastMillis) / 2) + 'ms, ' + round(1/((millis()-lastLastMillis) / 2000)) + 'fps', 20, 20);

    lastLastMillis = lastMillis;
    lastMillis = millis();

    let boidsCopy = boidgrid.map(row => row.slice());
    let newboidgrid = Array.from({ length: boidgrid.length }, () =>
        Array.from({ length: boidgrid[0].length }, () => [])
    );
    //console.log(newboidgrid);

    for (let x = 0; x < boidsCopy.length; x++) {
        for (let y = 0; y < boidsCopy[x].length; y++) {
            //console.log(boidsCopy[x][y].length);
            for (let i = 0; i < boidsCopy[x][y].length; i++) {
                let standin = [];
                for (let ax = -1; ax <= 1; ax++) {
                    if (ax + x >= 0 && ax + x < boidsCopy.length)
                        for (let ay = -1; ay <= 1; ay++) {
                            if (ay + y >= 0 && ay + y < boidsCopy[x].length) {
                                standin = standin.concat(boidsCopy[ax + x][ay + y]);
                            }
                        }
                }

                boidgrid[x][y][i].simulate(standin, newboidgrid);
                stroke(boidgrid[x][y][i].boidColor);
                circle(boidgrid[x][y][i].x, boidgrid[x][y][i].y, 2);
                line(
                    boidgrid[x][y][i].x,
                    boidgrid[x][y][i].y,
                    boidgrid[x][y][i].vx + boidgrid[x][y][i].x,
                    boidgrid[x][y][i].vy + boidgrid[x][y][i].y
                );
            }
        }
    }

    //console.log(newboidgrid);

    boidgrid = newboidgrid;
}

function Boid(
    viewRange,
    getOutRange,
    alignFactor,
    separateFactor,
    centerFactor,
    speedlimit,
    minSpeed,
    turnFactor,
    boidColor
) {
    this.viewRange = viewRange;
    this.getOutRange = getOutRange;
    this.alignFactor = alignFactor;
    this.separateFactor = separateFactor;
    this.centerFactor = centerFactor;
    this.speedlimit = speedlimit;
    this.minSpeed = minSpeed;
    this.turnFactor = turnFactor;
    this.boidColor = boidColor;
    this.x = random(10, width - 10);
    this.y = random(10, height - 10);
    this.vx = random(-speedlimit, speedlimit);
    this.vy = random(-speedlimit, speedlimit);

    this.simulate = function (boidsArr, newboidgrid) {
        //console.log("simulated");
        this.align(boidsArr);
        this.separate(boidsArr);
        this.center(boidsArr);
        this.screenEdge();
        let speed = dist(0, 0, this.vx, this.vy);
        if (speed > speedlimit) {
            this.vx = (this.vx / speed) * speedlimit;
            this.vy = (this.vy / speed) * speedlimit;
        } else if (speed < minSpeed) {
            this.vx = (this.vx / speed) * minSpeed;
            this.vy = (this.vy / speed) * minSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;

        //console.log(newboidgrid);
        let i = floor(max(min(this.x, width), 0) / gridsize);
        let j = floor(max(min(this.y, height), 0) / gridsize);
        //console.log(`i: ${i}, j: ${j}, newboidgrid[i][j]:`, newboidgrid[i][j]);

        if ( i >= 0 && i < newboidgrid.length && j >= 0 && j < newboidgrid[0].length) {
            newboidgrid[i][j].push(this);
        } else {
            console.error(`newboidgrid[${i}][${j}] is not an array`);
        }
    };

    this.align = function (boidsArr) {
        let boidcount = 0;
        let avervx = 0;
        let avervy = 0;
        for (let i = 0; i < boidsArr.length; i++) {
            let boid = boidsArr[i];
            let distance = dist(this.x, this.y, boid.x, boid.y);

            if (distance < viewRange && distance > 0) {
                boidcount++;
                avervx += boid.vx;
                avervy += boid.vy;
            }
        }
        if (boidcount > 0) {
            avervx /= boidcount;
            avervy /= boidcount;

            this.vx += (avervx - this.vx) * alignFactor;
            this.vy += (avervy - this.vy) * alignFactor;

            //stroke(0,255,0);
            //line(this.x, this.y, this.x+(avervx-this.vx)*5, this.y + (avervy-this.vy)*5);
            //stroke(0);
        }
    };
    this.separate = function (boidsArr) {
        let averx = 0;
        let avery = 0;
        for (let i = 0; i < boidsArr.length; i++) {
            let boid = boidsArr[i];
            let distance = dist(this.x, this.y, boid.x, boid.y);

            if (distance < getOutRange && distance > 0) {
                averx += this.x - boid.x;
                avery += this.y - boid.y;
            }
            this.vx += averx * separateFactor;
            this.vy += avery * separateFactor;
        }
    };
    this.center = function (boidsArr) {
        let boidcount = 0;
        let averx = 0;
        let avery = 0;
        for (let i = 0; i < boidsArr.length; i++) {
            let boid = boidsArr[i];
            let distance = dist(this.x, this.y, boid.x, boid.y);

            if (distance < viewRange && distance > 0) {
                boidcount++;
                averx += boid.x;
                avery += boid.y;
            }
        }
        if (boidcount > 0) {
            averx /= boidcount;
            avery /= boidcount;

            this.vx += (averx - (this.x + this.vx)) * centerFactor;
            this.vy += (avery - (this.y + this.vy)) * centerFactor;
            //stroke(0,0,255);
            //line(this.x, this.y, (averx), (avery));
            //stroke(0);
        }
    };
    this.screenEdge = function () {
        if (this.x < leftmargin) this.vx = this.vx + turnFactor;
        if (this.x > width - rightmargin) this.vx = this.vx - turnFactor;
        if (this.y > height - bottommargin) this.vy = this.vy - turnFactor;
        if (this.y < topmargin) this.vy = this.vy + turnFactor;
    };
}
