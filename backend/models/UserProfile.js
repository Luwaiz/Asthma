const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    displayName: {
        type: String,
    },
    asthmaLevel: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe'],
        default: 'Mild',
    },
    triggers: {
        type: [String],
        default: []
    },
    yearsWithAsthma: {
        type: Number,
        default: 0
    },
    medicalConditions: {
        type: [String],
        default: []
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    emergencyContact: {
        name: String,
        phone: String,
    },
    pushToken: {
        type: String,
    },
    onboardingCompleted: {
        type: Boolean,
        default: false,
    },
    streakCount: {
        type: Number,
        default: 0,
    },
    lastVisitDate: {
        type: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', UserProfileSchema);
