const Hospital = require('../model/HospitalSchema');
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
            operatingHours,
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
            operatingHours,
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

module.exports = {
    signupHospital,
    loginHospital,
    HospitalverifyToken
};