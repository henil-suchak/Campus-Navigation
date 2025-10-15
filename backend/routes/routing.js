const express = require('express');
const router = express.Router();
const campusGraph = require('../data/campus-graph.json');
const { findShortestPath } = require('../utils/pathfinder');

// Helper function to calculate distance between two lat-lng points
const getDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

// Main routing endpoint: POST /api/routing/get-path
router.post('/get-path', (req, res) => {
    const { startCoords, endCoords } = req.body;
    if (!startCoords || !endCoords) return res.status(400).json({ message: "Start and end coordinates are required." });

    let startNodeId = null, endNodeId = null;
    let minStartDist = Infinity, minEndDist = Infinity;

    for (let nodeId in campusGraph.nodes) {
        const node = campusGraph.nodes[nodeId];
        const startDist = getDistance(startCoords, node.coords);
        if (startDist < minStartDist) {
            minStartDist = startDist;
            startNodeId = nodeId;
        }
        const endDist = getDistance(endCoords, node.coords);
        if (endDist < minEndDist) {
            minEndDist = endDist;
            endNodeId = nodeId;
        }
    }

    // --- THIS IS THE MODIFICATION ---
    // The algorithm now returns an object with path and distance
    const result = findShortestPath(campusGraph, startNodeId, endNodeId);

    if (!result) return res.status(404).json({ message: "No path found." });
    
    const { path: pathNodeIds, distance: pathDistance } = result;

    const pathCoords = pathNodeIds.map(nodeId => campusGraph.nodes[nodeId].coords);
    
    // Add the user's actual start/end points for visual accuracy
    pathCoords.unshift(startCoords);
    pathCoords.push(endCoords);

    // Calculate total distance including the distance from user to start/end nodes
    const totalDistance = Math.round(minStartDist + pathDistance + minEndDist);

    res.json({ path: pathCoords, distance: totalDistance });
});

module.exports = router;