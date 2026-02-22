const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const DailyLog = require('../models/DailyLog');
const UserProfile = require('../models/UserProfile');
const aiService = require('../services/aiService');

// Get AI Insights based on all user logs
router.get('/insights', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.uid || req.user.id;
        const logs = await DailyLog.find({ userId }).sort({ date: -1 }).limit(30);

        if (!logs || logs.length === 0) {
            return res.json({
                status: "No Data",
                trend: "Start logging your symptoms to see AI insights.",
                color: "#9ca3af" // Grey
            });
        }

        // Fetch user profile for context
        const profile = await UserProfile.findOne({ userId });

        let age = 'Unknown';
        if (profile && profile.yearOfBirth) {
            age = new Date().getFullYear() - profile.yearOfBirth;
        }

        const userContext = {
            age,
            gender: profile?.gender || 'Unknown',
            asthmaLevel: profile?.asthmaLevel || 'Unknown',
            triggers: profile?.triggers || []
        };

        const insights = await aiService.getInsights(logs, userContext);

        if (!insights) {
            return res.status(500).json({ message: "Failed to generate insights" });
        }

        res.json(insights);
    } catch (error) {
        console.error("Insights Route Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get Health Status based on recent logs
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.uid || req.user.id;
        const logs = await DailyLog.find({ userId }).sort({ date: -1 }).limit(7);

        if (!logs || logs.length === 0) {
            return res.json({
                label: "No Data",
                description: "Start logging your symptoms to see your health status.",
                color: "#9ca3af" // Grey
            });
        }

        // Fetch user profile for context
        const profile = await UserProfile.findOne({ userId });

        let age = 'Unknown';
        if (profile && profile.yearOfBirth) {
            age = new Date().getFullYear() - profile.yearOfBirth;
        }

        const userContext = {
            age,
            gender: profile?.gender || 'Unknown',
            asthmaLevel: profile?.asthmaLevel || 'Unknown',
            triggers: profile?.triggers || []
        };

        const status = await aiService.getHealthStatus(logs, userContext);

        if (!status) {
            return res.status(500).json({ message: "Failed to determine health status" });
        }

        res.json(status);
    } catch (error) {
        console.error("Status Route Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
