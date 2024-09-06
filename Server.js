const express = require('express');
const cors = require('cors');
const { addUser , loginUser , verifyToken, getBloodRequests, sendBloodRequests } = require('./controller/UserController')
const dbConnection = require('./dbConnection');

const app = express();
const PORT = 7000;

dbConnection();

app.use(cors());
app.use(express.json());


app.post('/addUser', addUser);
app.post('/loginUser', loginUser);
app.post('/getLocation',verifyToken , getBloodRequests)
app.post('/getRequest' , sendBloodRequests)

// app.get('/shops', verifyToken, getShops);

app.listen(PORT, (error) => {
    if (!error) {
        console.log('Server is running successfully on port ' + PORT);
    } else {
        console.error('Error occurred, server cannot start: ' + error);
    }
});
