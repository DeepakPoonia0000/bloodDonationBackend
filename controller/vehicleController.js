// controllers/vehicleController.js

const Camp = require('../model/CampSchema');
const Vehicle = require('../model/VehicleVolunteerSchema')

// Register a new vehicle
const registerVehicle = async (req, res) => {
  try {
    const {
      ownerName,
      vehicleType,
      licensePlate,
      capacity,
      contactNumber,
      campId,
      dateOfAvailability,
      availableDays
    } = req.body;

    // Validate required fields
    if (!ownerName || !vehicleType || !licensePlate || !capacity || !contactNumber || !dateOfAvailability || !availableDays) {
      return res.status(400).send({ error: 'All fields are required.' });
    }

    if (availableDays > 7) {
      return res.status(400).send({ error: 'Available days should be less than or equal to 7.' });
    }

    const availabilityDate = new Date(dateOfAvailability);
    if (isNaN(availabilityDate.getTime())) {
      return res.status(400).send({ error: 'Invalid date of availability provided.' });
    }

    const existingVehicle = await Vehicle.findOne({ licensePlate });
    if (existingVehicle) {
      return res.status(400).send({ error: 'Vehicle with this license plate already registered.' });
    }

    // Create a new expiration date by adding availableDays to the availabilityDate
    const expirationDate = new Date(availabilityDate); // Create a new Date object
    expirationDate.setDate(expirationDate.getDate() + availableDays); // Add availableDays

    const newVehicle = new Vehicle({
      campId,
      ownerName,
      vehicleType,
      licensePlate,
      capacity,
      contactNumber,
      availability: true, // Set to true as it’s registered
      dateOfAvailability: availabilityDate, // Store the provided availability date
      expirationDate // Set expiration date based on your logic
    });

    await newVehicle.save();

    res.status(201).send({ message: 'Vehicle registered successfully!', vehicle: newVehicle });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error, failed to register vehicle.' });
  }
};


// Fetch all vehicles (optional, depending on your requirements)
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).send(vehicles);
  } catch (error) {
    res.status(500).send({ error: 'Failed to retrieve vehicles.' });
  }
};

const getCampVehicles = async (req, res) => {
  try {
    const { campId } = req.query;

    // Validate campId presence
    if (!campId) {
      return res.status(400).send({ error: 'campId is required.' });
    }

    const vehicles = await Vehicle.find({ campId });

    // Check if any vehicles were found
    if (vehicles.length === 0) {
      return res.status(404).send({ message: 'No vehicles found for this camp.' });
    }

    res.status(200).send(vehicles);
  } catch (error) {
    console.error('Error retrieving vehicles:', error); // Log the error for debugging
    res.status(500).send({ error: 'Failed to retrieve vehicles.' });
  }
};


// Get a specific vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).send({ error: 'Vehicle not found.' });
    }

    res.status(200).send(vehicle);
  } catch (error) {
    res.status(500).send({ error: 'Failed to retrieve vehicle.' });
  }
};

// Update vehicle details
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find and update the vehicle
    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedVehicle) {
      return res.status(404).send({ error: 'Vehicle not found.' });
    }

    res.status(200).send({ message: 'Vehicle updated successfully!', vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).send({ error: 'Failed to update vehicle.' });
  }
};

// Delete a vehicle by ID
const deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    // const { Id } = req;

    // const vehicle = await Vehicle.findById(vehicleId)
    // if (vehicle.campId != Id) {
    //   return res.status(403).send({ error: 'You are not authorized to delete this vehicle' });
    // }


    // Find and delete the vehicle
    const deletedVehicle = await Vehicle.findByIdAndDelete(vehicleId);

    if (!deletedVehicle) {
      return res.status(404).send({ error: 'Vehicle not found.' });
    }

    res.status(200).send({ message: 'Vehicle deleted successfully.' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete vehicle.' });
  }
};

module.exports = { deleteVehicle, updateVehicle, getAllVehicles, registerVehicle, getCampVehicles }