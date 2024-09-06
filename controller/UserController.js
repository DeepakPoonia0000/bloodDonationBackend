const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/UserSchema')
const Donater = require('../model/RequestorSchema');
const Prev = require('../model/PreviousSchema');

const jwtSecret = 'Thr0bZyphrnQ8vkJumpl3BaskEel@ticsXzylN!gmaPneuma';



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

        req.Id = decodedToken.id;
        req.bloodGroup = user.bloodGroup;
        next();
    } catch (error) {
        console.error('Failed to verify token:', error);
        return res.status(500).json({ message: 'Failed to verify token', error: error.message });
    }
};

const addUser = async (req, res) => {
    try {
        const { email, password, bloodGroup } = req.body;
        console.log(email, password, bloodGroup)
        if (!email || !password || !bloodGroup) {
            return res.status(400).json({ error: 'Email and password are necessary for customer' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const newUser = await User.create({
            email,
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
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }


        if (password == user.password) {
            const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '60d' });
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

const getBloodRequests = async (req, res) => {
    try {
        console.log("user is in savelocation")
        const { location } = req.body;
        const bloodGroup = req.bloodGroup;
        console.log("Your Registered Blood Group", bloodGroup)
        const lng = Number(location.longitude);
        const lat = Number(location.latitude);

        // console.log(lng,lat , bloodGroup)

        const radiusInKilometers = 20;
        const earthRadiusInKilometers = 6378.1;

        const radiusInRadians = radiusInKilometers / earthRadiusInKilometers;
        if (!bloodGroup) {
            const donaters = await Donater.find({
                location
                    : {
                    $geoWithin: {
                        $centerSphere: [[lng, lat], radiusInRadians],
                    },
                }
            })
            console.log("number of enteries send =>", donaters.length)
            res.status(200).json(donaters)
        } else {
            const donaters = await Donater.find({
                bloodGroup,
                location
                    : {
                    $geoWithin: {
                        $centerSphere: [[lng, lat], radiusInRadians],
                    },
                }
            }).limit(100);
            console.log("number of enteries send =>", donaters.length)
            donaters.reverse();
            res.status(200).json(donaters)
        }

    } catch (error) {
        console.error('Failed to add user:', error);
        res.status(500).json({ error: error.message });
        console.log(error)
    }
}

const sendBloodRequests = async (req, res) => {
    try {
        const { location, bloodGroup, name, phoneNumber } = req.body;
        const newUser = await Donater.create({
            location,
            bloodGroup,
            phoneNumber,
            name,
        });
        console.log(newUser)
        const saveReq = await Prev.create({
            name,
            location,
            bloodGroup,
            phoneNumber
        })

        res.status(200).json(newUser);
    } catch (error) {
        console.error('Failed to add user:', error);
        res.status(500).json({ error: error.message });
        console.log(error)
    }
}



module.exports = { addUser, loginUser, verifyToken, getBloodRequests, sendBloodRequests };
