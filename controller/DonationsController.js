const Donater = require('../model/RequestorSchema');
const User = require('../model/UserSchema');

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



module.exports = { addDonorsToTheRequest, getDonorsResponses };