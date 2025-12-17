const mongoose = require('mongoose');
const { Schema } = mongoose;

const ubicacionSchema = new Schema({
    idClienteSql: { type: Number, required: true, unique: true }, // Referencia al ID SQL del cliente
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitud, latitud]
            required: true
        }
    },
    // Metadatos extra útiles para filtrar
    estado: { type: String, default: 'activo' },
    ultima_actualizacion: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Índice geoespacial para búsquedas rápidas "cerca de"
ubicacionSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('UbicacionMongo', ubicacionSchema);
