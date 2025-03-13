"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const BookRide = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Retrieve user data from local storage
    const userData = JSON.parse(localStorage.getItem("userData")); // Assuming user data is stored under "userData"
    if (userData) {
      const { _id } = userData; // Get user ID
      // Optionally, you can set initial values for pickup and dropoff if they exist
      const storedPickup = localStorage.getItem(`${_id}_pickup`);
      const storedDropoff = localStorage.getItem(`${_id}_dropoff`);
      if (storedPickup) setPickup(storedPickup);
      if (storedDropoff) setDropoff(storedDropoff);
    }
  }, []);

  const handleNext = () => {
    if (!pickup || !dropoff) {
      // Animated error notification
      const element = document.getElementById("error-message");
      if (element) {
        element.classList.remove("hidden");
        element.classList.add("flex");
        setTimeout(() => {
          element.classList.add("hidden");
          element.classList.remove("flex");
        }, 3000);
      } else {
        alert("Please enter both pickup and drop-off locations.");
      }
      return;
    }

    setIsLoading(true);

    // Retrieve user data again to get the user ID
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      const { _id } = userData; // Get user ID
      // Store pickup and dropoff locations in local storage
      localStorage.setItem(`${_id}_pickup`, pickup);
      localStorage.setItem(`${_id}_dropoff`, dropoff);
    }

    console.log("Navigating with:", { pickup, dropoff });
    
    // Simulate a brief loading state before navigation
    setTimeout(() => {
      router.push(`/rider/find-drivers?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`);
    }, 500);
  };
    
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 p-6">
      <motion.div 
        className="bg-white shadow-xl rounded-lg overflow-hidden w-full max-w-lg relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Decorative top accent */}
        <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        <div className="p-6 text-center">
          <motion.h1 
            className="text-2xl font-bold text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Book Your Ride Now
          </motion.h1>
          
          <motion.p 
            className="text-gray-600 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Get an exclusive offer for your first ride! #RideNow
          </motion.p>
          
          <motion.div
            className="mt-6 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  type="text"
                  placeholder="Enter Pickup Location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full p-4 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                </div>
              </motion.div>
            </div>
            
            <div className="relative">
              <motion.div 
                className="absolute inset-0 left-5 right-auto w-0.5 bg-gray-300 -top-4 -bottom-0"
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 0.3, delay: 0.5 }}
              ></motion.div>
              
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  type="text"
                  placeholder="Enter Drop-off Location"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="w-full p-4 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                </div>
              </motion.div>
            </div>
            
            {/* Error message (hidden by default) */}
            <div id="error-message" className="hidden items-center justify-center p-3 bg-red-100 text-red-700 rounded-lg">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Please enter both pickup and drop-off locations
            </div>
            
            <motion.button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md relative overflow-hidden"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)" 
              }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finding Drivers...
                </span>
              ) : (
                <span>Find Drivers</span>
              )}
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-white"
                initial={{ width: 0 }}
                animate={isLoading ? { width: "100%" } : { width: 0 }}
                transition={{ duration: 0.5 }}
              />
            </motion.button>
          </motion.div>
          
          <motion.div
            className="mt-6 bg-blue-50 p-3 rounded-lg border border-blue-100 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-blue-800 font-medium">Limited time offer: <span className="text-blue-600">Get 10% off your first ride!</span></p>
            <div className="flex justify-center mt-2">
              <motion.div 
                className="h-1 w-16 bg-blue-400 rounded"
                animate={{ width: [40, 60, 40] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookRide;