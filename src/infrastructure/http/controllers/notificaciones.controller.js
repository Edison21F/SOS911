// --- Hexagonal Imports ---
const MysqlNotificacionRepository = require('../../adapters/secondary/database/MysqlNotificacionRepository');
const CrearNotificacion = require('../../../application/use-cases/notificacion/CrearNotificacion');
const ListarNotificaciones = require('../../../application/use-cases/notificacion/ListarNotificaciones');
const ObtenerNotificacion = require('../../../application/use-cases/notificacion/ObtenerNotificacion');
const ActualizarNotificacion = require('../../../application/use-cases/notificacion/ActualizarNotificacion');
const EliminarNotificacion = require('../../../application/use-cases/notificacion/EliminarNotificacion');

// --- Dependency Injection ---
const notificacionRepository = new MysqlNotificacionRepository();
const crearNotificacionUseCase = new CrearNotificacion(notificacionRepository);
const listarNotificacionesUseCase = new ListarNotificaciones(notificacionRepository);
const obtenerNotificacionUseCase = new ObtenerNotificacion(notificacionRepository);
const actualizarNotificacionUseCase = new ActualizarNotificacion(notificacionRepository);
const eliminarNotificacionUseCase = new EliminarNotificacion(notificacionRepository);

const notificacionesCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR UNA NUEVA NOTIFICACIÓN
notificacionesCtl.createNotification = async (req, res) => {
    const logger = getLogger(req);
    const { presionesBotonPanicoId, clienteId } = req.body;
    logger.info(`[NOTIFICACIONES] Solicitud de creación (Hexagonal): presionesBotonPanicoId=${presionesBotonPanicoId}, clienteId=${clienteId}`);

    try {
        const notificacionCreada = await crearNotificacionUseCase.execute(req.body);
        logger.info(`[NOTIFICACIONES] Notificación creada exitosamente con ID: ${notificacionCreada.id}`);

        res.status(201).json({
            message: 'Notificación registrada exitosamente.',
            notificacion: notificacionCreada
        });
    } catch (error) {
        console.error(`[NOTIFICACIONES] Error al crear la notificación: ${error.message}`);
        if (error.message.includes('requeridos') || error.message.includes('no encontrado') || error.message.includes('inactivo')) {
            return res.status(400).json({ error: error.message }); // 400 for bad request or not found dep
            // Note: Original returned 404 for dependencies not found. 
            // Here we might return 400 or handle error message specifically.
            // If the error message says "no encontrado", maybe 404 is better?
            // But usually validation errors are 400. Let's stick to 400 or generic error handler.
            // Actually, if dependency is missing, it's a client error (data integrity).
        }
        if (error.message.includes('Cliente no encontrado') || error.message.includes('Presión del botón')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al crear la notificación.' });
    }
};

// 2. OBTENER TODAS LAS NOTIFICACIONES
notificacionesCtl.getAllNotifications = async (req, res) => {
    const logger = getLogger(req);
    const { incluirEliminados } = req.query;
    logger.info(`[NOTIFICACIONES] Solicitud de obtención de todas las notificaciones (incluirEliminados: ${incluirEliminados}) (Hexagonal)`);

    try {
        const notificaciones = await listarNotificacionesUseCase.execute(incluirEliminados === 'true');
        logger.info(`[NOTIFICACIONES] Se devolvieron ${notificaciones.length} notificaciones.`);
        res.status(200).json(notificaciones);
    } catch (error) {
        console.error('Error al obtener las notificaciones:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener las notificaciones.' });
    }
};

// 3. OBTENER UNA NOTIFICACIÓN POR ID
notificacionesCtl.getNotificationById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[NOTIFICACIONES] Solicitud de obtención de notificación por ID (Hexagonal): ${id}`);

    try {
        const notificacion = await obtenerNotificacionUseCase.execute(id);

        if (!notificacion) {
            logger.warn(`[NOTIFICACIONES] Notificación no encontrada o eliminada con ID: ${id}.`);
            return res.status(404).json({ error: 'Notificación no encontrada o eliminada.' });
        }

        logger.info(`[NOTIFICACIONES] Notificación encontrada con ID: ${id}.`);
        res.status(200).json(notificacion);
    } catch (error) {
        console.error('Error al obtener la notificación:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener la notificación.' });
    }
};

// 4. ACTUALIZAR UNA NOTIFICACIÓN
notificacionesCtl.updateNotification = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[NOTIFICACIONES] Solicitud de actualización de notificación con ID (Hexagonal): ${id}`);

    try {
        const notificacionActualizada = await actualizarNotificacionUseCase.execute(id, req.body);
        logger.info(`[NOTIFICACIONES] Notificación actualizada con ID: ${id}`);

        res.status(200).json({
            message: 'Notificación actualizada correctamente.',
            notificacion: notificacionActualizada
        });

    } catch (error) {
        console.error('Error al actualizar la notificación:', error.message);
        if (error.message.includes('no proporcionaron campos')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('no encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al actualizar la notificación.' });
    }
};

// 5. ELIMINAR UNA NOTIFICACIÓN
notificacionesCtl.deleteNotification = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[NOTIFICACIONES] Solicitud de eliminación lógica de notificación con ID (Hexagonal): ${id}`);

    try {
        await eliminarNotificacionUseCase.execute(id);
        logger.info(`[NOTIFICACIONES] Notificación marcada como eliminada: id=${id}.`);
        res.status(200).json({ message: 'Notificación marcada como eliminada correctamente.' });
    } catch (error) {
        console.error('Error al borrar la notificación:', error.message);
        if (error.message.includes('no encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al borrar la notificación.' });
    }
};

module.exports = notificacionesCtl;

