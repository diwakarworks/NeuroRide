const { createClient } = require("redis");

const redisClient = createClient({
  socket: {
    host: "127.0.0.1",
    port: 17155,
  },
});

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

redisClient.connect().catch(console.error); 

module.exports = redisClient;
