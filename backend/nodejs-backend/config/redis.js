const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URI, 
  socket: {
    tls: process.env.REDIS_URI.startsWith("rediss://"), 
  },
});

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Connected to Redis Cloud!");
  } catch (err) {
    console.error("❌ Redis Connection Error:", err);
  }
})();

module.exports = redisClient;
