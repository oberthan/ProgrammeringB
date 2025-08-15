let graf;
let vertices = [];
function setup(){
    createCanvas(400, 400);
    graf = new Graf(10);
    for(let i = 0; i < graf.v; i++) {
        vertices.push([random(400), random(400)]);
        const count = Math.floor(Math.random() * 2) + 1; // 1 to 3 numbers
        const numbers = new Set();

        while (numbers.size < count) {
            let num = Math.floor(Math.random() * (graf.v));
            if (num !== i) {
                numbers.add(num);
            }
        }
        numbers.forEach(n => {
            graf.addOneWayEdge(i,n);
        })
    }
}

let highlightedPath;
function selectShortestPath(v, m){
    highlightedPath = graf.wheightedShortestPathGPT(v, m);
}
function draw(){
    background(255);

    vertices.forEach((vertex, i) => {
        circle(vertex[0], vertex[1], 10);
        graf.nK[i].forEach((nK, k) => {
            let toVert = vertices[nK];
            if(highlightedPath&&highlightedPath.includes(i)&&highlightedPath.includes(nK)&&(abs(highlightedPath.indexOf(i)-highlightedPath.indexOf(nK))===1)) {
                stroke(255, 0, 0);
                strokeWeight(4)
            }
            line(vertex[0], vertex[1], toVert[0], toVert[1]);
            stroke(0)
            strokeWeight(1)

        });
        text(i, vertex[0]+10, vertex[1])

    });
}