const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');

// This route is now specifically for getting the details of a single faculty member.
router.get('/:id', async (req, res) => {
    try {
        const member = await Faculty.findById(req.params.id)
            .populate('department')
            .populate('office.building');
        if (!member) return res.status(404).json({ message: 'Faculty member not found' });
        res.json(member);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// We no longer need the GET '/' route to fetch all faculty at once.
module.exports = router;