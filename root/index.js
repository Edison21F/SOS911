const app = require('./app');
const http = require('http');
const { initSocket } = require('../src/infrastructure/lib/socket');

const port = app.get('port');

// Crear servidor HTTP explícitamente para Socket.IO
const server = http.createServer(app);

// Inicializar Socket.IO
const io = initSocket(server);
app.set('io', io); // Hacer io disponible en req.app.get('io')

server.listen(port, () => {
    console.log(`El servidor está escuchando en el puerto ${port}`);
});