"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const PaymentsPage = () => {
    const [rides, setRides] = useState([]);
    const [transactions, setTransactions] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedRide, setSelectedRide] = useState(null);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const fetchRides = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_URL}/api/admin/rides`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRides(response.data);
            } catch (error) {
                console.error("Error fetching rides:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRides();
    }, []);

    const fetchTransactions = async (rideId, driverId) => {
        setLoading(true);
        setAnimate(false);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/api/admin/payments/${driverId}/${rideId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransactions(response.data.data);
            setTimeout(() => setAnimate(true), 100);
        } catch (error) {
            console.error("Error fetching payments:", error);
            setTransactions("No payment data available");
            setTimeout(() => setAnimate(true), 100);
        } finally {
            setLoading(false);
        }
    };

    const handleRideSelect = (e) => {
        const rideId = e.target.value;
        if (!rideId) {
            setSelectedRide(null);
            setTransactions("");
            return;
        }

        const ride = rides.find((r) => r._id === rideId);
        if (!ride) return;

        setSelectedRide(ride);
        fetchTransactions(ride._id, ride.driver?._id);
    };

    const HandleHome = ()  => {
        window.location.href = "/";
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-6xl mx-auto p-6 md:p-8">
                {/* Header with subtle animation */}
                <div className="mb-12 relative">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
                        Payment Management
                    </h2>
                    <div className="h-1 w-24 bg-blue-500 mx-auto mt-4 rounded-full animate-pulse"></div>
                    <p className="text-gray-600 text-center mt-4 max-w-2xl mx-auto">
                        View and manage payment transactions for all rides in the system
                    </p>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 opacity-0 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Rides</p>
                                <p className="text-2xl font-bold text-gray-800">{rides.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Paid Transactions</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {rides.filter(ride => ride.paymentStatus === "paid").length}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Pending Payments</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {rides.filter(ride => ride.paymentStatus !== "paid").length}
                                </p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 transition-all duration-300 hover:shadow-xl">
                    {/* Ride Selection Dropdown with enhanced styling */}
                    <div className="mb-8">
                        <label className="block text-lg font-semibold text-gray-700 mb-3">Select a Ride:</label>
                        <div className="relative">
                            <select
                                className="w-full p-4 pl-6 pr-12 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 appearance-none text-gray-700"
                                onChange={handleRideSelect}
                                disabled={loading && !transactions}
                            >
                                <option value="">-- Choose a Ride --</option>
                                {rides.map((ride, index) => (
                                    <option key={ride._id || index} value={ride._id}>
                                        Ride #{ride._id?.slice(-6)} - Driver {ride.driver?.name || ride.driver?._id?.slice(-6)}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Selected Ride Details */}
                    {selectedRide && (
                        <div className={`mb-8 bg-gray-50 rounded-xl p-6 transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Ride Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600">Ride ID:</p>
                                    <p className="font-medium text-gray-800">{selectedRide._id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Driver:</p>
                                    <p className="font-medium text-gray-800">{selectedRide.driver?.name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Date:</p>
                                    <p className="font-medium text-gray-800">
                                        {selectedRide.createdAt
                                            ? new Date(selectedRide.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : 'Unknown'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Amount:</p>
                                    <p className="font-medium text-gray-800">
                                        ${selectedRide.amount || selectedRide.fare || '0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Transactions */}
                    <div className="relative">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                <p className="mt-4 text-gray-600">Fetching payment data...</p>
                            </div>
                        ) : transactions ? (
                            <div
                                className={`p-6 rounded-xl shadow-md transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                    } ${transactions === "paid"
                                        ? "bg-gradient-to-r from-green-50 to-green-100 border-l-8 border-green-500"
                                        : "bg-gradient-to-r from-red-50 to-red-100 border-l-8 border-red-500"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Status</h3>
                                        <p className="text-lg">
                                            <span
                                                className={`inline-block px-4 py-1 rounded-full font-semibold ${transactions === "paid"
                                                        ? "bg-green-200 text-green-800"
                                                        : "bg-red-200 text-red-800"
                                                    }`}
                                            >
                                                {transactions.toUpperCase()}
                                            </span>
                                        </p>
                                    </div>
                                    <div className={`p-4 rounded-full ${transactions === "paid" ? "bg-green-200" : "bg-red-200"
                                        }`}>
                                        {transactions === "paid" ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-gray-700">
                                        {transactions === "paid"
                                            ? "This payment has been successfully processed and confirmed."
                                            : "This payment is pending by the rider."
                                        }
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="bg-gray-100 inline-block p-5 rounded-full mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-lg">Select a ride to view payment details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add global style for custom animations */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-in-out forwards;
                    animation-delay: 0.3s;
                }
            `}</style>
            <div className="flex justify-center">
            <button className="mt-2 mb-10 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 "onClick={HandleHome}>
                Home
            </button>
            </div>
        </div>
    );
};

export default PaymentsPage;