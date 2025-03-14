

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;



export const fetchUsers = async (token)) => {
  const res = await fetch(`${API_URL}/api/admin/users`, {
     headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,  
    },  
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  return res.json();
};

export const toggleUserStatus = async (id,token) => {
  const res = await fetch(`${API_URL}/api/admin/users/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
  });

  if (!res.ok) {
    throw new Error("Failed to update user status");
  }
  return res.json();
};

export const verifyDriver = async (id,token) => {
  const res = await fetch(`${API_URL}/api/admin/verify/${id}`, {
    method: "PATCH",
     headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
  });

  return res.json();
};
