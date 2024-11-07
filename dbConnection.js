// dbConnection.jsx

const mongoose = require('mongoose');

const dbConnection = async () => {
    
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/localBlood');
        console.log('Connected to database');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = dbConnection;