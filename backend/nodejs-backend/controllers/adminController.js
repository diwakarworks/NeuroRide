const User = require('../models/User');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const jwt = require('jsonwebtoken');

const asyncHandler = require('express-async-handler');
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '60d' });
};




const getAdminProfile = asyncHandler(async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("-password"); 

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({ admin, token: generateToken(admin.id) }); 
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: "Error fetching admin profile" });
  }
});



const  getDashboardStats = asyncHandler(async(req,res)=> {
    try{
        const totalUsers = await User.countDocuments({});
        const activeRides = await Ride.countDocuments({status : 'ongoing'});
        const totalEarnings = await Ride.aggregate([
          { $match: { status: "completed" } },  
          { $group: { _id: null, total: { $sum: "$fare" } } }
      ]);
        res.json({totalUsers, activeRides, totalEarnings: totalEarnings[0]?.total || 0,            
        });


  }catch(error){
    console.error(`Error: ${error.message}`);
    res.status(500).json({error: "Error fetching dashboard stats"});
    }  
    
})

const getUsers = asyncHandler(async (req, res) => {
    try {
      const users = await User.find({}, "name email role isBlocked isVerified");
      res.json(users);
    } catch (error) {
        console.error(`Error: ${error.message}`);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
 
  const toggleUserStatus = asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
  
      user.isBlocked = !user.isBlocked;
      await user.save();
      res.json({ message: `User ${user.isBlocked ? "Blocked" : "Unblocked"}` });
    } catch (error) {
      console.error(`Error :${error.message}`);
      res.status(500).json({ error: "Failed to update user status" });
    }
  });
  
  const verifyDriver = asyncHandler(async (req, res) => {
    try {
      const driver = await User.findById(req.params.id);
      if (!driver || driver.role !== "driver") return res.status(404).json({ error: "Driver not found" });
  
      driver.isVerified = true;
      await driver.save();
      res.json({ message: "Driver verified successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify driver" });
    }
  });

  const getPaymentsForRide = asyncHandler(async (req, res) => {
    try {
      const { driverId, rideId } = req.params;
  
      // Validate input
      if (!driverId || !rideId) {
        return res.status(400).json({ message: "Driver ID and Ride ID are required" });
      }
  
      const ride = await Ride.findOne({ _id: rideId, driver: driverId })
      .populate("paymentStatus")
      .exec();
  
      if (!ride) {
        return res.status(404).json({ message: "No ride found for this driver and ride ID" });
      }
  
      res.status(200).json({ success: true, data: ride.paymentStatus });
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  


// Get all rides for admin
const getAllRidesForAdmin = asyncHandler(async (req, res) => {
  try {
    const rides = await Ride.find().populate("driver", "name email"); // Fetch rides with driver details
    res.status(200).json(rides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ message: "Server error" });
  }
});


const updateDriverBalanceByAdmin = asyncHandler(async (req, res) => {
  try {
      const { rideId } = req.body;

      // Check if the user is an admin
      if (req.user.role !== "admin") {
          return res.status(403).json({ success: false, message: "Access denied. Admins only." });
      }

      // Find the ride
      const ride = await Ride.findById(rideId);
      if (!ride || ride.paymentStatus !== "paid") {
          return res.status(400).json({ success: false, message: "Ride not found or not paid yet." });
      }

      // Update the driver's balance
      await User.findByIdAndUpdate(ride.driver, {
          $inc: { balance: ride.fare },
      });

      console.log("Driver balance updated by Admin:", ride.fare);
      res.status(200).json({ success: true, message: "Driver balance updated successfully." });

  } catch (error) {
      console.error("Error updating driver balance:", error);
      res.status(500).json({ success: false, message: "Internal server error." });
  }
});

 


  module.exports = {getAdminProfile,getDashboardStats,getUsers,toggleUserStatus,verifyDriver,getPaymentsForRide,getAllRidesForAdmin,updateDriverBalanceByAdmin};