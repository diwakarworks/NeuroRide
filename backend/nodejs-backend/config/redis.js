const { createClient } = require("redis");

const redis = new Redis(process.env.REDIS_URI, {
});

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

redisClient.connect().catch(console.error); 

module.exports = redisClient;
