const express = require('express');
const { estimateFare } = require('../services/pricingService');
const {processPayment, updatePaymentStatus} = require('../controllers/paymentController'); 
const {protect} = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/charge',protect,processPayment);
router.post('/update',protect,updatePaymentStatus);
router.get('/estimate',protect,estimateFare);

module.exports = router;