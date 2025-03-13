const { Server } = require('socket.io');

const initializeSockets = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        transports: ["socket", "polling"],
    });
    

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('rideUpdate', (data) => {
            io.emit('rideUpdates', data);
        });

        socket.on('paymentStatus', (data) => {
            io.emit('paymentStatus', data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

module.exports = initializeSockets;
