// envio.router.js
const express = require("express");
const router = express.Router();

const isLoggedIn = require('../../../application/router/auth');
const { sendUsuario, sendArchivos, sendCliente } = require('../controllers/guardadoArchivos');

router.post('/imagenUsuario', isLoggedIn, sendUsuario);
router.post('/archivosUsuario', isLoggedIn, sendArchivos);
router.post('/imagenCliente', isLoggedIn, sendCliente);

module.exports = router;

