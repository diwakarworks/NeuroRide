const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
        transactionId: { type: String, unique: true },
        method: { type: String, enum: ['razorpay', 'upi', 'card', 'wallet'], required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Payment',PaymentSchema);
