const express = require('express');
const router = express.Router();
const Building = require('../models/Building');
const Department = require('../models/Department');
const Classroom = require('../models/Classroom');

// This single endpoint efficiently fetches summary data for the college details page.
router.get('/', async (req, res) => {
    try {
        // Run database queries in parallel for maximum efficiency
        const [buildingCount, departmentCount, classroomCount, recentBuildings] = await Promise.all([
            Building.countDocuments(),
            Department.countDocuments(),
            Classroom.countDocuments(),
            Building.find().sort({ _id: -1 }).limit(5) // Get the 5 most recently added buildings
        ]);

        // Send all the data back in a single, clean JSON object
        res.json({
            buildingCount,
            departmentCount,
            classroomCount,
            recentBuildings
        });

    } catch (err) {
        res.status(500).json({ message: "Server error while fetching college details." });
    }
});

module.exports = router;