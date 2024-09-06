// ownerSchema.js

const mongoose = require('mongoose')

const prevReq = new mongoose.Schema({
    bloodGroup: String,
    name:String,
    location: {
        longitude: String,
        latitude: String
    },
    dateOfQuery: {
        type: Date,
        default: Date.now,
    },

});

const Prev = mongoose.model('Prev', prevReq);

module.exports = Prev;