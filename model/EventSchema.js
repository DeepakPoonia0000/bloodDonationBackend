// event schema

const mongoose = require('mongoose')

const event = new mongoose.Schema({

    eventName: String,
    eventLocation: String,
    eventDate: Date,
    eventDescription: String,
    createdOn: {
        type: Date,
        default: Date.now,
    },
    deleteAt: {
        type: Date,
        default: function () {
            const eventDate = new Date(this.eventDate);
            // Set delete time to 11:55 PM of the next day
            const deleteAt = new Date(eventDate);
            deleteAt.setDate(eventDate.getDate() + 1);  // Move to next day
            deleteAt.setHours(23, 55, 0, 0);  // Set time to 11:55 PM
            return deleteAt;
        },
    },
});

// TTL index on deleteAt field to delete document automatically
eventSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });

const Event = mongoose.model('Event', event);

module.exports = Event;