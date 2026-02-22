const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    dosage: {
        type: String,
    },
    frequency: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Medication', MedicationSchema);
