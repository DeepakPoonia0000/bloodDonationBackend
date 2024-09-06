// ownerSchema.js

const mongoose = require('mongoose')

const donater = new mongoose.Schema({
    bloodGroup: String,
    name: String,
    phoneNumber:String,
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
        default: () => Date.now() +  5 * 60 * 60 * 1000, 
        index: { expireAfterSeconds: 0 },
    },

});

const Donater = mongoose.model('Donater', donater);

module.exports = Donater;