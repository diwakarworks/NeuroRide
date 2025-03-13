const express = require('express');
const {requestRide,acceptRide,getUserRides,getRideStatus,startRide,endRide,completeRide, getDriverRides, fetchDistanceAndDuration, submitrating, updateDriverBalance} = require('../controllers/rideController'); 
const {protect} = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/request',protect,requestRide); 
router.post('/accept',protect,acceptRide);
router.get('/driver/:driverId/rides',protect,getDriverRides)
router.get('/user/:id',protect,getUserRides);
router.post('/rate',protect,submitrating)
router.get('/status/:id',protect,getRideStatus);
router.post('/distance',protect,fetchDistanceAndDuration);
router.post('/start',protect,startRide);
router.post('/cancel',protect,endRide);
router.post('/complete',protect,completeRide);

module.exports = router;