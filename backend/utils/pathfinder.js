// This file implements Dijkstra's algorithm to find the shortest path in our campus graph.

const findShortestPath = (graph, startNode, endNode) => {
    let distances = {};
    let prev = {};
    let pq = new Set();

    for (let node in graph.nodes) {
        distances[node] = Infinity;
        prev[node] = null;
        pq.add(node);
    }
    distances[startNode] = 0;

    while (pq.size > 0) {
        let smallest = null;
        for (let node of pq) {
            if (smallest === null || distances[node] < distances[smallest]) {
                smallest = node;
            }
        }

        if (smallest === endNode || distances[smallest] === Infinity) {
            break;
        }

        pq.delete(smallest);

        for (let edge of graph.edges) {
            let neighbor = null;
            if (edge[0] === smallest) neighbor = edge[1];
            if (edge[1] === smallest) neighbor = edge[0];

            if (neighbor && pq.has(neighbor)) {
                let alt = distances[smallest] + edge[2]; // edge[2] is the weight
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    prev[neighbor] = smallest;
                }
            }
        }
    }

    // --- THIS IS THE MODIFICATION ---
    // If we found a path to the endNode, reconstruct it and return it along with its distance.
    if (distances[endNode] !== Infinity) {
        const path = [];
        let current = endNode;
        while (current) {
            path.unshift(current);
            current = prev[current];
        }
        
        if (path[0] === startNode) {
            return {
                path: path,
                distance: Math.round(distances[endNode]) // Return the total distance, rounded to the nearest meter
            };
        }
    }

    return null; // No path found
};

module.exports = { findShortestPath };