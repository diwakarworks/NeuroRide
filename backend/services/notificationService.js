exports.sendRideUpdate = (io, data) => {
    io.emit('rideUpdates', data);
};

exports.sendDriverLocation = (io, data) => {
    io.emit('driverLocation', data);
};

exports.sendRideStatus = (io, data) => {
    io.emit('rideStatus', data);
};
