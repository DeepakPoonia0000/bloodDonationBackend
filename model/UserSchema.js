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
  lastDonation:{
    date:{type:Date},
    donatedTo: { type: String }
  },
  previousDonations: [
    {
      date: { type: Date },
      donatedTo: { type: String }
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