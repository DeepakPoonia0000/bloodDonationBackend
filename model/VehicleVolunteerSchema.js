// ownerSchema.js

const mongoose = require('mongoose')

const VehicleVlounteer = new mongoose.Schema({
  
});


const Vehicle = mongoose.model('Vehicle', VehicleVlounteer);

module.exports = Vehicle;