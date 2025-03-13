"use server";

 const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchDashboardStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/stats`);
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  
  return res.json();
};
