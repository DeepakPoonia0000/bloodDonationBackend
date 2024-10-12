const mongoose = require('mongoose');

// Vehicle Schema for volunteer work
const VehicleVolunteerSchema = new mongoose.Schema({
    campId: {
        type: String,
        required: true,
        index: true,
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    vehicleType: {
        type: String,
        required: true,
        enum: ['Car', 'Truck', 'Van', 'Motorcycle', 'Other'], // Define types of vehicles
        default: 'Car'
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    availability: {
        type: Boolean,
        default: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    dateOfAvailability: {
        type: Date,
        required: true,
    },
    expirationDate: {
        type: Date,
        required: true // You can choose to make it optional
    }
});

VehicleVolunteerSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0 });

// Create the Vehicle model
const Vehicle = mongoose.model('Vehicle', VehicleVolunteerSchema);

module.exports = Vehicle;
