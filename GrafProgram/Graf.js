class Graf {
    constructor(v) {
        this.v = v;
        this.e=0;
        this.nK = [];
        this.vK = [];
        for(var i=0;i<this.v;i++) {
            this.nK.push([]);
            this.vK.push([]);
        }
    }
    addEdge(v, m, w1 = 1, w2 =w1){
        this.e++;
        this.addOneWayEdge(v, m,w1, false);
        this.addOneWayEdge(m, v,w2, false);
    }
    addOneWayEdge(v, m, w =1, e = true){
        if(e) this.e++;
        this.nK[v].push(m);
        this.vK[v][`${m}`] = w;
    }
    getNK(v){
        return this.nK[v];
    }

    shortestPath(v, m){
        let visited = [v];
        let queue = [[v]];

        let theWay;
        while(queue.length && !theWay) {
            let oogabooga = queue.shift();
            this.nK[oogabooga[oogabooga.length-1]].forEach((nK) => {
                if(visited.includes(nK)) {return;}

                visited.push(nK);
                let newarr = Array.from(oogabooga);
                newarr.push(nK);
                if(nK === m) {
                    theWay = newarr;

                }
                else queue.push(newarr);
            });
        }
        return theWay;
    }

    wheightedShortestPathGPT(v, m) {
        let dist = new Array(this.v).fill(Infinity); // distance from start to each vertex
        let prev = new Array(this.v).fill(null);     // to reconstruct path
        dist[v] = 0;

        let pq = new Set([...Array(this.v).keys()]); // all vertices

        while (pq.size > 0) {
            // Find vertex in pq with smallest distance
            let u = [...pq].reduce((a, b) => dist[a] < dist[b] ? a : b);
            pq.delete(u);

            if (u === m) break; // found shortest path to destination

            let neighbors = Array.from(this.nK[u]);
            let weights = this.vK[u];

            for (let i = 0; i < neighbors.length; i++) {
                let alt = dist[u] + weights[neighbors[i]];
                if (alt < dist[neighbors[i]]) {
                    dist[neighbors[i]] = alt;
                    prev[neighbors[i]] = u;
                }
            }
        }

        // Reconstruct path
        if (dist[m] === Infinity) return null;
        let path = [];
        for (let at = m; at !== null; at = prev[at]) {
            path.push(at);
        }
        return path.reverse();
    }


    wheightedShortestPath(v, m){
        let verts = [];
        verts.fill(Infinity, 0, this.v);
        let queue = [[v]];

        let theWay;
        while(queue.length && !theWay) {
            let oogabooga = queue.shift();
            this.nK[oogabooga[oogabooga.length-1]].forEach((nK) => {
                if(visited.includes(nK)) {return;}

                visited.push(nK);
                let newarr = Array.from(oogabooga);
                newarr.push(nK);
                if(nK === m) {
                    theWay = newarr;

                }
                else queue.push(newarr);
            });
        }
        return theWay;
    }
}