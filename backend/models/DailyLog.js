const mongoose = require('mongoose');

const SymptomSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String,
    severity: Number,
});

const DailyLogSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    date: {
        type: Date,
        required: true,
    },
    symptoms: [SymptomSchema],
    peakFlow: {
        type: String,
    },
    notes: {
        type: String,
    }
}, { timestamps: true });

// Ensure one log per user per day (UTC)
DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', DailyLogSchema);
