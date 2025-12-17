//grupos.router.js
const express = require('express');
const router = express.Router();

const {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  joinGroup,
  getMembers,
  uploadPhoto
} = require('../controllers/grupos.controller');

// Ruta para crear un nuevo grupo
// URL final: POST /grupos/crear
router.post('/crear', createGroup);

// Ruta para unirse a un grupo por código
// URL final: POST /grupos/unirse
router.post('/unirse', joinGroup);

// Ruta para obtener miembros del grupo
// URL final: GET /grupos/miembros/:id
router.get('/miembros/:id', getMembers);

// Ruta para subir foto de grupo
// URL final: POST /grupos/foto/:id
router.post('/foto/:id', uploadPhoto);

// Ruta para listar todos los grupos
// URL final: GET /grupos/listar
router.get('/listar', getAllGroups);

// Ruta para obtener un grupo específico por su ID
// URL final: GET /grupos/detalle/123
router.get('/detalle/:id', getGroupById);

// Ruta para actualizar un grupo por su ID
// URL final: PUT /grupos/actualizar/123
router.put('/actualizar/:id', updateGroup);

// Ruta para eliminar un grupo por su ID
// URL final: DELETE /grupos/eliminar/123
router.delete('/eliminar/:id', deleteGroup);

module.exports = router;

