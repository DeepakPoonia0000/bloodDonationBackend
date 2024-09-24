const mongoose = require('mongoose');

// Image section schema with default values for each image
const imageSectionSchema = new mongoose.Schema({
    imageOne: {
        type: String,
        required: true,
        default: "cloudinaryImageLink" // Default value for imageOne
    },
    imageTwo: {
        type: String,
        required: true,
        default: "cloudinaryImageLink" // Default value for imageTwo
    },
    imageThree: {
        type: String,
        required: true,
        default: "cloudinaryImageLink" // Default value for imageThree
    }
});

// Main schema for image with three sections
const imageSchema = new mongoose.Schema({
    sectionOne: {
        type: imageSectionSchema,
        default: {} // Use default to ensure an empty section with default values is created
    },
    sectionTwo: {
        type: imageSectionSchema,
        default: {} // Create sectionTwo with default image values
    },
    sectionThree: {
        type: imageSectionSchema,
        default: {} // Create sectionThree with default image values
    }
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
