const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const DailyLog = require('../models/DailyLog');
const Medication = require('../models/Medication');
const Reminder = require('../models/Reminder');
const authMiddleware = require('../middleware/authMiddleware');
const { isSameDay, isYesterday } = require('../utils/dateUtils');

// Date helpers moved to utils/dateUtils.js

// @route   GET /api/users/profile
// @desc    Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        let profile = await UserProfile.findOne({ userId: req.user.uid });

        // If no profile exists, create one with defaults
        if (!profile) {
            profile = new UserProfile({
                userId: req.user.uid,
                displayName: req.user.name || req.user.email?.split('@')[0] || 'User',
                asthmaLevel: 'Mild',
                streakCount: 1,
                lastVisitDate: new Date()
            });
            await profile.save();
        } else {
            // Only update lastVisitDate for visit tracking, DO NOT update streak here
            const today = new Date();
            if (!profile.lastVisitDate || !isSameDay(profile.lastVisitDate, today)) {
                profile.lastVisitDate = today;
                await profile.save();
            }
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    const { displayName, asthmaLevel, emergencyContact, triggers, yearsWithAsthma, medicalConditions, dateOfBirth, gender, pushToken, onboardingCompleted } = req.body;
    const userId = req.user.uid;

    console.log(`PUT /api/users/profile received for user ${userId}:`, { displayName, asthmaLevel, pushToken, onboardingCompleted });

    try {
        let profile = await UserProfile.findOne({ userId });

        if (!profile) {
            // Create new profile if doesn't exist
            profile = new UserProfile({
                userId,
                displayName,
                asthmaLevel,
                emergencyContact,
                triggers,
                yearsWithAsthma,
                medicalConditions,
                dateOfBirth,
                gender,
                onboardingCompleted,
            });
        } else {
            // Update existing profile
            if (displayName !== undefined) profile.displayName = displayName;
            if (asthmaLevel !== undefined) profile.asthmaLevel = asthmaLevel;
            if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;
            if (triggers !== undefined) profile.triggers = triggers;
            if (yearsWithAsthma !== undefined) profile.yearsWithAsthma = yearsWithAsthma;
            if (medicalConditions !== undefined) profile.medicalConditions = medicalConditions;
            if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
            if (gender !== undefined) profile.gender = gender;
            if (pushToken !== undefined) profile.pushToken = pushToken;
            if (onboardingCompleted !== undefined) profile.onboardingCompleted = onboardingCompleted;
        }

        await profile.save();
        console.log('User profile updated successfully');
        res.json(profile);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// @route   DELETE /api/users/profile
// @desc    Delete user account and all data
router.delete('/profile', authMiddleware, async (req, res) => {
    const userId = req.user.uid;

    try {
        console.log(`DELETE /api/users/profile received for user ${userId}`);

        // 1. Delete Daily Logs
        await DailyLog.deleteMany({ userId });

        // 2. Delete Medications
        await Medication.deleteMany({ userId });

        // 3. Delete Reminders
        await Reminder.deleteMany({ userId });

        // 4. Delete User Profile
        await UserProfile.findOneAndDelete({ userId });

        console.log('User account deleted successfully');
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

module.exports = router;
