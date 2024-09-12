const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
    organiserId: String,
    campName: {
        type: String,
        required: true,
    },
    campAddress: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    location: {
        latitude: { type: String, default: "12345" },
        longitude: { type: String, default: "12345" }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Camp = mongoose.model('Camp', campSchema);

module.exports = Camp;
