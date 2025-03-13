"use server";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchDashboardStats = async (token) => {
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
};
