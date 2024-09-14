const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
    hospitalName:String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    
});

const Camp = mongoose.model('Camp', campSchema);

module.exports = Camp;
