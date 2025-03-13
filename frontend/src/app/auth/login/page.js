"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // Ensure this is correctly set in .env

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();


  



  const fetchAdminProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
  
    const res = await fetch(`${API_URL}/api/admin/profile`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!res.ok) throw new Error("Failed to fetch admin profile");
  
    return res.json();
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
  
      const data = response.data;
      if (response.status !== 200) throw new Error(data.message || "Invalid credentials");

      if (data.isBlocked) {
        setError("Your account has been blocked.Please contact support");
        return;
      }


      alert("Login Successful!");
      localStorage.setItem("token", data.token);
  
      if (data.role === "admin") {
        try {
          const adminProfile = await fetchAdminProfile(); // Fetch admin details
          localStorage.setItem("adminData", JSON.stringify(adminProfile)); // Store admin profile
        } catch (error) {
          console.error("Error fetching admin profile:", error);
        }
      }
  
      // Redirect based on user role
      if (data.role === "rider") {
        router.push("/rider/dashboard");
      } else if (data.role === "driver") {
        router.push("/driver/home");
      } else if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/auth/profile"); // Fallback
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };
  

  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-700 to-yellow-500 p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl overflow-hidden flex">
        {/* Left Side (Welcome Message) */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-1/2 h-96 bg-teal-900 text-white p-10 flex flex-col justify-center items-center"
        >
          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-gray-200 mb-6 text-center">
            Provide your personal details to use all features.
          </p>
        </motion.div>

        {/* Right Side (Login Form) */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-1/2 p-10 flex flex-col justify-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Login</h2>
          <form className="space-y-4" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-600 transition"
            >
              LOGIN
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
