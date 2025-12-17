// grupos.model.js (para MongoDB)
const mongoose = require('mongoose');

const gruposMongoSchema = new mongoose.Schema({
    idGrupoSql: String,
    descripcion: String,
    imagen: String, // URL/path of group image 
    estado: String,
    fecha_creacion: String,
    fecha_modificacion: String
});

// Modelo 'Grupo' (singular) -> Colección 'grupos' (plural)
const Grupo = mongoose.model('Grupo', gruposMongoSchema);

module.exports = Grupo;

