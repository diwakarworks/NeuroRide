const express = require('express');
const {getDashboardStats,getUsers,toggleUserStatus,verifyDriver, getAdminProfile, getPaymentsForRide, getAllRidesForAdmin, updateDriverBalanceByAdmin} = require('../controllers/adminController');
const {protect ,isAdmin} = require('../middleware/authMiddleware');
const router  = express.Router();

router.get('/profile',protect,isAdmin,getAdminProfile);

router.get('/payments/:driverId/:rideId',protect,isAdmin,getPaymentsForRide);

router.get('/rides',protect,isAdmin,getAllRidesForAdmin)

router.get('/stats',protect,isAdmin, getDashboardStats);

router.get('/users',protect,isAdmin, getUsers);

router.post("/update-driver-balance", protect, isAdmin, updateDriverBalanceByAdmin);


router.patch('/users/:id/status',protect,isAdmin,toggleUserStatus);

router.patch('/verify/:id',protect,isAdmin, verifyDriver);

module.exports = router;