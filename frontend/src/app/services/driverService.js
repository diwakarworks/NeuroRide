import axios from "axios";

export const fetchDrivers = async (pickup, dropoff) => {
  try {
    const res = await axios.get(`http://localhost:8000/find-drivers?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`, {

      headers: { "Content-Type": "application/json" },
    });

  
    const data =  res.data;
    console.log("Fetched drivers:", data);
    return data;
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return { drivers: [] };
  }
};
