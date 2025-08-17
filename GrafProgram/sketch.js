let graf;
let grafSize = 10;
let vertices = [];
let highlightedPath = null;
let selectedNodes = [];

let animationIndex = -1;
let animationDelay = 100; // ms between steps
let lastStepTime = 0;

let pathOutput;
let draggingVertex = -1;
let edgeMode = false;
let tempEdge = null; // show preview while connecting
let randomWebButton;

function SetupGraf() {
    graf = new Graf(vertices.length);
    // Add edges (based on user connections in graf.nK)
    // graf.nK is handled directly now when user adds edges
}

function setup() {
    createCanvas(600, 500);
    resetGraph();

    let resetButton = createButton("Reset Graph");
    resetButton.mousePressed(resetGraph);

    let edgeButton = createButton("Toggle Edge Mode");
    edgeButton.mousePressed(() => {
        edgeMode = !edgeMode;
        tempEdge = null;
    });

    let randomWebButton = createButton("Random Graph");
    randomWebButton.mousePressed(generateRandomGraph)

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

function generateRandomGraph() {
    // Clear existing edges
    for (let i = 0; i < graf.v; i++) {
        graf.nK[i] = [];
        graf.vK[i] = {};
    }

    // Randomly connect vertices
    for (let i = 0; i < graf.v; i++) {
        // Random number of edges per vertex (1 to 3)
        let count = Math.floor(Math.random() * 0) + 2;

        while (graf.nK[i].length < count) {
            let j = Math.floor(Math.random() * graf.v);
            if (j !== i && !graf.nK[i].includes(j)) {
                addEdge(i, j); // adds both directions
            }
        }
    }
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
            let midX = (vertex[0] + toVert[0])/2;
            let midY = (vertex[1] + toVert[1])/2;
            let w = graf.vK[i][nK];
            fill(0);
            noStroke();
            textAlign(CENTER, CENTER);
            text(nf(w, 1, 1), midX, midY - 10);
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
        for (let neighbor of graf.nK[i]) {
            graf.vK[i][neighbor] = distBetween(vertices[i], vertices[neighbor]);
        }
    }
}

function findEdgeUnderMouse() {
    for (let i = 0; i < graf.v; i++) {
        for (let neighbor of graf.nK[i]) {
            // avoid double checking the same undirected edge
            if (i > neighbor) continue;

            let v1 = vertices[i];
            let v2 = vertices[neighbor];
            if (distToSegment(mouseX, mouseY, v1, v2) < 6) return [i, neighbor];
        }
    }
    return null;
}

function distToSegment(px, py, v1, v2) {
    let x = px, y = py;
    let x1 = v1[0], y1 = v1[1];
    let x2 = v2[0], y2 = v2[1];
    let A = x - x1;
    let B = y - y1;
    let C = x2 - x1;
    let D = y2 - y1;

    let dot = A*C + B*D;
    let len_sq = C*C + D*D;
    let param = (len_sq !== 0) ? dot / len_sq : -1;

    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param*C; yy = y1 + param*D; }

    let dx = x - xx;
    let dy = y - yy;
    return Math.sqrt(dx*dx + dy*dy);
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
    let edgeClicked = findEdgeUnderMouse();
    if (edgeClicked) {
        let [a, b] = edgeClicked;
        let newW = prompt(`Set new weight for edge ${a}-${b}`, graf.vK[a][b].toFixed(1));
        if (newW !== null && !isNaN(newW)) {
            let w = parseFloat(newW);
            graf.vK[a][b] = w;
            graf.vK[b][a] = w; // undirected edge
        }
        return; // skip vertex selection if edge clicked
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
