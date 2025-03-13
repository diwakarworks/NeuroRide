const axios = require("axios");

const vehicleMultipliers = {
    bike:0.2,
    auto: 0.8, 
    sedan: 1.2,
    suv: 1.5,  
    hatchback:1.7 
};

const estimateFare = async (req, res) => {
    try {
        const { origin, destination, vehicleType } = req.query;

        if (!origin || !destination || !vehicleType) {
            return res.status(400).json({ error: "Origin, destination, and vehicleType are required." });
        }

        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

        const response = await axios.get(url);
        const data = response.data;

        if (data.status !== "OK" || data.rows[0].elements[0].status !== "OK") {
            return res.status(400).json({ error: "Invalid locations or unable to fetch distance" });
        }

        const distanceInMeters = data.rows[0].elements[0].distance.value;
        const distanceInKm = distanceInMeters / 1000;

        const baseFare = 50; 
        const perKmRate = 20;

        // Use vehicle multiplier
        const vehicleMultiplier = vehicleMultipliers[vehicleType.toLowerCase()] || 1;

        const estimatedFare = (baseFare + distanceInKm * perKmRate) * vehicleMultiplier;

        res.json({ origin, destination, vehicleType, estimatedFare: Math.round(estimatedFare) });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { estimateFare };
