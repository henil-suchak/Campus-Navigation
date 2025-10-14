// backend/routes/classrooms.js
const router = require('express').Router();
const Classroom = require('../models/Classroom');

// GET all classrooms
router.get('/', async (req, res) => {
    try {
        const classrooms = await Classroom.find().populate('building', 'name code');
        res.json(classrooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
