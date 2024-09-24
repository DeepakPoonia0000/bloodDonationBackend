const mongoose = require('mongoose');

const imageSectionSchema = new mongoose.Schema({
    imageOne: {
        type: String,
        required: false,
    },
    imageTwo: {
        type: String,
        required: false
    },
    imageThree: {
        type: String,
        required: false
    }
});

const imageSchema = new mongoose.Schema({
    sectionOne: imageSectionSchema,
    sectionTwo: imageSectionSchema,
    sectionThree: imageSectionSchema
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
