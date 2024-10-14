// bannerController.js

const Banner = require('../model/BannerSchema'); // Adjust the path as necessary
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: 'dhdk9yop5',
    api_key: '126739441976649',
    api_secret: 'hDe9rnUIzmc96__HGmP2-pkeJ6A',
});

// Create a new banner
const createBanner = async (req, res) => {
    try {
        const { title, description, image } = req.body;
        if (!title || !description || !image) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }
        const newBanner = new Banner({ title, description, image });
        await newBanner.save();
        res.status(201).json({ message: 'Banner created successfully', banner: newBanner });
    } catch (error) {
        res.status(500).json({ message: 'Error creating banner', error: error.message });
    }
};

// Show all banners
const getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find();
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching banners', error: error.message });
    }
};

// Delete a banner by ID
const deleteBanner = async (req, res) => {
    try {
        const { bannerId } = req.params;
        const banner = await Banner.findById(bannerId);
        const deletedBanner = await Banner.findByIdAndDelete(bannerId);
        if (!deletedBanner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.status(200).json({ message: 'Banner deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting banner', error: error.message });
    }
};

module.exports = {
    createBanner,
    getAllBanners,
    deleteBanner
};
