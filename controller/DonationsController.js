const Donater = require('../model/RequestorSchema');
const UserImage = require('../model/UserImagesSchema');
const User = require('../model/UserSchema');
const cloudinary = require("cloudinary").v2;

const addDonorsToTheRequest = async (req, res) => {
  try {
    const { phoneNumber, bloodGroup, requestId } = req.body;
    const donorId = req.Id;

    // Find the donor by donorId
    const donor = await User.findById(donorId);

    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    const currentDate = new Date();
    const lastDonation = donor.lastDonation?.date;

    // If there is a last donation date, calculate the time difference
    if (lastDonation) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

      if (lastDonation > threeMonthsAgo) {
        const previousDonationDate = lastDonation.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        return res.status(400).json({
          message: `You can only donate again three months after your previous donation. Last Donation Date :  ${previousDonationDate}`,
          previousDonationDate,
        });
      }
    }

    // Find the document by requestId
    const donateRequest = await Donater.findById(requestId);

    if (!donateRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Push the new donor response into the donorsResponse array
    donateRequest.donorsResponse.push({
      donorId,
      phoneNumber,
      bloodGroup
    });

    // Save the updated document
    await donateRequest.save();
    const responseLength = donateRequest.donorsResponse.length - 1;

    const sentResp = donateRequest.donorsResponse[responseLength];

    return res.status(200).json({
      message: 'Response added successfully on addDonor',
      donorsResponse: sentResp
    });

  } catch (error) {
    console.error('Error adding donor response:', error);
    res.status(500).json({ error: error.message });
  }
};

const getDonorsResponses = async (req, res) => {
  try {
    const { requestId, phoneNumber } = req.query;
    const Id = req.Id;

    // Find the document by requestId
    const user = await Donater.findById(requestId);

    if (!user || user.requestorId != Id) {
      return res.status(404).json({ error: 'Request not found' });
    }

    let donorsResponse = user.donorsResponse;

    if (phoneNumber) {
      donorsResponse = donorsResponse.find(response => response.phoneNumber == phoneNumber);

      if (!donorsResponse) {
        return res.status(404).json({ error: 'No donor response found for the provided phone number' });
      }
    }

    return res.status(200).json({ donorsResponse });
  } catch (error) {
    console.error('Error fetching donor responses:', error);
    res.status(500).json({ error: error.message });
  }
}

const uploadUserImage = async (req, res) => {
  const { imageUrl } = req.body; // Ensure you get necessary fields
  const { Id } = req; // Assuming you get user Id from request (e.g., from JWT or session)

  try {
    // Find user by Id
    const user = await User.findById(Id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userName = user.name;
    const userNumber = user.userNumber;

    // Check if the user already has an image
    const existingImage = await UserImage.findOne({ userNumber });
    const existingImageUrl=  existingImage.imageLink;


    if (existingImage) {
      const publicId = existingImageUrl.split('/').pop().split('.')[0]; // Extract public ID from Cloudinary URL

      if (!publicId) {
        return res.status(400).json({ message: 'Public ID could not be extracted' });
      }

      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);

      // Update the existing image with the new URL
      existingImage.imageLink = imageUrl; // Update image link
      await existingImage.save(); // Save changes
      return res.status(200).json({ message: 'Image updated successfully', existingImage });
    }

    // If user does not have an image, create a new one
    const newUserImage = new UserImage({
      imageLink: imageUrl,
      userName: userName,
      userNumber: userNumber,
    });

    // Save new user image to the database
    await newUserImage.save();

    return res.status(201).json({ message: 'Image uploaded successfully', newUserImage });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};


module.exports = { addDonorsToTheRequest, getDonorsResponses, uploadUserImage };