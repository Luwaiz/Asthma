const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/medications
// @desc    Get all medications for the user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const medications = await Medication.find({ userId: req.user.uid });
        res.json(medications);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/medications
// @desc    Add a medication
router.post('/', authMiddleware, async (req, res) => {
    const { name, description, dosage, frequency } = req.body;
    const userId = req.user.uid;
    console.log(`POST /api/medications received for user ${userId}:`, { name, description });
    try {
        const newMedication = new Medication({
            userId,
            name,
            description,
            dosage,
            frequency
        });
        const medication = await newMedication.save();
        console.log('Medication saved successfully');
        res.json(medication);
    } catch (error) {
        console.error('Error adding medication:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// @route   DELETE /api/medications/:id
// @desc    Delete a medication
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Medication.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
        res.json({ message: 'Medication removed' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
