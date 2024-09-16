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
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  hasBloodDonationCenter: { type: Boolean, default: false },
  bloodTypes: [{ type: String }], // e.g., ['A+', 'B-', 'O+']
  operatingHours: {
    monday: { type: String, default: '' },
    tuesday: { type: String, default: '' },
    wednesday: { type: String, default: '' },
    thursday: { type: String, default: '' },
    friday: { type: String, default: '' },
    saturday: { type: String, default: '' },
    sunday: { type: String, default: '' }
  },
  facilities: [String], // e.g., ['Waiting area', 'Refreshments']
  website: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
  password:String
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;
