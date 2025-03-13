"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const socket = io(API_URL);

const RiderDashboard = () => {
  const [user, setUser] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentRideId, setCurrentRideId] = useState(null);
  const [notification, setNotification] = useState(null);

  const router = useRouter();

  useEffect(() => {
    // Only join ride if there's an active ride
    if (currentRideId) {
      socket.emit("joinRide", { rideId: currentRideId, userId: localStorage.getItem("userId") });
      
      socket.on("rideStatus", (data) => {
        if (data.rideId === currentRideId) {
          setRideStatus(data.status);
          setNotification(`Ride status updated: ${data.status}`);
          
          // Auto dismiss notification after 5 seconds
          setTimeout(() => {
            setNotification(null);
          }, 5000);
        }
      });
      
      return () => {
        socket.disconnect();
      };
    }
  }, [currentRideId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetchUserProfile(token);
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.user) throw new Error("Invalid user data");

      setUser(res.data.user);
      fetchRides(token, res.data.user._id);
    } catch (err) {
      setError("Session expired. Please login again.");
      localStorage.removeItem("token");
      router.push("/auth/login");
    }
  };

  const fetchRides = useCallback(async (token, userId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/ride/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!Array.isArray(res.data)) throw new Error("Invalid ride data");
      setRides(res.data);
      
      // Check if there's an active ride and set it as current
      const activeRide = res.data.find(ride => 
        ride.status !== "completed" && ride.status !== "cancelled"
      );
      
      if (activeRide) {
        setCurrentRideId(activeRide._id);
        setRideStatus(activeRide.status);
      }
    } catch (err) {
      setError("Failed to fetch ride history.");
      console.error("Ride fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  // Animation variants - with reduced effects
  const itemVariants = {
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const notificationVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -30,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white flex justify-center items-center">
      <motion.div 
        className="max-w-4xl w-full bg-gray-800 shadow-lg rounded-lg p-6 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 z-0"></div>
        
        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              className="absolute top-4 right-4 bg-blue-600 px-4 py-2 rounded-md shadow-lg z-50"
              variants={notificationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-100">
              Rider Dashboard
            </h1>
            <motion.button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>

          <p className="text-gray-400 mt-2 text-lg">
            Welcome, {user?.name || 
              <motion.span 
                className="inline-block"
                animate={{ 
                  opacity: [0.5, 1, 0.5], 
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 1.5
                }}
              >
                Loading...
              </motion.span>
            }
          </p>

          <div className="mt-6">
            <motion.button
              onClick={() => router.push("/rider/book-ride")}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Get a Ride
            </motion.button>
          </div>

          <h2 className="text-2xl font-semibold mt-8 text-gray-200">
            Ride History
          </h2>

          {loading ? (
            <div className="flex justify-center items-center mt-8 py-4">
              <motion.div 
                className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            </div>
          ) : error ? (
            <p className="text-red-500 mt-4 p-3 bg-red-900/20 rounded-lg">
              {error}
            </p>
          ) : rides.length === 0 ? (
            <p className="text-gray-500 mt-4 p-6 bg-gray-700/30 rounded-lg text-center">
              No rides found. Book your first ride now!
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {rides.map((ride) => (
                <motion.div
                  key={ride._id}
                  variants={itemVariants}
                  initial={{ opacity: 0.8 }}
                  animate="visible"
                  className="bg-gray-700 p-4 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600 transition duration-300 shadow-md relative overflow-hidden group"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)" 
                  }}
                  onClick={() => router.push(`/rider/ride-details/${ride._id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-white flex items-center">
                        <span>{ride.pickupLocation}</span>
                        <span className="mx-2 text-blue-400">→</span>
                        <span>{ride.dropoffLocation}</span>
                      </p>
                      <p className="text-gray-400 text-sm mt-1">Fare: ₹{ride.fare}</p>
                      <p className="text-gray-500 text-sm">
                        Date: {new Date(ride.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className={`text-sm font-semibold px-2 py-1 rounded-full ${
                        ride.status === "completed" 
                          ? "bg-green-900/30 text-green-400" 
                          : ride.status === "cancelled"
                            ? "bg-red-900/30 text-red-400"
                            : "bg-yellow-900/30 text-yellow-400"
                      }`}>
                        {ride.status}
                      </p>
                      <p className={`text-sm font-semibold mt-2 px-2 py-1 rounded-full ${
                        ride.paymentStatus === "paid" 
                          ? "bg-blue-900/30 text-blue-400" 
                          : "bg-orange-900/30 text-orange-400"
                      }`}>
                        {ride.paymentStatus}
                      </p>
                    </div>
                  </div>
                  
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ transformOrigin: "left" }}
                  />
                </motion.div>  
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RiderDashboard;