// controllers/vehicleController.js

const Vehicle = require('../models/Vehicle');

// Register a new vehicle
const registerVehicle = async (req, res) => {
  try {
    const { ownerName, vehicleType, licensePlate, capacity, contactNumber } = req.body;

    // Validate request body (optional)
    if (!ownerName || !vehicleType || !licensePlate || !capacity || !contactNumber) {
      return res.status(400).send({ error: 'All fields are required.' });
    }

    // Check if vehicle already exists based on license plate
    const existingVehicle = await Vehicle.findOne({ licensePlate });
    if (existingVehicle) {
      return res.status(400).send({ error: 'Vehicle with this license plate already registered.' });
    }

    // Create and save new vehicle
    const newVehicle = new Vehicle({
      ownerName,
      vehicleType,
      licensePlate,
      capacity,
      contactNumber
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
    const { id } = req.params;

    // Find and delete the vehicle
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);

    if (!deletedVehicle) {
      return res.status(404).send({ error: 'Vehicle not found.' });
    }

    res.status(200).send({ message: 'Vehicle deleted successfully.' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete vehicle.' });
  }
};
