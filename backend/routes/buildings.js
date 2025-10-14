const express = require('express');
const router = express.Router();
const Building = require('../models/Building');

// --- NEW SEARCH ROUTE ---
// This endpoint will handle live search requests (e.g., /api/buildings/search?q=Comp)
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json([]); // Return an empty array if there's no query
        }

        // Use a regular expression for a case-insensitive "contains" search on the building name
        const buildings = await Building.find({ 
            name: { $regex: query, $options: 'i' } 
        }).limit(5); // Limit to 5 results for performance

        res.json(buildings);
    } catch (err) {
        res.status(500).json({ message: 'Server Error while searching buildings.' });
    }
});

// GET all buildings (this route remains the same)
router.get('/', async (req, res) => {
    try {
        const buildings = await Building.find();
        res.json(buildings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a specific building by ID (this route remains the same)
router.get('/:id', async (req, res) => {
    try {
        const building = await Building.findById(req.params.id);
        if (!building) return res.status(404).json({ message: 'Building not found' });
        res.json(building);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;