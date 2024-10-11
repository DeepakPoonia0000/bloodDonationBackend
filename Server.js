const express = require('express');
const cors = require('cors');
const { addUser, verifyOtp, loginUser, verifyToken, getBloodRequests, sendBloodRequests, getUserRequests, donatersDetail, approveDonation, userProfileDetails, deleteBloodRequest, forgetPasswordOtp } = require('./controller/UserController')
const dbConnection = require('./dbConnection');
const cron = require('node-cron');
const { addDonorsToTheRequest, getDonorsResponses, uploadUserImage } = require('./controller/DonationsController');
const { adminVerifyToken, deleteUser, deleteHospital, approveStatus, approveHospital, pendingUsers, loginAdmin, userDetails, HospitalDetails, getDonorsResponsesAdmin, getHospitalDonorsResponsesAdmin, setNewEvent, getEvents, deleteEvent, deleteBloodRequestAdmin } = require('./controller/AdminController');
const { sendCampRequest, deleteCamp, getUserCamps } = require('./controller/CampController');
const {
    signupHospital,
    loginHospital,
    HospitalverifyToken,
    deleteHospitalBloodRequest,
    sendBloodRequestsHospital,
    getHospitalRequests,
    approveHospitalDonation,
    getHospitalDonorsResponses,
    addDonorsToTheHospitalRequest,
    hospitlDonationDetail,
    hospitalProfileDetails
} = require('./controller/HospitalController');
const { deleteImage, generateSignature, updateImage, getImages } = require('./controller/AdminImageController');


const app = express();
const PORT = 7000;

dbConnection();

app.use(cors());
app.use(express.json());

app.post('/addUser',
    addUser
);

app.post('/verifyOtp',
    verifyOtp
)

app.post('/forgetPassword',
    forgetPasswordOtp
)

app.post('/loginUser',
    loginUser
);

app.get('/profileDetails',
    verifyToken,
    userProfileDetails
)

app.post('/uploadUserImage', verifyToken, uploadUserImage)

// app.post('/getLocation', verifyToken, getBloodRequests)

app.get('/getLocation',
    verifyToken,
    getBloodRequests
);



app.post('/sendBloodRequest',
    verifyToken,
    sendBloodRequests
);

app.delete('/deleteBloodRequestUser',
    verifyToken,
    deleteBloodRequest
)

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

app.delete('/deleteBloodRequestAdmin',
    adminVerifyToken,
    deleteBloodRequestAdmin
)

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

app.get('/getHospitalDonorsResponsesAdmin',
    adminVerifyToken,
    getHospitalDonorsResponsesAdmin
);

app.delete('/reject-hospital',
    adminVerifyToken,
    deleteHospital
);

app.put('/approve-hospital',
    adminVerifyToken,
    approveHospital
);

app.get('/hospital-details',
    adminVerifyToken,
    HospitalDetails
)

app.post('/setNewEvent',
    adminVerifyToken,
    setNewEvent
)

app.get('/getEvents',

    getEvents
)

app.delete('/deleteEvent',
    adminVerifyToken,
    deleteEvent
)

app.post('/hospitalSignup',
    signupHospital
)
app.post('/loginHospital',
    loginHospital
)

app.delete('/deleteHospitalBloodRequest',
    HospitalverifyToken,
    deleteHospitalBloodRequest
);

app.post('/sendBloodRequestHospital',
    HospitalverifyToken,
    sendBloodRequestsHospital
);

app.get('/getHospitalRequests',
    HospitalverifyToken,
    getHospitalRequests
);

app.get('/getHospitalDonorsResponses',
    HospitalverifyToken,
    getHospitalDonorsResponses
);

app.post('/addDonorToTheHospitalRequest',
    verifyToken,
    addDonorsToTheHospitalRequest
);

app.post('/approveHospitalDonation',
    HospitalverifyToken,
    approveHospitalDonation
);

app.get('/hospitlDonationDetail',
    verifyToken,
    hospitlDonationDetail
);

app.get('/hospitalProfileDetails',
    HospitalverifyToken,
    hospitalProfileDetails
)



// image upload and delete from the cloudinary;
app.post('/deleteImage',
    // adminVerifyToken,
    deleteImage
)

app.get('/signature',
    adminVerifyToken,
    generateSignature
)

app.put('/updateImage',
    adminVerifyToken,
    updateImage
)

app.get('/getImages',
    getImages
)



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
