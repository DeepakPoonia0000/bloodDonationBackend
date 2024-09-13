// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/UserSchema')
const Donater = require('../model/RequestorSchema');
const Prev = require('../model/PreviousSchema');
const Camp = require('../model/CampSchema');

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
        // console.log(lng, lat)

        const radiusInKilometers = 600;
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

        const queryTwo = {
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
        const camps = await Camp.find();
        console.log("number of entries sent =>", camps.length);
        donaters.reverse();
        res.status(200).json({ donaters, camps });

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



module.exports = { addUser, loginUser, verifyToken, getBloodRequests, sendBloodRequests, getUserRequests, donatersDetail };
