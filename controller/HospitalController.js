const Hospital = require('../model/HospitalSchema');
const HospitalDonation = require('../model/HospitalDonationSchema')
const HospitalPrev = require('../model/HospitalPreviousRecords')
const jwt = require('jsonwebtoken');

// Secret key for JWT (ideally stored in an environment variable)
const JWT_SECRET = 'qwertyUJIKL:@#456tU&*I(Op#E$R%^YuiDEFRGH';

const HospitalverifyToken = (req, res, next) => {
    // Get token from the request header
    const token = req.headers.authorization;

    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        // Attach decoded user information to the request object
        req.id = decoded.id;
        req.hospitalName = decoded.name;
        next();
    });
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
    } catch (error) {
        // Handle errors
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const sendBloodRequestsHospital = async (req, res) => {
    try {
        const { location, bloodGroup, name } = req.body;
        const { id } = req;
        if (!bloodGroup || !name) {
            res.status(500).json("Blood group, and name is required for making a request");
        } else {
            const newUser = await HospitalDonation.create({
                requestorId: id,
                location,
                bloodGroup,
                phoneNumber,
                name,
            });
            console.log(newUser)
            const saveReq = await HospitalPrev.create({
                requestorId: id,
                location,
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

const getUserRequests = async (req, res) => {
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

const approveDonation = async (req, res) => {
    try {
        const { donorId, donationId } = req.body;

        // Find the donor (user)
        const user = await User.findById(donorId);

        // Find the donation request
        const donationRequest = await Donater.findById(donationId);

        if (!donationRequest) {
            return res.status(404).json({ message: 'Donation request not found' });
        }

        const name = donationRequest.name;
        // console.log(donationRequest);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.lastDonation = {
            donatedTo: name,
            date: Date.now(),
        }
        // Add donation to user's previous donations
        user.previousDonations.push({
            donatedTo: name,
            date: Date.now(),
        });

        // Save the updated user
        await user.save();

        // Delete the donation request after it's approved
        await Donater.findByIdAndDelete(donationId);

        res.status(200).json({ message: 'Donation approved, saved, and removed from the request' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    signupHospital,
    loginHospital,
    HospitalverifyToken
};