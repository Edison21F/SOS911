// clientes_grupos.router.js
const express = require('express');
const router = express.Router();

const {
  AsignarUsuariosGrupo,  
  ListarUsuariosGrupos,  
  ObtenerUsuariosGrupo,  
  ActualizarUsuariosGrupo,   
  EliminarUsuariosGrupo   
} = require('../controllers/clientes_grupos.controller');

// --- Rutas con Nombres de Acción Explícitos ---

// Ruta para crear una nueva relación cliente-grupo
// URL final: POST /clientes_grupos/crear
router.post('/crear', AsignarUsuariosGrupo);

// Ruta para listar todas las relaciones cliente-grupo
// URL final: GET /clientes_grupos/listar
router.get('/listar', ListarUsuariosGrupos);

// Ruta para obtener una relación específica por su ID
// URL final: GET /clientes_grupos/detalle/123
router.get('/detalle/:id', ObtenerUsuariosGrupo);

// Ruta para actualizar una relación por su ID
// URL final: PUT /clientes_grupos/actualizar/123
router.put('/actualizar/:id', ActualizarUsuariosGrupo);

// Ruta para eliminar una relación por su ID
// URL final: DELETE /clientes_grupos/eliminar/123
router.delete('/eliminar/:id', EliminarUsuariosGrupo);

module.exports = router;
