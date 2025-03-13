const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const Ride = require('../models/Ride');


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const processPayment = asyncHandler(async (req, res) => {
    try {
        const { amount, currency } = req.body;

        const options = {
            amount: amount * 100, 
            currency: currency || 'INR',
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        console.error(`Error:${error.message}`);
        res.status(500).json({ error: 'Payment processing failed' });
    }
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
    try {
        const { rideId } = req.body;

        if (!rideId) {
            return res.status(400).json({ error: "Ride ID is required" });
        }

        const ride = await Ride.findByIdAndUpdate(
            rideId,
            { paymentStatus: "paid" },
            { new: true, runValidators: true }
        );

        if (!ride) {
            return res.status(404).json({ error: "Ride not found" });
        }

        res.status(200).json({ 
            message: "Payment successful", 
            rideId: ride._id, 
            paymentStatus: ride.paymentStatus 
        });
    } catch (error) {
        console.error(`Error updating payment status: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




module.exports = { processPayment,updatePaymentStatus };