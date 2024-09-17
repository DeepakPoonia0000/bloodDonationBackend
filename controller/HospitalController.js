const Hospital = require('../model/HospitalSchema');
const HospitalDonation = require('../model/HospitalDonationSchema')
const HospitalPrev = require('../model/HospitalPreviousRecords')
const jwt = require('jsonwebtoken');
const User = require('../model/UserSchema');

// Secret key for JWT (ideally stored in an environment variable)
const JWT_SECRET = 'qwertyUJIKL:@#456tU&*I(Op#E$R%^YuiDEFRGH';

const HospitalverifyToken = async (req, res, next) => {
    // Get token from the request header
    const token = req.headers.authorization;

    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const user = await Hospital.findById(decodedToken.id);

        if (!user) {
            return res.status(401).json({ message: 'Invalid Hospital' });
        }

        if (user.token !== token) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = user;
        req.id = decodedToken.id;
        req.phoneNumber = user.contact.phone;
        next();
    } catch (error) {
        console.error('Failed to verify token:', error);
        return res.status(500).json({ message: 'Failed to verify token', error: error.message });
    }
}

// Function to handle hospital signup

const signupHospital = async (req, res) => {
    try {
        // Extract data from request body
        const {
            name,
            address,
            contact,
            coordinates,
            hasBloodDonationCenter,
            facilities,
            website,
            specialInstructions,
            password
        } = req.body;

        // Basic input validation
        if (!name || !address || !contact || !coordinates || !password) {
            return res.status(400).json({ message: 'Missing required fields or invalid data' });
        }

        // Validate contact object
        if (!contact.phone || !contact.email) {
            return res.status(400).json({ message: 'Contact phone and email are required' });
        }

        // Check for existing hospital with same name, phone, email, or website
        const existingHospital = await Hospital.findOne({
            $or: [
                { 'contact.phone': contact.phone },
                { 'contact.email': contact.email },
                { website: website },
                { name: name }
            ]
        });

        if (existingHospital) {
            let fieldName = '';

            // Determine which field caused the conflict
            if (existingHospital.contact.phone === contact.phone) {
                fieldName = 'phone';
            } else if (existingHospital.contact.email === contact.email) {
                fieldName = 'email';
            } else if (existingHospital.website === website) {
                fieldName = 'website';
            } else if (existingHospital.name === name) {
                fieldName = 'name';
            }

            return res.status(400).json({ message: `Hospital already exists with the same ${fieldName}` });
        }

        // Create a new hospital instance
        const newHospital = new Hospital({
            name,
            address,
            contact,
            coordinates,
            hasBloodDonationCenter,
            facilities,
            website,
            specialInstructions,
            password // Storing password as-is (consider encrypting it)
        });

        // Save to the database
        await newHospital.save();

        // Respond with success
        res.status(201).json({ message: 'Hospital registered successfully', data: newHospital });
    } catch (error) {
        // Handle errors
        console.error('Error registering hospital:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginHospital = async (req, res) => {
    try {
        // Extract data from request body
        const { contact, password } = req.body;

        // Validate input
        if (!contact || !password) {
            return res.status(400).json({ message: 'Contact number and password are required' });
        }

        // Find hospital by contact number
        const hospital = await Hospital.findOne({ 'contact': contact });

        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        if (hospital.status == 'pending') {
            return res.status(404).json({ error: 'Request Approval Still Pending' });
        }

        // Check if provided password matches the stored password
        if (hospital.password != password) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Create a token
        const token = jwt.sign(
            { id: hospital._id, name: hospital.name }, // Payload
            JWT_SECRET, // Secret key
            { expiresIn: '10d' } // Token expiration time
        );

        // Respond with success and token
        res.status(200).json({
            message: 'Login successful',
            token
        });

        hospital.token = token;
        await hospital.save();
    } catch (error) {
        // Handle errors
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const sendBloodRequestsHospital = async (req, res) => {
    try {
        const { bloodGroup, name } = req.body;
        const { phoneNumber, id } = req;
        if (!bloodGroup || !name) {
            res.status(500).json("Blood group, and name is required for making a request");
        } else {
            const newUser = await HospitalDonation.create({
                requestorId: id,
                bloodGroup,
                phoneNumber,
                name,
            });
            console.log(newUser)
            const saveReq = await HospitalPrev.create({
                requestorId: id,
                bloodGroup,
                phoneNumber,
                name,
            })

            res.status(200).json(newUser);
        }
    } catch (error) {
        console.error('Failed to add user:', error);
        res.status(500).json({ error: error.message });
        console.log(error)
    }
}

const getHospitalRequests = async (req, res) => {
    try {
        const { id } = req;

        const activeRequests = await HospitalDonation.find({
            requestorId: id
        });

        // const allRequests = requests;

        if (activeRequests.length === 0) {
            return res.status(404).json({ message: 'No requests found for this user' });
        }

        activeRequests.reverse();
        res.status(200).json({ activeRequests });

    } catch (error) {
        console.error('Failed to get user requests:', error);
        res.status(500).json({ error: error.message });

    }
};

const approveHospitalDonation = async (req, res) => {
    try {
        const { donorId, donationId } = req.body;

        // Find the donor (user)
        const user = await User.findById(donorId);

        // Find the donation request
        const donationRequest = await HospitalDonation.findById(donationId);

        if (!donationRequest) {
            return res.status(404).json({ message: 'Donation request not found' });
        }

        const name = donationRequest.name;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.lastDonation = {
            donatedTo: `${name} through hospital`,
            date: Date.now(),
        }
        // Add donation to user's previous donations
        user.previousDonations.push({
            donatedTo: `${name} through hospital`,
            date: Date.now(),
        });

        // Save the updated user
        await user.save();


        res.status(200).json({ message: 'Donation approved and saved' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteHospitalBloodRequest = async (req, res) => {
    try {
        const { donationId } = req.body;
        await HospitalDonation.findByIdAndDelete(donationId);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error ', error: error.message });
    }
}


const getHospitalDonorsResponses = async (req, res) => {
    try {
        const { requestId, phoneNumber } = req.query;
        const Id = req.id;

        const user = await HospitalDonation.findById(requestId);

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

const addDonorsToTheHospitalRequest = async (req, res) => {
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
        const donateRequest = await HospitalDonation.findById(requestId);

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

module.exports = {
    signupHospital,
    loginHospital,
    HospitalverifyToken,
    deleteHospitalBloodRequest,
    sendBloodRequestsHospital,
    getHospitalRequests,
    approveHospitalDonation,
    getHospitalDonorsResponses,
    addDonorsToTheHospitalRequest
};

