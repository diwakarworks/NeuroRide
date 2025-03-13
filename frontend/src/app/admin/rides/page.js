"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Home } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const RidesPage = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // Track which ride is updating

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/admin/rides`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Get updated rides data from localStorage or use the fetched data
        const localUpdatedRides = JSON.parse(localStorage.getItem("updatedRides") || "[]");
        const updatedRideIds = new Set(localUpdatedRides);

        // Apply the balanceUpdated flag based on localStorage
        const processedRides = response.data.map(ride => ({
          ...ride,
          balanceUpdated: updatedRideIds.has(ride._id) ? true : ride.balanceUpdated || false
        }));

        setRides(processedRides);
      } catch (error) {
        console.error("Error fetching rides:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  // Function to update driver balance
  const handleUpdateBalance = async (rideId) => {
    setUpdating(rideId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/admin/update-driver-balance`,
        { rideId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update UI to reflect balance change
      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride._id === rideId ? { ...ride, balanceUpdated: true } : ride
        )
      );

      // Store the updated ride ID in localStorage
      const updatedRides = JSON.parse(localStorage.getItem("updatedRides") || "[]");
      if (!updatedRides.includes(rideId)) {
        updatedRides.push(rideId);
        localStorage.setItem("updatedRides", JSON.stringify(updatedRides));
      }

      // Show toast notification instead of alert
      showNotification("Driver balance updated successfully!", "success");
    } catch (error) {
      console.error("Error updating balance:", error);
      showNotification("Failed to update balance.", "error");
    } finally {
      setUpdating(null);
    }
  };

  // Toast notification function
  const showNotification = (message, type) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-500 transform translate-y-0 z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white`;
    notification.textContent = message;

    // Add to DOM
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
      notification.style.opacity = '1';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateY(-20px)';
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
  };

  // Skeleton loader for ride cards
  const RideCardSkeleton = () => (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white shadow-lg rounded-2xl p-5">
          <div className="mb-2">
            <Skeleton height={24} width={180} />
          </div>
          <div className="space-y-2 mb-3">
            <Skeleton height={18} width={200} />
            <Skeleton height={18} width={160} />
            <Skeleton height={18} width={100} />
          </div>
          <div className="flex space-x-2 mb-3">
            <Skeleton height={28} width={90} borderRadius={20} />
            <Skeleton height={28} width={80} borderRadius={20} />
          </div>
          <Skeleton height={16} width={150} />
          <div className="mt-3">
            <Skeleton height={40} width={130} borderRadius={8} />
          </div>
        </div>
      ))}
    </>
  );

  const StatusBadge = ({ status, type }) => {
    let bgColor, textColor, icon;

    if (type === 'status') {
      if (status === 'completed') {
        bgColor = 'bg-green-200';
        textColor = 'text-green-800';
        icon = '✓';
      } else {
        bgColor = 'bg-yellow-200';
        textColor = 'text-yellow-800';
        icon = '⏳';
      }
    } else if (type === 'payment') {
      if (status === 'paid') {
        bgColor = 'bg-green-300';
        textColor = 'text-green-800';
        icon = '💵';
      } else {
        bgColor = 'bg-red-300';
        textColor = 'text-red-800';
        icon = '⚠️';
      }
    }

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full ${bgColor} ${textColor} text-sm font-semibold transition-all duration-300 hover:shadow-md`}>
        <span className="mr-1">{icon}</span> {status.toUpperCase()}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <h2 className="text-3xl font-bold text-gray-800">
            Rides Overview
          </h2>
          <div className="absolute -right-10 top-0 text-4xl animate-bounce">
            🚖
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <RideCardSkeleton />
        </div>
      ) : rides.length === 0 ? (
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No rides found</h3>
          <p className="text-gray-500">There are no rides available in the system yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rides.map((ride) => (
            <div
              key={ride._id}
              className="bg-white shadow-lg rounded-2xl p-5 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl border-b-4 border-transparent hover:border-blue-500"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                  <span className="text-blue-600 mr-2">{ride.driver.name}</span>
                  <span className="text-2xl">🚘</span>
                </h3>
                <div className="flex space-x-1">
                  <StatusBadge status={ride.status} type="status" />
                  <StatusBadge status={ride.paymentStatus} type="payment" />
                </div>
              </div>

              <div className="space-y-2 my-4">
                <div className="flex items-start">
                  <div className="text-lg mr-2 text-blue-500">📍</div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">From</p>
                    <p className="text-gray-700">{ride.pickupLocation}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-lg mr-2 text-green-500">🎯</div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">To</p>
                    <p className="text-gray-700">{ride.dropoffLocation}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-lg mr-2 text-yellow-500">💰</div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Fare</p>
                    <p className="text-gray-700 font-bold">₹{ride.fare.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 flex items-center">
                <span className="mr-1">🕒</span>
                {new Date(ride.createdAt).toLocaleString()}
              </p>

              {/* Update Balance Button - with animation and persistence */}
              {ride.paymentStatus === 'paid' && !ride.balanceUpdated && (
                <button
                  className={`mt-4 w-full px-4 py-3 rounded-lg text-white font-semibold transition-all duration-300 transform hover:translate-y-[-2px] ${updating === ride._id
                    ? "bg-blue-400 cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                    }`}
                  onClick={() => handleUpdateBalance(ride._id)}
                  disabled={updating === ride._id}
                >
                  {updating === ride._id ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Update Driver Balance"
                  )}
                </button>
              )}

              {/* Message when balance is already updated */}
              {ride.paymentStatus === 'paid' && ride.balanceUpdated && (
                <div className="mt-4 px-4 py-3 bg-gray-100 rounded-lg text-gray-700 text-center font-medium text-sm">
                  ✓ Driver balance already updated
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => window.location.href = '/'}
        className="fixed bottom-6 right-6 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 z-10"
        aria-label="Go to home"
      >
        <Home size={24} />
      </button>
    </div>
  );
};

export default RidesPage;