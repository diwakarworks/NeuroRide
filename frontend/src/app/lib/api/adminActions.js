"use server";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`, 
});


export const fetchUsers = async (token) => {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    headers: getAuthHeaders();   
  });

  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export const toggleUserStatus = async (id, token) => {
  const res = await fetch(`${API_URL}/api/admin/users/${id}/status`, {
    method: "PATCH",
   headers: getAuthHeaders(); 
  });

  if (!res.ok) throw new Error("Failed to update user status");
  return res.json();
};

export const verifyDriver = async (id, token) => {
  const res = await fetch(`${API_URL}/api/admin/verify/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(); 
  });

  if (!res.ok) throw new Error("Failed to verify driver");
  return res.json();
};
