const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*', // En producción limitar a dominios confiables
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado por Socket.IO:', socket.id);

        // Unirse a una sala específica (ej: 'user_123')
        socket.on('join', (room) => {
            console.log(`Cliente ${socket.id} uniéndose a la sala: ${room}`);
            socket.join(room);
        });

        // Evento de ubicación en tiempo real (ejemplo base)
        socket.on('updateLocation', (data) => {
            // data debe tener { alertId, location }
            if (data.alertId) {
                // Emitir a la sala de la alerta
                io.to(`alert_${data.alertId}`).emit('locationUpdated', data);
            }
        });

        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io no está inicializado!');
    }
    return io;
};

module.exports = { initSocket, getIo };
