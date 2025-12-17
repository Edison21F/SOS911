const express = require('express');
const router = express.Router();
const { createAlert, updateAlertStatus, getActiveAlerts, getNearbyAlerts, getAlertHistory, getNotifications, syncOfflineAlerts, respondToAlert } = require('../controllers/alertas.controller');

// POST /alertas - Crear nueva emergencia
router.post('/', createAlert);

// POST /alertas/sync-offline - Sincronizar alertas guardadas localmente
router.post('/sync-offline', syncOfflineAlerts);

// GET /alertas/cercanas - Obtener alertas cercanas
router.get('/cercanas', getNearbyAlerts);

// PATCH /alertas/:id/estado - Actualizar estado (Atendida, Cerrada, etc)
router.patch('/:id/estado', updateAlertStatus);

// GET /alertas/usuario/:idUsuarioSql - Mis alertas activas
router.get('/usuario/:idUsuarioSql', getActiveAlerts);

// GET /alertas/historial/:idUsuarioSql - Historial completo de mis alertas
router.get('/historial/:idUsuarioSql', getAlertHistory);

// GET /alertas/notificaciones/:idUsuarioSql - Obtener notificaciones recibidas
router.get('/notificaciones/:idUsuarioSql', getNotifications);

module.exports = router;
