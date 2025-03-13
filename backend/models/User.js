const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true, unique: true },
        profilePicture: { type: String,required: true },
        isPhoneVerified: { type: Boolean, default: false },
        password: { type: String, required: true },
        role: { type: String, enum: ['user', 'driver', 'admin'], default: 'user' },
        vehicleDetails: {
            model: String,
            licensePlate: String,
            color: String,
            seats: Number,
        },
        ratings: [
            {
              user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
             rating: Number,
              feedback: String,
              createdAt: Date,
            },
          ],
        balance: { type: Number, default: 0 },

        isBlocked: { type: Boolean, default: false }, 
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
