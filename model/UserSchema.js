// ownerSchema.js

const mongoose = require('mongoose')

const addUser = new mongoose.Schema({
  bloodGroup: String,
  name: String,
  phoneNumber: String,
  password: String,
  token: String,
  location: {
    longitude: Number,
    latitude: Number,
  },
  previousDonations: [
    {
      date: { type: Date },
      // donationDetails: String,
    },
  ],
  canDonateAgain: {
    type: Boolean,
    default: true,
  },
  joinedOn: {
    type: Date,
    default: Date.now,
  },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
});


const User = mongoose.model('User', addUser);

module.exports = User;