const express = require('express');
const cors = require('cors');
const { addUser, loginUser, verifyToken, getBloodRequests, sendBloodRequests, getUserRequests, donatersDetail } = require('./controller/UserController')
const dbConnection = require('./dbConnection');
const cron = require('node-cron');
const { addDonorsToTheRequest, getDonorsResponses } = require('./controller/DonationsController');


const app = express();
const PORT = 7000;

dbConnection();

app.use(cors());
app.use(express.json());

app.post('/addUser', addUser);
app.post('/loginUser', loginUser);
app.post('/getLocation', verifyToken, getBloodRequests)
app.post('/sendBloodRequest', verifyToken, sendBloodRequests)
app.post('/getUploadedRequest', verifyToken, getUserRequests)
app.post('/donatersDetail', verifyToken, donatersDetail)
app.post('/addDonorToTheRequest', verifyToken, addDonorsToTheRequest)
app.post('/getDonorsResponses', verifyToken, getDonorsResponses)


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
