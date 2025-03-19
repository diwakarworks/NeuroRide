"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

const RideDetails = () => {
  const { id: rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [location, setLocation] = useState(null);
  const [rideDetails, setRideDetails] = useState(null);
  const [verifyPayment, setVerifyPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [mapExpanded, setMapExpanded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [rideStatus, setRideStatus] = useState("");
  const [showRatingSection, setShowRatingSection] = useState(false);



  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);

    socket.on("connect", () => {
      console.log("Connected to Socket:", socket.id);
    });

    socket.on("rideUpdate", (data) => {
      setRideStatus(data.status);
      console.log("Ride update:", data);
    });

    socket.on("paymentStatus", (data) => {
      if (data.rideId === rideId) {
        setPaymentStatus(data.status);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [rideId]);

  const fetchDistanceAndDuration = async (pickup, dropoff) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/ride/distance`,
        { pickup, dropoff },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.distance && response.data?.duration) {
        setDistance(response.data.distance);
        setDuration(response.data.duration);
      } else {
        console.error("Unexpected API response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching distance & duration:", error?.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (!rideId) return;

    const fetchRideDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch(`${API_URL}/api/ride/status/${rideId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch ride details");

        setRide(data);
        fetchDistanceAndDuration(data.pickupLocation, data.dropoffLocation);

        const driverId = data.driver._id;

        const socket = new WebSocket(`wss://neuroride-9.onrender.com/ws/track/${driverId}`);

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("Received location update:", data);
          updateRideLocation(data);
        };

        function updateRideLocation(data) {
          const { rideId, latitude, longitude } = data;
          console.log(`Ride ${rideId} is now at: (${latitude}, ${longitude})`);
          setDriverLocation({ lat: latitude, lng: longitude });
        }

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
          console.log("WebSocket connection closed");
        };
      } catch (error) {
        console.error("Error fetching ride details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRideDetails();
  }, [rideId]);

  useEffect(() => {
    if (ride?.pickupLocation && ride?.dropoffLocation) {
      fetchDistanceAndDuration(ride.pickupLocation, ride.dropoffLocation);
    }
  }, [ride]);

  const submitRating = async () => {
    if (!rideId || rating === 0) {
      console.error("Ride ID and rating are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(`${API_URL}/api/ride/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rideId, rating, feedback }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit rating");

      setSubmitted(true);
      alert("Rating submitted successfully");
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        console.error("Razorpay SDK failed to load.");
        return;
      }

      // Fetch order ID from backend with Authorization header
      const response = await axios.post(
        `${API_URL}/api/payment/charge`,
        { amount: ride.fare },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { order_id } = response.data;

      const options = {
        key: RAZORPAY_KEY,
        amount: ride.fare * 100,
        currency: "INR",
        name: "Ride Payment",
        description: `Payment for Ride ID: ${rideId}`,
        order_id, // Use order_id from backend
        handler: async (response) => {
          alert("Payment successful!");
          await handleVerifyPayment(response); // Call backend for payment verification
        },
        prefill: { email: "user@example.com" },
        theme: { color: "#6366F1" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error("Error initializing payment:", error);
    }
  };

  const handleVerifyPayment = async (response) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Fixed the recursive call
      const verifyResponse = await axios.post(
        `${API_URL}/api/payment/update`,
        {
          rideId,
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (verifyResponse.data.success) {
        alert("Payment verified successfully!");
        setVerifyPayment(true);
        setShowPaymentModal(false);
      } else {
        console.error("Payment verification failed:", verifyResponse.data);
      }
    } catch (error) {
      console.error("Error verifying payment:", error?.response?.data || error.message);
    }
  };

  const handleHome = () => {
    window.location.href = "/";
  };




  // Loading skeleton animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-indigo-200 rounded w-1/3"></div>
            <div className="h-60 bg-indigo-100 rounded"></div>
            <div className="h-4 bg-indigo-100 rounded w-3/4"></div>
            <div className="h-4 bg-indigo-100 rounded w-1/2"></div>
            <div className="h-4 bg-indigo-100 rounded w-2/3"></div>
            <div className="h-40 bg-indigo-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center"
        >
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ride Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the ride you're looking for.</p>
          <button
            onClick={handleHome}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all duration-300"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  const rideStatusColor = {
    "completed": "bg-green-100 text-green-800",
    "in-progress": "bg-blue-100 text-blue-800",
    "cancelled": "bg-red-100 text-red-800",
    "pending": "bg-yellow-100 text-yellow-800",
  };

  const statusClass = rideStatusColor[ride.status] || "bg-gray-100 text-gray-800";


  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-indigo-600 text-white p-4 shadow-md sticky top-0 z-10"
      >
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Your Ride</h1>
          <button
            onClick={handleHome}
            className="px-4 py-2 bg-white text-indigo-600 rounded-lg shadow hover:bg-indigo-50 transition-all duration-300"
          >
            Home
          </button>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-6 py-3 text-sm font-medium ${activeTab === "details"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
              } transition-all duration-300`}
          >
            Ride Details
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`px-6 py-3 text-sm font-medium ${activeTab === "map"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
              } transition-all duration-300`}
          >
            Map
          </button>
          <button
            onClick={() => setActiveTab("driver")}
            className={`px-6 py-3 text-sm font-medium ${activeTab === "driver"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
              } transition-all duration-300`}
          >
            Driver
          </button>
        </div>

        {/* Ride Card - Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Ride ID & Status Banner */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div>
              <p className="text-xs uppercase font-medium opacity-80">Ride ID</p>
              <p className="font-mono">{ride._id.substring(0, 15)}...</p>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                {ride.status || "Completed"}
              </span>
            </div>
          </div>

          {activeTab === "details" && (
            <div className="p-6">
              {/* Date and Time */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Date & Time</p>
                <p className="text-gray-900 font-medium">
                  {new Date(ride.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>

              {/* Locations */}
              <div className="mb-6 relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200 z-0"></div>

                <div className="relative z-10 flex items-start mb-4">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mr-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Pickup Location</p>
                    <p className="text-gray-900">{ride.pickupLocation}</p>
                  </div>
                </div>

                <div className="relative z-10 flex items-start">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mr-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Dropoff Location</p>
                    <p className="text-gray-900">{ride.dropoffLocation}</p>
                  </div>
                </div>
              </div>

              {/* Ride Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-indigo-50 rounded-lg p-4"
                >
                  <p className="text-xs text-indigo-600 uppercase font-medium mb-1">Distance</p>
                  <p className="text-2xl font-bold text-indigo-800">{distance || "Calculating..."}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-indigo-50 rounded-lg p-4"
                >
                  <p className="text-xs text-indigo-600 uppercase font-medium mb-1">Duration</p>
                  <p className="text-2xl font-bold text-indigo-800">{duration || "Calculating..."}</p>
                </motion.div>
              </div>

              {/* Fare */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-6 text-white mb-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs uppercase font-medium mb-1 opacity-80">Total Fare</p>
                    <p className="text-3xl font-bold">₹{ride.fare}</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-6 py-3 bg-white text-indigo-600 rounded-lg shadow hover:bg-indigo-50 transition-all duration-300"
                  >
                    Pay Now
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === "map" && (
            <div className="p-6">
              <div className={`relative ${mapExpanded ? "h-96" : "h-72"} transition-all duration-500 ease-in-out mb-4`}>
                <iframe
                  width="100%"
                  height="100%"
                  loading="lazy"
                  allowFullScreen
                  className="rounded-lg"
                  src={`https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}&origin=${encodeURIComponent(ride?.pickupLocation || '')}&destination=${encodeURIComponent(ride?.dropoffLocation || '')}&mode=driving`}
                ></iframe>
                <button
                  onClick={() => setMapExpanded(!mapExpanded)}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-white text-indigo-600 rounded-lg shadow hover:bg-indigo-50 transition-all duration-300 flex items-center"
                >
                  {mapExpanded ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                      Collapse
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                      Expand
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-xs text-indigo-600 uppercase font-medium mb-1">Pickup</p>
                  <p className="text-gray-900">{ride.pickupLocation}</p>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-xs text-indigo-600 uppercase font-medium mb-1">Dropoff</p>
                  <p className="text-gray-900">{ride.dropoffLocation}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "driver" && ride.driver && (
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-24 w-24 mb-4"
                >
                  <Image
                    src={ride.driver.profilePicture || "/default-profile.png"}
                    alt="Driver Profile"
                    layout="fill"
                    className="rounded-full object-cover border-4 border-indigo-200"
                  />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900">{ride.driver.name}</h3>
                <h3 className="text-md font-semi-bold text-black">{ride.driver._id}</h3>
                <p className="text-gray-500">Professional Driver</p>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Vehicle Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Model</p>
                    <p className="font-medium">{ride.driver.vehicleDetails?.model || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Color</p>
                    <p className="font-medium">{ride.driver.vehicleDetails?.color || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Seats</p>
                    <p className="font-medium">{ride.driver.vehicleDetails?.seats || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">License Plate</p>
                    <p className="font-medium">{ride.driver.vehicleDetails?.licensePlate || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <button
                  onClick={() => setShowRatingSection(!showRatingSection)}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all duration-300 mb-4"
                >
                  {showRatingSection ? "Hide Rating Section" : "Rate Your Driver"}
                </button>

                {showRatingSection && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-50 rounded-lg p-6"
                  >
                    <p className="text-gray-900 font-medium mb-3">How was your ride with {ride.driver.name}?</p>
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <motion.span
                          key={i}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className={`cursor-pointer text-3xl ${i < rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                          onClick={() => setRating(i + 1)}
                        >
                          ★
                        </motion.span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Leave feedback for your driver..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                    {!submitted ? (
                      <button
                        onClick={submitRating}
                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all duration-300"
                      >
                        Submit Rating
                      </button>
                    ) : (
                      <div className="bg-green-100 text-green-800 rounded-lg p-4 text-center">
                        <svg className="w-6 h-6 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Rating submitted successfully!
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-indigo-600 p-4 text-white">
              <h3 className="text-lg font-bold">Complete Payment</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Amount</p>
                <p className="text-3xl font-bold text-gray-900">₹{ride.fare}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Payment Method</p>
                <div className="border border-gray-200 rounded-lg p-3 flex items-center mb-2">
                  <input
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    className="h-4 w-4 text-indigo-600"
                    checked
                  />
                  <label htmlFor="card" className="ml-2 text-gray-900">Credit/Debit Card</label>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-all duration-300 mb-3"
              >
                Pay Now
              </button>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* Map */}
      <div className="rounded-lg overflow-hidden shadow-md mb-4">
        <iframe
          width="100%"
          height="300"
          loading="lazy"
          allowFullScreen src={`https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}&origin=${encodeURIComponent(ride?.pickupLocation || '')}&destination=${encodeURIComponent(ride?.dropoffLocation || '')}&mode=driving`}
        ></iframe>
      </div>
      <button onClick={handleHome} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-3 rounded-lg transition duration-200 flex items-center justify-center space-x-2">
        <Home className="w-4 h-4" />
        <span>Back to Home</span>
      </button>
    </div>);
};
export default RideDetails;
