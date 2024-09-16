const jwt = require('jsonwebtoken');


const Admin = require('../model/AdminSchema');
const User = require('../model/UserSchema');
const Donater = require('../model/RequestorSchema');
const Prev = require('../model/PreviousSchema');
const Hospital = require('../model/HospitalSchema');



const adminJwtSecret = 'asdfGHJKL123$%^&*QWER!@#4%^&*!%^#QTYE^@$YEW@^WYEHre5';




const adminVerifyToken = async (req, res, next) => {
    // console.log("user is in admin token verification")
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });

    }

    try {
        const decodedToken = jwt.verify(token, adminJwtSecret);
        const user = await Admin.findById(decodedToken.id);

        if (!user) {
            return res.status(401).json({ message: 'Invalid user' });
        }

        if (user.token !== token) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = user;
        req.Id = decodedToken.id;
        req.phoneNumber = user.phoneNumber;
        next();
    } catch (error) {
        console.error('Failed to verify token:', error);
        return res.status(500).json({ message: 'Failed to verify token', error: error.message });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        const user = await Admin.findOne({ phoneNumber });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }


        if (password == user.password) {
            const token = jwt.sign({ id: user._id }, adminJwtSecret, { expiresIn: '60d' });
            user.token = token;
            await user.save();
            console.log("User logged in:", user, token);
            return res.status(200).json({ message: 'Login successful', token });

        } else {
            return res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ error: error.message });
    }
};



const approveStatus = async (req, res) => {
    console.log("user is in approve status")
    const { id } = req.body;

    try {
        const user = await User.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const approveHospital = async (req, res) => {
    console.log("user is in approve status")
    const { id } = req.body;

    try {
        const hospital = await Hospital.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
        if (!hospital) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(hospital);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const pendingUsers = async (req, res) => {
    try {
        // console.log("user is in pendingUsers")
        const pendingUsers = await User.find({ status: 'pending' });
        const pendingHospitals = await Hospital.find({ status: 'pending' })
        const registeredUsers = await User.find({ status: 'approved' });
        const registeredHospitals = await Hospital.find({ status: 'approved' });
        res.status(200).json({ pendingUsers, pendingHospitals, registeredUsers, registeredHospitals });
    } catch (error) {
        console.error('Error fetching pending users:', error);
        res.status(500).json({ message: 'Server error fetching pending users', error: error.message });
    }

}


const deleteUser = async (req, res) => {
    try {
        const { id } = req.query;
        console.log(id)
        // Delete the user
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User rejected' });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error deleting user', error: error.message });
    }
}

const deleteHospital = async (req, res) => {
    try {
        const { id } = req.query;
        console.log(id)
        // Delete the user
        const hospital = await Hospital.findByIdAndDelete(id);
        if (!hospital) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User rejected' });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error deleting user', error: error.message });
    }
}

const userDetails = async (req, res) => {
    try {

        const { requestId } = req.query;
        console.log(requestId);
        const userDetails = await User.findById(requestId);
        const donationRequests = await Donater.find({ requestorId: requestId })
        const previousDonationRequests = await Prev.find({ requestorId: requestId })

        res.status(200).json({ userDetails, donationRequests, previousDonationRequests });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error in user Details', error: error.message });
        resErr
    }
}

const HospitalDetails = async (req, res) => {
    try {

        const { requestId } = req.query;
        console.log(requestId);
        const hospitalDetails = await Hospital.findById(requestId);
        const donationRequests = await Donater.find({ requestorId: requestId })
        const previousDonationRequests = await Prev.find({ requestorId: requestId })

        res.status(200).json({ hospitalDetails, donationRequests, previousDonationRequests });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error in user Details', error: error.message });
        resErr
    }
}

const getDonorsResponsesAdmin = async (req, res) => {
    try {
        const { requestId } = req.query;

        // Find the document by requestId
        const user = await Donater.findById(requestId);

        // Send the donorsResponse array in the response
        return res.status(200).json({ donorsResponse: user.donorsResponse });

    } catch (error) {
        console.error('Error fetching donor responses:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { adminVerifyToken, loginAdmin, deleteUser,deleteHospital, approveStatus,approveHospital, pendingUsers, userDetails,HospitalDetails, getDonorsResponsesAdmin };
