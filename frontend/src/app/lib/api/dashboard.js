"use server";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`, 
});


export const fetchDashboardStats = async (token) => {
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  return res.json();
};
