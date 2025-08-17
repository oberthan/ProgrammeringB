let graf;
let grafSize = 10;
let vertices = [];
let highlightedPath = null;
let selectedNodes = [];

let animationIndex = -1;
let animationDelay = 500; // ms between steps
let lastStepTime = 0;

let pathOutput;
let draggingVertex = -1;
let edgeMode = false;
let tempEdge = null; // show preview while connecting

function SetupGraf() {
    graf = new Graf(vertices.length);
    // Add edges (based on user connections in graf.nK)
    // graf.nK is handled directly now when user adds edges
}

function setup() {
    createCanvas(600, 500);
    resetGraph();

    let resetButton = createButton("🔄 Reset Graph");
    resetButton.mousePressed(resetGraph);

    let edgeButton = createButton("🔗 Toggle Edge Mode");
    edgeButton.mousePressed(() => {
        edgeMode = !edgeMode;
        tempEdge = null;
    });

    pathOutput = createP("Path: (none)").style("font-size", "16px");
}

function resetGraph() {
    vertices = [];
    graf = new Graf(0);   // start fresh
    graf.nK = [];
    graf.vK = [];

    highlightedPath = null;
    selectedNodes = [];
    animationIndex = -1;
    if (pathOutput) pathOutput.html("Path: (none)");

    // create some default vertices
    for (let i = 0; i < grafSize; i++) {
        addVertex(random(50, 550), random(50, 450));
    }
}

function addVertex(x, y) {
    let id = vertices.length;
    vertices.push([x, y]);

    graf.v = vertices.length;
    graf.nK.push([]);   // add empty adjacency list
    graf.vK.push({});   // if you store weights separately
}

function addEdge(v1, v2) {
    if (v1 === v2) return;
    if (!graf.nK[v1].includes(v2)) graf.addEdge(v1, v2, distBetween(vertices[v1], vertices[v2]));
}

function distBetween(a, b) {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function draw() {
    background(245);

    // Draw edges
    for (let i = 0; i < graf.v; i++) {
        let vertex = vertices[i];
        graf.nK[i].forEach(nK => {
            let toVert = vertices[nK];
            let shouldHighlight = false;

            if (highlightedPath && animationIndex >= 0) {
                let maxEdge = animationIndex;
                for (let j = 0; j < maxEdge; j++) {
                    if (
                        (highlightedPath[j] === i && highlightedPath[j + 1] === nK) ||
                        (highlightedPath[j + 1] === i && highlightedPath[j] === nK)
                    ) {
                        shouldHighlight = true;
                        break;
                    }
                }
            }

            if (shouldHighlight) {
                stroke(255, 0, 0);
                strokeWeight(4);
            } else {
                stroke(0, 100);
                strokeWeight(1);
            }
            line(vertex[0], vertex[1], toVert[0], toVert[1]);
        });
    }

    // Draw temporary edge preview
    if (tempEdge !== null) {
        stroke(0, 150, 255);
        strokeWeight(2);
        line(vertices[tempEdge][0], vertices[tempEdge][1], mouseX, mouseY);
    }

    // Draw vertices
    for (let i = 0; i < graf.v; i++) {
        let [x, y] = vertices[i];
        let hovered = dist(mouseX, mouseY, x, y) < 12;

        if (selectedNodes.includes(i)) {
            fill(0, 200, 255);
        } else if (hovered) {
            fill(0, 255, 100);
        } else {
            fill(255);
        }
        stroke(0);
        circle(x, y, 24);

        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        text(i, x, y);
    }

    // Run animation
    if (highlightedPath && animationIndex >= 0) {
        if (millis() - lastStepTime > animationDelay) {
            if (animationIndex < highlightedPath.length - 1) {
                animationIndex++;
                lastStepTime = millis();
            }
        }
    }

    // Show mode
    noStroke();
    fill(0);
    textSize(14);
    textAlign(LEFT);
    text(edgeMode ? "Edge Mode: ON (click two nodes to connect)" : "Normal Mode: ON (click two nodes to find path)", 10, height - 20);

    if (highlightedPath) {
        let total = 0;
        for (let i = 0; i < highlightedPath.length - 1; i++) {
            let a = highlightedPath[i];
            let b = highlightedPath[i + 1];
            let idx = graf.nK[a].indexOf(b);
            total += graf.vK[a][idx];
        }
        text("Path length: " + total.toFixed(2), 10, 20);
    }
}

function updateEdgeWeights() {
    for (let i = 0; i < graf.v; i++) {
        for (let k = 0; k < graf.nK[i].length; k++) {
            let neighbor = graf.nK[i][k];
            let d = distBetween(vertices[i], vertices[neighbor]);

            // update correct slot (dictionary style)
            graf.vK[i][neighbor] = d;
        }
    }
}

function mousePressed() {
    for (let i = 0; i < vertices.length; i++) {
        let [x, y] = vertices[i];
        if (dist(mouseX, mouseY, x, y) < 12) {
            if (edgeMode) {
                if (tempEdge === null) {
                    tempEdge = i; // first node
                } else {
                    addEdge(tempEdge, i);
                    tempEdge = null;
                }
            } else {
                selectedNodes.push(i);
                if (selectedNodes.length === 2) {
                    highlightedPath = graf.wheightedShortestPathGPT(selectedNodes[0], selectedNodes[1]);
                    selectedNodes = [];
                    animationIndex = 0;
                    lastStepTime = millis();

                    if (highlightedPath && pathOutput) {
                        pathOutput.html("Path: " + highlightedPath.join(" → "));
                    } else {
                        pathOutput.html("Path: (no path found)");
                    }
                }
            }
            draggingVertex = i; // allow dragging
            return;
        }
    }
}

function mouseDragged() {
    if (draggingVertex !== -1) {
        vertices[draggingVertex][0] = mouseX;
        vertices[draggingVertex][1] = mouseY;
        updateEdgeWeights(); // keep distances in sync
    }
}

function mouseReleased() {
    draggingVertex = -1;
}
