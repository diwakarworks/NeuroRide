"use server"



const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored in localStorage
});

export const fetchUsers = async () => {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const res = await fetch(`${API_URL}/api/admin/users`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};


export const toggleUserStatus = async (id) => {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  await fetch(`${API_URL}/api/admin/users/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  alert("User block status updated!");
  fetchUsers(); 
};

export const verifyDriver = async (id) => {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const res =  fetch(`${API_URL}/api/admin/verify/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return res.data;
};
