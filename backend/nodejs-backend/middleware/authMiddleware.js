const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if(!req.user){
            return res.status(404).json({ message: 'User not found' });
        }
        if(req.user.isBlocked) {
            return res.status(403).json({ message: "You're account is Blocked by the Admin" });
        }


        next();
    }
    catch (error) {
        console.error(`Error:${error.message}`);
        return res.status(401).json({ message: 'No authorization Token Failed' });
    }
});


const isAdmin = (req,res,next) => {
    if(req.user.role !== 'admin'){
        return res.status(403).json({ message: 'Access Denied' });
    }
        next();

}



module.exports = {protect,isAdmin}