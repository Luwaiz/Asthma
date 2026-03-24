const express = require('express');
const router = express.Router();
const DailyLog = require('../models/DailyLog');
const UserProfile = require('../models/UserProfile');
const authMiddleware = require('../middleware/authMiddleware');
const { isSameDay, isYesterday } = require('../utils/dateUtils');

// @route   POST /api/logs
// @desc    Create or update a daily log
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { date, symptoms, peakFlow, notes } = req.body;
    const userId = req.user.uid;

    console.log(`POST /api/logs received for user ${userId} and date ${date}`);

    try {
        const logDate = new Date(date);
        logDate.setUTCHours(0, 0, 0, 0);

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let log = await DailyLog.findOne({ userId, date: logDate });

        if (log) {
            // Prevent updates for past logs
            if (logDate < today) {
                console.log(`Update rejected for past date ${logDate.toISOString()}`);
                return res.status(403).json({ error: 'Past logs cannot be edited.' });
            }

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

            // --- STREAK LOGIC START ---
            let streakUpdated = false;
            // Only update streak if it's a new log for "today"
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            if (isSameDay(logDate, today)) {
                const profile = await UserProfile.findOne({ userId });
                if (profile) {
                    const lastLogDate = profile.lastVisitDate;

                    if (!lastLogDate) {
                        // First log ever
                        profile.streakCount = 1;
                        streakUpdated = true;
                    } else if (isYesterday(lastLogDate, today)) {
                        // Consecutive day
                        profile.streakCount += 1;
                        streakUpdated = true;
                    } else if (!isSameDay(lastLogDate, today)) {
                        // Streak broken (more than 1 day gap)
                        profile.streakCount = 1;
                        streakUpdated = true;
                    }
                    // If isSameDay(lastLogDate, today), we already updated the streak today (streakUpdated stays false)

                    if (streakUpdated) {
                        profile.lastVisitDate = today;
                        await profile.save();
                        console.log(`Streak updated for user ${userId} via log creation: ${profile.streakCount}`);
                    }
                }
            }
            // --- STREAK LOGIC END ---

            return res.json({ ...log.toObject(), streakUpdated });
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
