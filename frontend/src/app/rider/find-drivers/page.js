"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchDrivers } from "@/app/services/driverService";
import axios from "axios";
import { FaCar, FaMotorcycle, FaTaxi, FaTruck } from "react-icons/fa";
import { motion } from "framer-motion";
import { Suspense } from "react";


const FindDrivers = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FindDriversContent />
    </Suspense>
  );
};



const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const FindDriversContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pickup = searchParams.get("pickup");
  const dropoff = searchParams.get("dropoff");
  const [rider, setRider] = useState();
  const [drivers, setDrivers] = useState([]);
  const [fares, setFares] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setRider(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (pickup && dropoff) {
      setLoading(true);
      fetchDrivers(pickup, dropoff).then((data) => {
        setDrivers(data.drivers);
        data.drivers.forEach((driver) => {
          fetchFareEstimate(pickup, dropoff, driver.vehicle_type, driver.id);
        });
        setLoading(false);
      });
    }
  }, [pickup, dropoff]);

  const fetchFareEstimate = async (origin, destination, vehicleType, driverId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/payment/estimate?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&vehicleType=${encodeURIComponent(vehicleType)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFares((prev) => ({ ...prev, [driverId]: res.data.estimatedFare }));
    } catch (error) {
      console.error("Error fetching fare estimate", error);
    }
  };

  const handleSelectDriver = async (driver) => {
    try {
      const token = localStorage.getItem("token");
      const riderId = rider || localStorage.getItem("userId");

      if (!riderId) {
        console.error("User ID not found");
        return;
      }

      await axios.post(
        `${API_URL}/api/ride/request`,
        {
          rider: riderId,
          pickupLocation: pickup,
          dropoffLocation: dropoff,
          driverId: driver._id,
          fare: fares[driver.id] || 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push(
        `/rider/confirm-ride?pickup=${pickup}&dropoff=${dropoff}&driverId=${driver.id}&fare=${fares[driver.id]}`
      );
    } catch (error) {
      console.error("Error requesting ride", error);
    }
  };

  const renderVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case 'sedan':
        return <FaCar className="text-blue-600 text-2xl" />;
      case 'bike':
        return <FaMotorcycle className="text-green-600 text-2xl" />;
      case 'suv':
        return <FaTruck className="text-red-600 text-2xl" />;
      case 'hatchback':
        return <FaCar className="text-yellow-600 text-2xl" />;
      case 'auto':
        return <FaTaxi className="text-orange-600 text-2xl" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto mt-24 p-6 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Drivers</h1>
        <div className="flex space-x-3 text-gray-600">
          <p>From: <span className="font-semibold text-gray-800">{pickup}</span></p>
          <p>To: <span className="font-semibold text-gray-800">{dropoff}</span></p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : drivers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No drivers available</h3>
          <p className="text-gray-600">Please try again later or change your location</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver, index) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className="p-6 border border-gray-200 rounded-xl bg-white shadow-md transition-all cursor-pointer overflow-hidden"
              onClick={() => handleSelectDriver(driver)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{driver.name}</h3>
                  <div className="flex items-center mt-2 space-x-2">
                    {renderVehicleIcon(driver.vehicle_type)}
                    <p className="text-gray-700 capitalize font-medium">{driver.vehicle_type}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-50">
                  {renderVehicleIcon(driver.vehicle_type)}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-600">Distance</p>
                  <p className="font-medium text-gray-800">
                    {isNaN(driver.distance_km) ? "Not available" : `${(driver.distance_km * 1000).toFixed(2)}m`}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Fare</p>
                  {fares[driver.id] ? (
                    <p className="text-xl font-bold text-blue-600">₹{fares[driver.id]}</p>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                      <span className="text-gray-500 text-sm ml-1">Calculating...</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Select Driver
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindDrivers;
