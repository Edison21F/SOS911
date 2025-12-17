// alertas.model.js (para MongoDB)
const mongoose = require('mongoose');

const alertaSchema = new mongoose.Schema({
    idUsuarioSql: { type: String, required: true }, // Referencia al ID SQL del usuario
    tipo: {
        type: String,
        enum: ['MEDICA', 'PELIGRO', 'INCENDIO', 'TRANSITO', 'PREVENTIVA'],
        required: true
    },
    prioridad: {
        type: String,
        enum: ['CRITICA', 'ALTA', 'MEDIA', 'BAJA', 'INFORMÁTIVA'],
        required: true
    },
    estado: {
        type: String,
        enum: ['CREADA', 'NOTIFICADA', 'ATENDIDA', 'ESCALADA', 'CERRADA', 'CANCELADA'],
        default: 'CREADA'
    },
    emitida_offline: { type: Boolean, default: false },
    location: { // GeoJSON para indexado espacial
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitud, latitud]
    },
    ubicacion: { // Mantener por compatibilidad con frontend actual si es necesario, o migrar
        latitud: { type: Number, required: true },
        longitud: { type: Number, required: true },
        direccion_aproximada: String
    },
    detalles: String, // Mensaje opcional: "No puedo hablar", etc.
    contactos_notificados: [{
        idContactoEmergencia: String, // Referencia al documento de contacto o ID SQL
        estado_notificacion: { type: String, enum: ['ENVIADA', 'RECIBIDA', 'LEIDA', 'FALLIDA'], default: 'ENVIADA' },
        fecha_notificacion: { type: Date, default: Date.now }
    }],
    fecha_creacion: { type: Date, default: Date.now },
    fecha_cierre: Date,
    historial_estados: [{
        estado: String,
        fecha: { type: Date, default: Date.now },
        comentario: String
    }]
});

// Modelo 'Alerta' -> Colección 'alertas'
const Alerta = mongoose.model('Alerta', alertaSchema);

// Índice geoespacial para búsquedas "alertas cerca de mí"
alertaSchema.index({ location: '2dsphere' });

module.exports = Alerta;
