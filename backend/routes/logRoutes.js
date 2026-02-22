const express = require('express');
const router = express.Router();
const DailyLog = require('../models/DailyLog');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/logs
// @desc    Create or update a daily log
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { date, symptoms, peakFlow, notes } = req.body;
    const userId = req.user.uid;

    console.log(`POST /api/logs received for user ${userId} and date ${date}`);

    try {
        // Normalize date to start of day for uniqueness check
        const logDate = new Date(date);
        logDate.setUTCHours(0, 0, 0, 0);

        let log = await DailyLog.findOne({ userId, date: logDate });

        if (log) {
            log.symptoms = symptoms;
            log.peakFlow = peakFlow;
            log.notes = notes;
            await log.save();
        } else {
            log = new DailyLog({
                userId,
                date: logDate,
                symptoms,
                peakFlow,
                notes
            });
            await log.save();
        }

        res.json(log);
    } catch (error) {
        console.error('Error saving log:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/logs
// @desc    Get all logs for the current user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.uid;
    console.log(`GET /api/logs received for user ${userId}`);
    try {
        const logs = await DailyLog.find({ userId }).sort({ date: -1 });
        console.log(`Found ${logs.length} logs for user`);
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

module.exports = router;
