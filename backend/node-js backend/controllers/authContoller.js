const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ride = require('../models/Ride');
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '60d' });
};


    const register = asyncHandler(async (req, res) => {
        const { name, email, phone, password, profilePicture, role, vehicleDetails } = req.body;

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = await User.create({
                name,
                email,
                phone,
                password: hashedPassword,
                profilePicture,
                role: role || 'user',
                vehicleDetails: role === 'driver' ? vehicleDetails : null,
            });

            if (user) {
                res.status(201).json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    profilePicture: user.profilePicture,
                    role: user.role,
                    vehicleDetails: user.vehicleDetails,
                    token: generateToken(user.id),
                });
            } else {
                res.status(400).json({ message: 'Invalid user data' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });


const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });


        if (user.isBlocked) {
            return res.status(403).json({ message: "Your account is blocked." });
        }


        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                vehicleDetails: user.vehicleDetails,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});




const getProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        let rides = [];

        if (user.role === "driver") {
            rides = await Ride.find({ driver: user._id }); // Fetch rides where user is the driver
        } else {
            rides = await Ride.find({ rider: user._id }); // Fetch rides where user is the rider
        }

        res.json({ user, rides });
    } catch (error) {
        res.status(500).json({ error: "Error fetching profile" });
    }
});


const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id; 
    const { name, email, phone, profilePicture } = req.body;
  
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
  
   
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      
      if (profilePicture) {
        user.profilePicture = profilePicture;
      }
  

      const updatedUser = await user.save();
  
      res.status(200).json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role,
        vehicleDetails: updatedUser.vehicleDetails,
        // token: generateToken(updatedUser.id),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  


module.exports = { register, login, getProfile, updateProfile};
