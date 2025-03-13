const express = require('express');
const {login,register,getProfile, updateProfile} = require('../controllers/authContoller'); 
const {protect} = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/register',register);
router.post('/login',login);
router.get('/profile',protect,getProfile);
router.put('/profile',protect,updateProfile);

module.exports = router;