"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaCar, FaMapMarkerAlt, FaMoneyBillWave, FaStar, FaCheck, FaTimes, FaRoute } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const DriverHome = () => {
  const [rides, setRides] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState(null);
  const [location, setLocation] = useState(null);
  const [driverName, setDriverName] = useState("Driver");
  const router = useRouter();

  const fetchRides = async (driverId) => {
    try {
      if (!driverId) return;

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      setLoading(true);
      const response = await fetch(`${API_URL}/api/ride/driver/${driverId}/rides`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch rides");
      }

      console.log("Fetching rides for driver:", driverId);
      setRides(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rides:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch(`${API_URL}/api/auth/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log("Driver Profile:", data);

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch profile");
        }

        if (data.user.role === "driver") {
          localStorage.setItem("driverId", data.user._id);
          setDriverId(data.user._id);
          setDriverName(data.user.name || "Driver");
          fetchRides(data.user._id);
        } else {
          localStorage.removeItem("driverId");
        }

        localStorage.setItem("userId", data.user._id);
      } catch (error) {
        console.error("Error fetching driver profile:", error);
      }
    };

    fetchDriverProfile();
  }, []);

  useEffect(() => {
    const storedDriverId = localStorage.getItem("driverId");
    if (storedDriverId) {
      setDriverId(storedDriverId);
      fetchRides(storedDriverId);
    }
  }, []);

  const handleAcceptRide = async (rideId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_URL}/api/ride/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ rideId, driverId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error accepting ride:", errorData.error);
        return;
      }

      const updatedRide = await response.json();
      console.log("Ride accepted:", updatedRide);
      
      // Update rides list
      fetchRides(driverId);
    } catch (error) {
      console.error("Error accepting ride:", error);
    }
  };

  const handleCancelRide = async (rideId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_URL}/api/ride/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ rideId, driverId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error rejecting ride:", errorData.error);
        return;
      }

      const updatedRide = await response.json();
      console.log("Ride rejected:", updatedRide);
      
      // Update rides list
      fetchRides(driverId);
    } catch (error) {
      console.error("Error rejecting ride:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "in_progress":
      case "inprogress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto p-4 pt-8"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {driverName}</h1>
          </div>
          <div className="bg-blue-600 rounded-full p-3 shadow-lg">
            <FaCar className="text-white text-2xl" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaRoute className="mr-2 text-blue-600" /> Your Ride Requests
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : rides.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-blue-50 rounded-xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCar className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No rides assigned yet</h3>
              <p className="text-gray-600">New ride requests will appear here. Check back soon!</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {rides.map((ride, index) => (
                <motion.div 
                  key={ride._id} 
                  className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/driver/journey/${ride._id}`)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{ride.pickupLocation}</span>
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </span>
                    </div>
                    
                    <div className="relative pl-6 mb-4">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                      <div className="absolute left-0 bottom-0 w-2 h-2 rounded-full bg-blue-600 -ml-0.75"></div>
                      <p className="text-gray-800 font-medium">{ride.dropoffLocation}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-green-600 mr-2" />
                        <span className="text-gray-800 font-bold">₹{ride.fare}</span>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(ride.paymentStatus)}`}>
                          {ride.paymentStatus}
                        </span>
                      </div>
                    </div>
                    
                    {ride.ratings && ride.ratings.length > 0 && (
                      <div className="border-t border-gray-100 pt-3 mt-3">
                        {ride.ratings.map((rating, idx) => (
                          <div key={idx} className="flex items-start">
                            <FaStar className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                            <div>
                              <p className="text-gray-800 font-semibold">{rating.rating} / 5</p>
                              {rating.feedback && (
                                <p className="text-gray-600 text-sm">{rating.feedback}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {ride.status === "requested" && (
                      <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 mr-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                          onClick={(e) => handleAcceptRide(ride._id, e)}
                        >
                          <FaCheck className="mr-2" /> Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 ml-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                          onClick={(e) => handleCancelRide(ride._id, e)}
                        >
                          <FaTimes className="mr-2" /> Cancel
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DriverHome;