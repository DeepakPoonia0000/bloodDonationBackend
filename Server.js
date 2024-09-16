const express = require('express');
const cors = require('cors');
const { addUser, loginUser, verifyToken, getBloodRequests, sendBloodRequests, getUserRequests, donatersDetail, approveDonation } = require('./controller/UserController')
const dbConnection = require('./dbConnection');
const cron = require('node-cron');
const { addDonorsToTheRequest, getDonorsResponses } = require('./controller/DonationsController');
const { adminVerifyToken, deleteUser, approveStatus, pendingUsers, loginAdmin, userDetails, getDonorsResponsesAdmin } = require('./controller/AdminController');
const { sendCampRequest, deleteCamp, getUserCamps, getCamps } = require('./controller/CampController');
const { signupHospital, loginHospital } = require('./controller/HospitalController');


const app = express();
const PORT = 7000;

dbConnection();

app.use(cors());
app.use(express.json());

app.post('/addUser',
    addUser
);

app.post('/loginUser',
    loginUser
);

// app.post('/getLocation', verifyToken, getBloodRequests)

app.get('/getLocation',
    verifyToken,
    getBloodRequests
);

app.post('/sendBloodRequest',
    verifyToken,
    sendBloodRequests
);

app.get('/getUploadedRequest',
    verifyToken,
    getUserRequests
);

app.get('/donatersDetail',
    verifyToken,
    donatersDetail
);

app.post('/addDonorToTheRequest',
    verifyToken,
    addDonorsToTheRequest
);

app.get('/getDonorsResponses',
    verifyToken,
    getDonorsResponses
);

app.post('/addCamp',
    verifyToken,
    sendCampRequest
);

app.get('/getUserCamps',
    verifyToken,
    getUserCamps
);

app.delete('/deleteCamp',
    verifyToken,
    deleteCamp
);

app.post('/approveDonation',
    verifyToken,
    approveDonation
);

app.get('/getDonorsResponsesAdmin',
    adminVerifyToken,
    getDonorsResponsesAdmin
);

app.post('/adminLogin',
    loginAdmin
);

app.delete('/reject-user',
    adminVerifyToken,
    deleteUser
);

app.put('/approve-user',
    adminVerifyToken,
    approveStatus
);

app.get('/pending-users',
    adminVerifyToken,
    pendingUsers
);

app.get('/userDetails',
    adminVerifyToken,
    userDetails
);

app.post('/hospitalSignup', signupHospital)
app.post('/loginHospital', loginHospital)




cron.schedule('0 0 */4 * *', () => {
    checkDonationEligibility();
})

// app.get('/shops', verifyToken, getShops);

app.listen(PORT, (error) => {
    if (!error) {
        console.log('Server is running successfully on port ' + PORT);
    } else {
        console.error('Error occurred, server cannot start: ' + error);
    }
});
