
const mongoose = require('mongoose')

const hospitalDonation = new mongoose.Schema({
    requestorId: String,
    bloodGroup: String,
    name: String,
    phoneNumber: String,
    donorsResponse: [{
        donorId: String,
        phoneNumber: Number,
        bloodGroup: String,
    }],
    location: {
        longitude: Number,
        latitude: Number
    },
    dateOfQuery: {
        type: Date,
        default: Date.now,
    },
    expireAt: {
        type: Date,
        default: () => Date.now() + 24 * 60 * 60 * 1000,
        index: { expireAfterSeconds: 0 },
    },

});

const HospitalDonation = mongoose.model('HospitalDonation', hospitalDonation);

module.exports = HospitalDonation;