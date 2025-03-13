require('dotenv').config();
const cors = require('cors');
const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const initializeSocket = require('./config/socket');
const authRoutes  = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const rideRoutes = require('./routes/rideRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());



const server = http.createServer(app);
const io = initializeSocket(server);

app.set("socket.io", io);

initializeSocket(server);

app.use('/api/auth',authRoutes);

app.use('/api/payment', paymentRoutes);

app.use('/api/ride', rideRoutes);

app.use('/api/admin',adminRoutes);

const PORT = process.env.PORT || 4500;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
