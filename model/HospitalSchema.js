const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hospitalSchema = new Schema({
    name: { type: String, required: true },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true }
    },
    contact: {
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    location: {
        type: {
            type: String, // GeoJSON type, which should always be 'Point'
            enum: ['Point'], // Only allow 'Point'
            required: true
        },
        coordinates: {
            type: [Number], // Array of numbers for [longitude, latitude]
            required: true
        }
    },
    bloodBankDetails:{},
    hasBloodDonationCenter: { type: Boolean, default: false },
    website: { type: String, default: '' },
    specialInstructions: { type: String, default: '' },
    password: String,
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    token: String,
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;
