"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Clock, MapPin, DollarSign, User, Car, Home, CalendarCheck,  CheckCircle, AlertCircle,  } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Skeleton Loading Components
const SkeletonPulse = () => (
  <div className="animate-pulse bg-gray-200 rounded-md h-full w-full"></div>
);

const SkeletonCard = ({ className }) => (
  <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}>
    <div className="p-4 space-y-3">
      <div className="flex items-center space-x-3">
        <div className="rounded-full bg-gray-200 h-12 w-12 animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonMap = () => (
  <div className="bg-white shadow-md p-4 rounded-xl transition-all duration-300">
    <div className="h-[300px] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
      <MapPin className="text-gray-400" size={40} />
    </div>
  </div>
);

const SkeletonLocationInfo = () => (
  <div className="bg-white p-4 shadow-md rounded-lg">
    <div className="flex justify-between items-center mb-3 border-b pb-2">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
    </div>
    <div className="p-3 bg-gray-100 rounded-md space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

const SkeletonButtons = () => (
  <div className="bg-white shadow-md p-4 rounded-xl">
    <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
      <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
      <div className="h-8 bg-gray-200 rounded-full animate-pulse w-40"></div>
      <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
    </div>
  </div>
);

// Part 1: Main Component and State Management
const JourneyPage = () => {
  const { id: rideId } = useParams();
  const [token, setToken] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [rideDetails, setRideDetails] = useState(null);
  const [locationInput, setLocationInput] = useState({ latitude: "", longitude: "" });
  const [riderDetails, setRiderDetails] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [location, setLocation] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rideStatus, setRideStatus] = useState("waiting");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  // Part 2: Authentication and Data Fetching
  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(storedToken);
  }, []);

  useEffect(() => {
    const storedDriverId = localStorage.getItem("driverId");
    if (storedDriverId) {
      setDriverId(storedDriverId);
    }
  }, []);



  useEffect(() => {
    if (!rideId || !token) return;

    const fetchProfileAndRideDetails = async () => {
      try {
        const profileResponse = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDriverProfile(profileResponse.data);

        const ride = profileResponse.data.rides.find((r) => r._id === rideId);
        if (!ride) throw new Error("Ride not found");

        setRideDetails(ride);
        setRideStatus(ride.status);

        if (ride.rider) {
          const riderResponse = await axios.get(`${API_URL}/api/ride/status/${rideId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setRiderDetails(riderResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showNotificationAlert("Failed to load ride data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndRideDetails();
  }, [rideId, token]);




  // Part 3: Location Tracking and Updates
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ latitude: lat, longitude: lng });
          setLatitude(lat);
          setLongitude(lng);

          // Automatically update driver location when it changes
          if (driverId) {
            updateDriverLocation(lat, lng, driverId);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          showNotificationAlert("Location tracking error", "error");
        },
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [driverId]);




  const updateDriverLocation = async (lat, lng, driverId) => {
    if (!lat || !lng || !driverId) {
      console.error("Location data or driver ID missing");
      return;
    }

    try {
      await fetch("http://localhost:8000/api/driver/update-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ driver_id: driverId, latitude: lat, longitude: lng }),
      });

      // After updating location on server, fetch the latest driver location
      fetchDriverLocation();
    } catch (error) {
      console.error("Error updating driver location:", error);
      showNotificationAlert("Failed to update location", "error");
    }
  };




  const fetchDriverLocation = async () => {
    if (!rideId) return;

    setIsRefreshing(true);
    try {
      const response = await fetch(`http://localhost:8000/ride/${rideId}/driver-location`);
      if (!response.ok) throw new Error("Failed to fetch driver location");
      const data = await response.json();
      setDriverLocation(data.location);
    } catch (error) {
      console.error("Error fetching driver location:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial fetch and polling for driver location
  useEffect(() => {
    if (!rideId) return;

    fetchDriverLocation(); // Fetch initially

    const interval = setInterval(fetchDriverLocation, 2000); // Poll every 2s

    return () => clearInterval(interval); // Cleanup on unmount
  }, [rideId]);

  // Part 4: Ride Status Management and ETA Calculation
  useEffect(() => {
    if (!rideDetails?.pickupLocation || !rideDetails?.dropoffLocation || !token) return;

    axios
      .post(
        `${API_URL}/api/ride/distance`,
        { pickup: rideDetails.pickupLocation, dropoff: rideDetails.dropoffLocation },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setEstimatedTime(response.data.duration);
      })
      .catch((error) => {
        console.error("Error fetching estimated time:", error);
        showNotificationAlert("Couldn't calculate ETA", "error");
      });
  }, [rideDetails, token]);




  // Part 5: Helper Functions and Event Handlers
  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setLocation({ latitude: lat, longitude: lng });
          showNotificationAlert("Location updated", "success");
        },
        (error) => {
          console.error("Error getting location:", error);
          showNotificationAlert("Couldn't get location", "error");
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation not supported by this browser.");
      showNotificationAlert("Geolocation not supported", "error");
    }
  };




  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocationInput(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateDriverLocation(
      parseFloat(locationInput.latitude),
      parseFloat(locationInput.longitude),
      driverId
    );
    showNotificationAlert("Location manually updated", "success");
  };






  const handleStartRide = async () => {
    try {
      let storedDriverId = driverId || localStorage.getItem("driverId");
      if (!storedDriverId) {
        showNotificationAlert("Driver ID is missing!", "error");
        return;
      }

      setRideStatus("starting");

      const response = await fetch(`${API_URL}/api/ride/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rideId: rideId, driverId: storedDriverId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error starting ride:", errorData.error);
        setRideStatus("accepted");
        showNotificationAlert("Failed to start ride", "error");
        return;
      }

      const data = await response.json();
      setRideStatus("in_progress");
      showNotificationAlert("Ride started successfully", "success");
    } catch (error) {
      console.error("Error starting ride:", error);
      setRideStatus("accepted");
      showNotificationAlert("Error starting ride", "error");
    }
  };




  const handleCompleteRide = async () => {
    try {
      let storedDriverId = driverId || localStorage.getItem("driverId");
      if (!storedDriverId) {
        showNotificationAlert("Driver ID is missing!", "error");
        return;
      }

      setRideStatus("completing");

      const response = await fetch(`${API_URL}/api/ride/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rideId: rideId, driverId: storedDriverId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error completing ride:", errorData.error);
        setRideStatus("in_progress");
        showNotificationAlert("Failed to complete ride", "error");
        return;
      }

      const data = await response.json();
      setRideStatus("completed");
      showNotificationAlert("Ride completed!", "success");
    } catch (error) {
      console.error("Error completing ride:", error);
      setRideStatus("in_progress");
      showNotificationAlert("Error completing ride", "error");
    }
  };



  const showNotificationAlert = (message, type) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };








  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 bg-gray-50 min-h-screen">
      {/* Notification Alert */}
      {showNotification && (
        <div
          className={`fixed top-4 right-4 p-3 rounded-lg shadow-lg z-50 transform transition-all duration-500 animate-slide-in-right ${notificationType === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
        >
          <div className="flex items-center space-x-2">
            {notificationType === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <p>{notificationMessage}</p>
          </div>
        </div>
      )}

      {/* Driver Profile Card */}
      {loading ? (
        <SkeletonCard className="h-24" />
      ) : (
        <div className="bg-white shadow-md p-5 rounded-xl flex items-center gap-4 animate-fadeIn transition-all duration-300 transform hover:scale-102 hover:shadow-lg">
          <div className="relative">
            <img
              src={driverProfile?.user?.profilePicture || "/default-avatar.png"}
              alt="Driver"
              className="w-16 h-16 rounded-full border-2 border-blue-500 transition-all duration-300"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{driverProfile?.user?.name || "Driver"}</h2>
            <p className="text-gray-600 flex items-center">
              <User size={14} className="mr-1" />
              {driverProfile?.user?.phone || "N/A"}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${rideStatus === "completed" ? "bg-green-100 text-green-800" :
            rideStatus === "in_progress" ? "bg-blue-100 text-blue-800" :
              rideStatus === "starting" || rideStatus === "completing" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
            } animate-pulse-slow`}>
            {rideStatus === "in_progress" ? "In Progress" :
              rideStatus === "completed" ? "Completed" :
                rideStatus === "starting" ? "Starting..." :
                  rideStatus === "completing" ? "Completing..." :
                    "Accepted"}
          </div>
        </div>
      )}

      {/* Ride Details Card */}
      {loading ? (
        <SkeletonCard className="h-48" />
      ) : rideDetails ? (
        <div className="bg-white p-4 rounded-lg shadow-md transition-all duration-300 transform hover:shadow-lg animate-slideUp">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Ride Details</h3>
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="min-w-8 mt-1">
                <MapPin size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">PICK UP</p>
                <p className="text-gray-800 font-medium">{rideDetails.pickupLocation}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="min-w-8 mt-1">
                <MapPin size={16} className="text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">DROP OFF</p>
                <p className="text-gray-800 font-medium">{rideDetails.dropoffLocation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center">
                <DollarSign size={16} className="text-green-500 mr-4" />
                <div>
                  <p className="text-xs text-gray-500">FARE</p>
                  <p className="text-gray-800 font-medium">₹{rideDetails.fare}</p>
                </div>
              </div>

              <div className="flex items-center mt-4">
                <Clock size={16} className="text-purple-500 mr-4" />
                <div>
                  <p className="text-xs text-gray-500">ETA</p>
                  <p className="text-gray-800 font-medium">{estimatedTime || "Calculating..."}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center mt-2">
          <CalendarCheck size={16} className = "text-purple-500 mr-4" />
            {/* Date and Time */}
            <div>
              <p className="text-xs  text-gray-500 uppercase font-medium ">Date & Time</p>
                {new Date(rideDetails.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}

            </div>
            </div>

            {/* Ride ID with faded styling */}
            <p className="text-xs text-gray-400 mt-4">
              Ride ID: {rideDetails._id}
            </p>
          </div>
          ) : (
          <div className="text-center p-6 bg-red-50 text-red-600 rounded-lg animate-pulse">
            <AlertCircle className="mx-auto mb-2" />
            Ride details not found
          </div>
      )}

          {/* Rider Details Card - Simplified */}
          {loading ? (
            <SkeletonCard className="h-24" />
          ) : riderDetails && (
            <div className="bg-white p-4 shadow-md rounded-lg transition-all duration-300 animate-fadeIn">
              <h3 className="text-lg font-semibold flex items-center border-b pb-2 mb-3">
                <User className="mr-2 text-blue-500" size={18} />
                Rider Details
              </h3>
              <p className="text-gray-700">
                <span className="font-semibold">ID:</span> {riderDetails.rider}
              </p>
            </div>
          )}

          {/* Map Section */}
          {loading ? (
            <SkeletonMap />
          ) : (
            <div className="flex flex-col items-center justify-center bg-white shadow-md p-4 rounded-xl transition-all duration-300 animate-zoomIn">
              <iframe
                width="100%"
                height="300"
                loading="lazy"
                allowFullScreen
                className="rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md"
                src={`https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}&origin=${encodeURIComponent(rideDetails?.pickupLocation || '')}&destination=${encodeURIComponent(rideDetails?.dropoffLocation || '')}&mode=driving`}
              ></iframe>
            </div>
          )}

          {/* Location Tracking Card */}
          {loading ? (
            <SkeletonLocationInfo />
          ) : (
            <div className="bg-white p-4 shadow-md rounded-lg transition-all duration-300 animate-fadeIn">
              <h3 className="text-lg font-semibold mb-3 flex items-center border-b pb-2">
                <Car className="mr-2 text-blue-500" size={18} />
                Your Location Tracking
              </h3>

              {location ? (
                <div className="mb-4 p-3 bg-blue-50 rounded-md border-l-4 border-blue-400 transition-all duration-300">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">LATITUDE</p>
                      <p className="text-gray-800 font-mono">{location.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">LONGITUDE</p>
                      <p className="text-gray-800 font-mono">{location.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Automatically updating
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-yellow-50 text-amber-600 rounded-md animate-pulse">
                  <p>Fetching your current location...</p>
                </div>
              )}

              <button
                onClick={getCurrentLocation}
                className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-102 flex items-center justify-center"
                disabled={isRefreshing}
              >
                <MapPin className="mr-2" size={16} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Current Location'}
              </button>
            </div>
          )}

          {/* Ride Control Buttons */}
          {loading ? (
            <SkeletonButtons />
          ) : (
            <div className="bg-white shadow-md p-4 rounded-xl animate-fadeIn transition-all duration-300">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                <button
                  className={`px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-102 flex items-center justify-center ${rideStatus === "in_progress" ? "bg-gray-300 text-gray-600 cursor-not-allowed" :
                    rideStatus === "starting" ? "bg-yellow-400 text-white animate-pulse" :
                      "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  onClick={handleStartRide}
                  disabled={rideStatus === "in_progress" || rideStatus === "starting" || rideStatus === "completed"}
                >
                  <Car className="mr-2" size={16} />
                  {rideStatus === "starting" ? "Starting..." : "Start Ride"}
                </button>

                <div className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
                  <Clock className="text-purple-500 mr-2" size={16} />
                  <p className="text-gray-700 font-medium">ETA: {estimatedTime || "Calculating..."}</p>
                </div>

                <button
                  className={`px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-102 flex items-center justify-center ${rideStatus !== "in_progress" && rideStatus !== "completing" ? "bg-gray-300 text-gray-600 cursor-not-allowed" :
                    rideStatus === "completing" ? "bg-yellow-400 text-white animate-pulse" :
                      "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  onClick={handleCompleteRide}
                  disabled={rideStatus !== "in_progress" && rideStatus !== "completing"}
                >
                  <CheckCircle className="mr-2" size={16} />
                  {rideStatus === "completing" ? "Completing..." : "End Ride"}
                </button>
              </div>
            </div>
          )}

          {/* Driver Location Information */}
          {loading ? (
            <SkeletonLocationInfo />
          ) : (
            <div className="p-4 bg-white rounded-lg shadow-md transition-all duration-300">
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="mr-2 text-red-500" size={18} />
                  Driver Location
                </h3>
                <button
                  onClick={fetchDriverLocation}
                  className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                  disabled={isRefreshing}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {driverLocation ? (
                <div className="p-3 bg-green-50 rounded-md border-l-4 border-green-400">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">LATITUDE</p>
                      <p className="text-gray-800 font-mono">{driverLocation.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">LONGITUDE</p>
                      <p className="text-gray-800 font-mono">{driverLocation.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 text-gray-500 rounded-md animate-pulse">
                  <p>{isRefreshing ? 'Refreshing driver location...' : 'Fetching driver location...'}</p>
                </div>
              )}

              {/* Manual Location Entry Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      id="latitude"
                      name="latitude"
                      value={locationInput.latitude}
                      onChange={handleInputChange}
                      step="any"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter latitude"
                    />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      id="longitude"
                      name="longitude"
                      value={locationInput.longitude}
                      onChange={handleInputChange}
                      step="any"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter longitude"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-102 flex items-center justify-center"
                >
                  <MapPin className="mr-2" size={16} />
                  Update Location Manually
                </button>
              </form>
            </div>
          )}
          <button
            onClick={() => window.location.href = '/'}
            className="fixed bottom-6 right-6 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 z-10"
            aria-label="Go to home"
          >
            <Home size={24} />
          </button>

          {/* CSS for animations */}
          <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulse-slow {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-zoomIn {
         animation: zoomIn 0.5s ease-out;
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite ease-in-out;
}

.animate-slide-in-right {
  animation: slide-in-right 0.5s ease-out;
}
  `}</style>
        </div>
      );
        
}

      export default JourneyPage;