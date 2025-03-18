const asyncHandler = require('express-async-handler');
const Ride = require('../models/Ride');
const User = require('../models/User');
const axios = require('axios');
const redisClient = require('../config/redis');

const requestRide = asyncHandler(async (req, res) => {
    try {
        const { rider, pickupLocation, dropoffLocation, fare, driverId } = req.body;

        let selectedDriverId = driverId;
        if (!driverId) {
            const response = await axios.get("https://neuroride-5.onrender.com/find-drivers", {
                params: { pickup: pickupLocation, dropoff: dropoffLocation },
            });

            const drivers = response.data.drivers;
            if (!drivers || drivers.length === 0) {
                return res.status(400).json({ error: "No available drivers at the moment" });
            }

            return res.status(200).json({ availableDrivers: drivers }); // Send drivers to frontend
        }

        // Create ride request with the selected driver
        const newRide = await Ride.create({
            rider,
            pickupLocation,
            dropoffLocation,
            fare,
            driver: selectedDriverId, // Rider-chosen driver
            status: "requested",
        });

        res.status(201).json(newRide);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: "Error requesting ride" });
    }
});


const getDriverRides = asyncHandler(async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!driverId) {
      return res.status(400).json({ error: "Driver ID is required" });
    }

    // Check if data exists in Redis
    const cachedRides = await redisClient.get(`driver:rides:${driverId}`);
    if (cachedRides) {
      return res.json(JSON.parse(cachedRides)); // Return cached response
    }

    // If not cached, fetch from database
    const rides = await Ride.find({ driver: driverId });

    if (!rides.length) {
      return res.status(404).json({ message: "No rides found for this driver" });
    }

    // Cache data for 1 hour (3600 seconds)
    await redisClient.set(`driver:rides:${driverId}`, JSON.stringify(rides), {
      EX: 3600,
    });

    res.json(rides);
  } catch (error) {
    console.error(`❌ Error fetching driver rides: ${error.message}`);
    res.status(500).json({ error: "Error fetching rides" });
  }
});





const acceptRide = asyncHandler(async (req, res) => {
    try {
        const { rideId, driverId } = req.body;

 
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ error: "Ride not found" });
        }

 
        if (!ride.driver || ride.driver.toString() !== driverId) {
            return res.status(400).json({ error: "Invalid driver for this ride" });
        }

     
        ride.status = "accepted";
        await ride.save();

        res.json(ride);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: "Error accepting ride" });
    }
});


const getRideStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params; // This is the ride ID

        const ride = await Ride.findById(id).populate("driver", "name profilePicture vehicleDetails"); // Fetch the ride details using its ID

        if (!ride) return res.status(404).json({ error: "Ride not found" });

        res.json(ride); // Return the ride details
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: "Error fetching ride status" });
    }
});

const submitrating = asyncHandler(async (req, res) => {
    try {
      const { rideId, rating, feedback } = req.body;
      const userId = req.user.id;
  
      if (!rideId || !rating) {
        return res.status(400).json({ error: "Ride ID and rating are required" });
      }
  
      const ride = await Ride.findById(rideId);
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }
  
      const driver = await User.findById(ride.driver);
      if (!driver || driver.role !== "driver") {
        return res.status(404).json({ error: "Driver not found" });
      }
  
      // Ensure `ratings` exists in `Ride`
      if (!ride.ratings) {
        ride.ratings = [];
      }
  
      const newRating = {
        user: userId,
        rating,
        feedback,
        createdAt: new Date(),
      };
  
      ride.ratings.push(newRating); // ✅ No more "undefined" error
      await ride.save();
  
      // Ensure `ratings` exists in `User`
      if (!driver.ratings) {
        driver.ratings = [];
      }
  
      driver.ratings.push(newRating);
      await driver.save();
  
      res.json({ message: "Rating submitted successfully" });
    } catch (error) {
      console.error("Error submitting rating:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  

const fetchDistanceAndDuration = asyncHandler(async(req, res) => {
    const { pickup, dropoff } = req.body;
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  
    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: "Google Maps API Key is missing" });
    }
  
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        pickup
      )}&destinations=${encodeURIComponent(dropoff)}&key=${GOOGLE_MAPS_API_KEY}`;
  
      const response = await axios.get(url);
      const data = response.data;
  
      if (data.status !== "OK") {
        return res.status(400).json({ error: data.error_message });
      }
  
      res.json({
        distance: data.rows[0].elements[0].distance.text,
        duration: data.rows[0].elements[0].duration.text,
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      res.status(500).json({ error: "Failed to fetch distance" });
    }
  });

const getUserRides = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params; // This is the user (rider) ID

        const rides = await Ride.find({ rider: id }); // Find all rides for this user

        if (!rides.length) return res.status(404).json({ error: "No rides found" });

        res.json(rides); // Return all rides for the user
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: "Error fetching user rides" });
    }
});



const startRide = async (req, res) => {
  try {
    const { rideId, driverId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if (ride.driver.toString() !== driverId) {
      return res.status(403).json({ error: "Unauthorized driver" });
    }

    ride.status = "ongoing";
    await ride.save();
    res.json({ message: "Ride started successfully", ride });
  } catch (error) {
    console.error("Error starting ride:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



const endRide = asyncHandler(async (req, res) => {
    try {
        const { rideId } = req.body;
        const ride = await Ride.findByIdAndUpdate(rideId, { status:'cancelled' }, { new: true });
        res.json(ride);
    } catch (error) {
        console.error(`Error:${error.message}`);
        res.status(500).json({ error: 'Error ending ride' });
    }
});


const completeRide = asyncHandler(async (req, res) => {
  try {
      const {rideId,driverId} = req.body;

      // Ensure both rideId and driverId are provided
      if (!rideId || !driverId) {
          return res.status(400).json({ error: "Ride ID and Driver ID are required" });
      }

      // Find the ride and ensure the correct driver is completing it
      const ride = await Ride.findById(rideId);
      if (!ride) {
          return res.status(404).json({ error: "Ride not found" });
      }

      if (ride.driver.toString() !== driverId) {
          return res.status(403).json({ error: "Unauthorized: Driver " });
      }

     
      ride.status = "completed";
      await ride.save();

      res.json({message:"Ride Ended Successfully ", ride});
  } catch (error) {
      console.error(`Error: ${error.message}`);
      res.status(500).json({ error: "Error completing ride" });
  }
});





module.exports = {requestRide,getDriverRides,acceptRide,submitrating,fetchDistanceAndDuration,getUserRides,getRideStatus,startRide,endRide,completeRide};
