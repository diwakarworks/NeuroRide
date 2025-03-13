const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema(
    {
        rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        pickupLocation: { type: String, required: true },
        dropoffLocation: { type: String, required: true },
        fare: { type: Number, required: true },
        status: {
            type: String,
            enum: ['requested','assigned', 'accepted', 'ongoing', 'completed', 'cancelled'],
            default: 'requested',
        },
        ratings: [
            {
              user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
              rating: Number,
              feedback: String,
              createdAt: { type: Date, default: Date.now },
            },
          ],
        paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Ride', RideSchema);
