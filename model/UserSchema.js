// ownerSchema.js

const mongoose = require('mongoose')

const addUser = new mongoose.Schema({
    bloodGroup: String,
    name: String,
    email: String,
    phoneNumber: String,
    password: String,
    token: String,
    location: {
        longitude: Number,
        latitude: Number
    },
});

const User = mongoose.model('User', addUser);

module.exports = User;