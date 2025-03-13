"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { MdVerified, MdOutlinePhone } from "react-icons/md";
import { FaCar, FaMoneyBillWave } from "react-icons/fa";
import axios from "axios";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [rideCount, setRideCount] = useState(0);
  const [rides, setRides] = useState([]);
  const [rider, SetRider] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetchProfile(token);
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;
      console.log("Profile Data:", res.data);
      SetRider(res.data.user._id); 
      localStorage.setItem("userId", res.data.user._id); // ✅ Store userId in localStorage

      if (!data.user) throw new Error("Invalid user data received");

      setUser(data.user);
      fetchRides(token, data.user._id); // ✅ Corrected
      setLoading(false); 
      // ✅ Set loading only after successful fetch
    } catch (err) {
      setError(err.message || "Error fetching profile.");
      console.error("Profile Fetch Error:", err);
      setLoading(false); // ✅ Ensure loading stops even on error
    }
  };

  const fetchRides = async (token, userId) => {
    try {
      const res = await fetch(`${API_URL}/api/ride/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch rides");
      const data = await res.json();

      setRideCount(data.rideCount || 0);
      setRides(data.rides || []);
    } catch (err) {
      console.error("Ride Fetch Error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  const handleHome = () => {
    router.push("/");
  };

  const handleProfile = () =>{
    router.push(`/auth/edit-profile`);
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-white text-center flex flex-col items-center"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <span className="text-blue-400 text-lg font-medium">Loading profile...</span>
      </motion.div>
    </div>
  );
  
  if (error) return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-red-500 text-center mt-10 p-4 bg-red-900 bg-opacity-30 rounded-lg mx-auto max-w-md"
    >
      {error}
    </motion.div>
  );
  
  if (!user) return null;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800 shadow-lg rounded-lg p-10 max-w-4xl w-full relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 opacity-10 z-0"
          animate={{ 
            background: [
              "linear-gradient(to bottom right, #1e3a8a, #4c1d95)",
              "linear-gradient(to bottom right, #1e40af, #5b21b6)",
              "linear-gradient(to bottom right, #1e3a8a, #4c1d95)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="relative z-10">
          <motion.div 
            className="flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h2 
              className="text-2xl ml-4 text-blue-400 font-bold"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              Profile
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#e53e3e" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded flex items-center text-sm transition-colors duration-300"
            >
              <FiLogOut className="mr-2" />
              Logout
            </motion.button>
          </motion.div>

          {/* Profile Info */}
          <motion.div 
            className="flex items-center mt-6 space-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                delay: 0.4 
              }}
              src={user.profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full border-2 border-blue-500 shadow-lg shadow-blue-500/30"
            />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-gray-400 flex items-center">
                <MdOutlinePhone className="mr-2" />
                {user.phone}
              </p>
            </motion.div>
          </motion.div>

          {/* Account Details */}
          <motion.div 
            className="mt-14 bg-gray-700 p-6 rounded-lg backdrop-blur-sm bg-opacity-80 shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 70 }}
          >
            <motion.div 
              className="flex justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="text-gray-300">Phone Verified:</span>
              {user.isPhoneVerified ? (
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <MdVerified className="text-green-500 text-xl" />
                </motion.div>
              ) : (
                <span className="text-red-400">Not Verified</span>
              )}
            </motion.div>
            <motion.div 
              className="flex justify-between mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="text-gray-300">Role:</span>
              <span className="text-blue-400 capitalize">{user.role}</span>
            </motion.div>
            <motion.div 
              className="flex justify-between mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <span className="text-gray-300">Balance:</span>
              <motion.span 
                className="flex items-center text-green-400"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  <FaMoneyBillWave className="mr-1" />
                </motion.div>
                ₹{user.balance}
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Home Button */}
          <motion.div 
            className="flex justify-center mt-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleHome}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full text-md transition-all duration-300 shadow-lg shadow-blue-600/30"
            >
              Home
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProfile}
              className="bg-green-600 ml-20  hover:bg-green-700 px-6 py-2 rounded-full text-md transition-all duration-300 shadow-lg shadow-blue-600/30"
            >
              Edit Profile
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;