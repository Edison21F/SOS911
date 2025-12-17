// contactos_emergencia.model.js (para MongoDB)
const mongoose = require('mongoose');

const contactoEmergenciaSchema = new mongoose.Schema({
    idUsuarioSql: { type: String, required: true }, // Usuario dueño del contacto
    idUsuarioContactoSql: String, // Usuario vinculado (si tiene la app)
    nombre: { type: String, required: true },
    telefono: { type: String, required: true },
    relacion: String, // Padre, Madre, Amigo, etc.
    estado: {
        type: String,
        enum: ['VINCULADO', 'PENDIENTE', 'BLOQUEADO'],
        default: 'PENDIENTE'
    },
    fecha_creacion: { type: Date, default: Date.now },
    fecha_modificacion: { type: Date, default: Date.now }
});

// Modelo 'ContactoEmergencia' -> Colección 'contactosemergencia'
const ContactoEmergencia = mongoose.model('ContactoEmergencia', contactoEmergenciaSchema);

module.exports = ContactoEmergencia;
