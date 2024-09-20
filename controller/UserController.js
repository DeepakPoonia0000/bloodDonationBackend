// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('../model/UserSchema')
const Donater = require('../model/RequestorSchema');
const Prev = require('../model/PreviousSchema');
const Camp = require('../model/CampSchema');
const Hospital = require('../model/HospitalSchema');
const HospitalDonation = require('../model/HospitalDonationSchema');

const jwtSecret = 'Thr0bZyphrnQ8vkJumpl3BaskEel@ticsXzylN!gmaPneuma';



const getCompatibleBloodGroups = (bloodGroup) => {
    switch (bloodGroup) {
        case 'o-': return ['o-', 'o+', 'a-', 'a+', 'b-', 'b+', 'ab-', 'ab+', 'a2-', 'a2+'];
        case 'o+': return ['o+', 'a+', 'b+', 'ab+'];
        case 'a-': return ['a-', 'a+', 'ab-', 'ab+', 'a2-', 'a2b-'];
        case 'a+': return ['a+', 'ab+'];
        case 'b-': return ['b-', 'b+', 'ab-', 'ab+'];
        case 'b+': return ['b+', 'ab+'];
        case 'ab-': return ['ab-', 'ab+'];
        case 'ab+': return ['ab+'];
        case 'a2+': return ['a2+', 'a2b+'];
        case 'a2-': return ['a2-', 'a2b-', 'a2b+', 'o-'];
        case 'a2b+': return ['a2b+'];
        case 'a2b-': return ['a2b-', 'a2b+'];
        case 'hh': return ['hh'];
        case 'inra': return ['inra'];
        default: return [];
    }
}

const getBloodRequests = async (req, res) => {
    try {
        // const { location } = req.body;
        const { location } = req.query;
        const bloodGroup = req.bloodGroup;
        const lng = Number(location.longitude);
        const lat = Number(location.latitude);
        console.log(lng, lat)

        const radiusInKilometers = 20;
        const earthRadiusInKilometers = 6378.1;
        const radiusInRadians = radiusInKilometers / earthRadiusInKilometers;

        const compatibleBloodGroups = getCompatibleBloodGroups(bloodGroup);

        const query = {
            location: {
                $geoWithin: {
                    $centerSphere: [[lng, lat], radiusInRadians],
                },
            }
        };

        const query2 = {
            location: {
                $geoWithin: {
                    $centerSphere: [[lng, lat], radiusInRadians],
                },
            }
        };

        if (bloodGroup) {
            query.bloodGroup = { $in: compatibleBloodGroups };
        }

        const donaters = await Donater.find(query).limit(100);
        const hospitalRequests = await HospitalDonation.find(query2).limit(10)
        const camps = await Camp.find(query2);
        console.log("number of entries sent =>\n", camps.length);
        donaters.reverse();
        res.status(200).json({ donaters, camps, hospitalRequests });

    } catch (error) {
        console.error('Failed to add user:', error);
        res.status(500).json({ error: error.message });
    }
};


const sendBloodRequests = async (req, res) => {
    try {
        const { location, bloodGroup, name } = req.body;
        const { phoneNumber, Id } = req;
        if (!bloodGroup || !name) {
            res.status(500).json("Blood group, and name is required for making a request");
        } else {
            const newUser = await Donater.create({
                requestorId: Id,
                location,
                bloodGroup,
                phoneNumber,
                name,
            });
            console.log(newUser)
            const saveReq = await Prev.create({
                requestorId: Id,
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

const deleteBloodRequest = async (req, res) => {
    try {
        const { id } = req.query;  // Get the blood request ID from query
        const { Id } = req;        // Get the user's ID (who is making the request)

        // Find the blood request by its ID
        const user = await Donater.findById(id);

        // Check if the user exists and if the requestor ID matches the logged-in user ID
        if (user && user.requestorId == Id) {
            // Delete the blood request
            await Donater.findByIdAndDelete(id);
            return res.status(200).json({ message: "Blood Request deleted successfully." });
        }

        // If user not authorized, send a 403 Forbidden response
        return res.status(403).json({ message: "You are not authorized to perform this action." });

    } catch (error) {
        // Catch and return any server errors
        return res.status(500).json({ message: 'Server error in delete Blood Request.', error: error.message });
    }
};


const getUserRequests = async (req, res) => {
    try {
        const { Id } = req;

        const requests = await Donater.find({
            requestorId: Id
        });

        // const allRequests = requests;

        if (requests.length === 0) {
            return res.status(404).json({ message: 'No requests found for this user' });
        }

        requests.reverse();
        res.status(200).json({ requests });

    } catch (error) {
        console.error('Failed to get user requests:', error);
        res.status(500).json({ error: error.message });

    }
};

const donatersDetail = async (req, res) => {
    try {
        const { donaterId } = req.query;
        const response = await Donater.findById(donaterId);
        if (!response) {
            return res.status(404).json({ message: 'Donater not found' });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json(error);
    }
};



const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decodedToken = jwt.verify(token, jwtSecret);
        const user = await User.findById(decodedToken.id);

        if (!user) {
            return res.status(401).json({ message: 'Invalid user' });
        }

        if (user.token !== token) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = user;
        req.Id = decodedToken.id;
        req.bloodGroup = user.bloodGroup;
        req.phoneNumber = user.phoneNumber;
        next();
    } catch (error) {
        console.error('Failed to verify token:', error);
        return res.status(500).json({ message: 'Failed to verify token', error: error.message });
    }
};

const addUser = async (req, res) => {
    try {
        const { phoneNumber, password, bloodGroup } = req.body;
        console.log(phoneNumber, password, bloodGroup)
        if (!phoneNumber || !password || !bloodGroup) {
            return res.status(400).json({ error: 'Phone Number and password are necessary for customer' });
        }

        const existingNumber = await User.findOne({ phoneNumber });
        if (existingNumber) {
            return res.status(400).json({ error: 'Number already exists' });
        }

        const newUser = await User.create({
            phoneNumber,
            password,
            bloodGroup,
        });

        console.log(newUser);
        res.status(201).json({ newUser });
    } catch (error) {
        console.error('Failed to add user:', error);
        res.status(500).json({ error: error.message });
        console.log(error)
    }
};

const loginUser = async (req, res) => {
    try {
        const { phoneNumber, password, location } = req.body;
        console.log("location in login user =>", location)
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.status == 'pending') {
            return res.status(404).json({ error: 'Request Approval Still Pending' });
        }


        if (password == user.password) {
            const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '60d' });
            user.token = token;
            user.location = location;
            await user.save();
            console.log("User logged in:", user);
            return res.status(200).json({ message: 'Login successful', token });

        } else {
            return res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login failed:', error);
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

const userProfileDetails = async (req, res) => {
    try {
        const { Id } = req;
        const user = await User.findById(Id, { token: 0 });
        const previousRequests = await Prev.find({ requestorId: Id });
        res.status(200).json({ user, message:"these are the previous requests =>",previousRequests });

    } catch (error) {
        res.status(500).json({ message: 'Server error ', error: error.message });

    }
}

const sendOtpViaEmail = async (req, res) => {
    try {
        const { phoneNumber, userEmail } = req.body; // Ensure you get the username from the request body or context

        if (!userEmail || !phoneNumber) {
            return res.status(400).json({ error: "Email and phone number is required for OTP verification" });
        }

        const user = await User.findOne({ phoneNumber });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "twoobgmi@gmail.com",
                pass: "ozeuccgzxmyznxdr",
            },
        });

        const OTP = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number

        const mailOptions = {
            from: "twoobgmi@gmail.com",
            to: userEmail,
            subject: "OTP Verification",
            text: `Dear sir, The 6 digit OTP for your donation app account is ${OTP}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).send({ error: "Error sending email" });
            } else {
                console.log("Email sent: " + info.response);
                res.status(201).json({
                    message: "OTP Sent successfully !",
                });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = { addUser, loginUser, userProfileDetails, verifyToken, getBloodRequests, sendBloodRequests, deleteBloodRequest, getUserRequests, donatersDetail, approveDonation };