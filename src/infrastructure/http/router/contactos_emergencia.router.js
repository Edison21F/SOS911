const express = require('express');
const router = express.Router();
const { createContact, getContacts, deleteContact } = require('../controllers/contactos_emergencia.controller');

// POST /contactos_emergencia - Agregar contacto
router.post('/', createContact);

// GET /contactos_emergencia/usuario/:idUsuarioSql - Listar mis contactos
router.get('/usuario/:idUsuarioSql', getContacts);

// DELETE /contactos_emergencia/:id - Eliminar contacto
router.delete('/:id', deleteContact);

module.exports = router;
