"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaHome, FaSync } from "react-icons/fa";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const ConfirmPickup = () => {
  const [pickup, setPickup] = useState("");
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [message, setMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadGoogleMapsApi = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }
        window.initMap = () => resolve();
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error("Failed to load Google Maps API"));
        document.body.appendChild(script);
      });
    };

    const initializeMap = async () => {
      await loadGoogleMapsApi();
      const mapInstance = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 15,
        styles: [
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.fill",
            stylers: [{ color: "#ffffff" }, { lightness: 17 }],
          },
        ],
      });
      setMap(mapInstance);
    };

    initializeMap();
  }, []);

  const handleConfirmPickup = async () => {
    if (!pickup) {
      alert("Please enter a pickup location");
      return;
    }
   
    const geocoder = new window.google.maps.Geocoder();
    try {
      const results = await new Promise((resolve, reject) => {
        geocoder.geocode({ address: pickup }, (results, status) => {
          if (status === "OK") {
            resolve(results);
          } else {
            reject(new Error("Geocode was not successful: " + status));
          }
        });
      });

      const { geometry } = results[0];
      const newLocation = {
        lat: geometry.location.lat(),
        lng: geometry.location.lng(),
      };
      map.setCenter(newLocation);

      if (marker) {
        marker.setMap(null);
      }

      const newMarker = new window.google.maps.Marker({
        position: newLocation,
        map: map,
        title: pickup,
        animation: window.google.maps.Animation.DROP,
      });
      setMarker(newMarker);

      localStorage.setItem("pickupLocation", pickup);
      localStorage.setItem("rideStatus", "pending");
      setWaiting(true);
      setMessage("Waiting for driver confirmation...");

    
      setTimeout(() => {
        const status = localStorage.getItem("rideStatus");
        if (status === "accepted") {
          router.push("/rider/ride-details");
        } else {
          setMessage("Driver did not respond.");
          setWaiting(false);
        }
      }, 60000); 
    } catch (error) {
      alert(error.message);
    }
  };

  const handleHome = async () => {
    router.push("/");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Confirm Pickup Location
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaMapMarkerAlt className="h-5 w-5 text-blue-500" />
          </div>
          <input
            type="text"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Enter Pickup Location"
            className="w-full pl-10 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 shadow-sm"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirmPickup}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-md"
        >
          Confirm Pickup
        </motion.button>
        {waiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100"
          >
            <p className="text-blue-800 text-center flex items-center justify-center">
              <span className="inline-block h-3 w-3 mr-2 bg-blue-500 rounded-full animate-pulse"></span>
              {message}
            </p>
          </motion.div>
        )}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md mt-6 relative"
      >
        <div id="map" className="w-full h-64 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden"></div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 z-10"
          onClick={handleRefresh}
        >
          <FaSync className={`text-blue-600 h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </motion.button>
      </motion.div>
      
      <div className="mt-8 flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleHome}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md"
        >
          <FaHome className="mr-2" /> Go Home
        </motion.button>
      </div>
    </div>
  );
};

export default ConfirmPickup;