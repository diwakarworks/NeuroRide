"use client";
import { useEffect, useState } from "react";
import { fetchDashboardStats } from "@/app/lib/api/page";
import AdminLayout from "@/app/components/AdminLayout";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState(null);
  
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }
        
        // Fetch Admin Profile
        const profileRes = await fetch(`${API_URL}/api/admin/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!profileRes.ok) throw new Error("Failed to fetch admin profile");
        
        const profileData = await profileRes.json();
        console.log("Admin Profile:", profileData);
        setAdminProfile(profileData);
        
        // Fetch Dashboard Stats
        const dashboardData = await fetchDashboardStats();
        setStats(dashboardData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminLayout>
        <div className="py-6 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            {adminProfile && (
              <p className="text-gray-600 mb-6">
                Welcome back, {adminProfile.name || "Admin"}
              </p>
            )}
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Total Users</h2>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold mt-4">{stats?.totalUsers || 0}</p>
              <div className="mt-2 text-blue-100">
                <span className="text-sm">Active accounts</span>
              </div>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Active Rides</h2>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <p className="text-4xl font-bold mt-4">{stats?.activeRides || 0}</p>
              <div className="mt-2 text-green-100">
                <span className="text-sm">Currently in progress</span>
              </div>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Total Earnings</h2>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold mt-4">₹{stats?.totalEarnings || 0}</p>
              <div className="mt-2 text-yellow-100">
                <span className="text-sm">Revenue generated</span>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-8 bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
          </motion.div>
        </div>
      </AdminLayout>
    </div>
  );
};

export default AdminDashboard;