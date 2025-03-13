"use server";

export const fetchDashboardStats = async () => {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  const res = await fetch(`${API_URL}/api/admin/dashboard-stats`);
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  
  return res.json();
};
