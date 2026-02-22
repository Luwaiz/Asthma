const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['medication', 'appointment'],
        default: 'medication',
    },
    subtitle: {
        type: String,
    },
    date: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Reminder', ReminderSchema);
