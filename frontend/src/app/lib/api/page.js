"use server"

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored in localStorage
});



export const fetchDashboardStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }

  return res.json();
};

export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};


export const toggleUserStatus = async (id) => {
  await fetch(`${API_URL}/api/admin/users/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  alert("User block status updated!");
  fetchUsers(); 
};

export const verifyDriver = async (id) => {
  const res =  fetch(`${API_URL}/api/admin/verify/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return res.data;
};
