const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/reminders
// @desc    Get all reminders for the user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const reminders = await Reminder.find({ userId: req.user.uid });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/reminders
// @desc    Add a reminder
router.post('/', authMiddleware, async (req, res) => {
    const { title, time, type, subtitle, date } = req.body;
    const userId = req.user.uid;
    console.log(`POST /api/reminders received for user ${userId}:`, { title, time, type, date });
    try {
        const newReminder = new Reminder({
            userId,
            title,
            time,
            type,
            subtitle,
            date
        });
        const reminder = await newReminder.save();
        console.log('Reminder saved successfully');
        res.json(reminder);
    } catch (error) {
        console.error('Error adding reminder:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// @route   DELETE /api/reminders/:id
// @desc    Delete a reminder
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
        res.json({ message: 'Reminder removed' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
