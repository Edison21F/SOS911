// --- Hexagonal Imports ---
const MysqlMongoServicioEmergenciaRepository = require('../../adapters/secondary/database/MysqlMongoServicioEmergenciaRepository');

const CrearServicioEmergencia = require('../../../application/use-cases/servicio_emergencia/CrearServicioEmergencia');

const ListarServiciosEmergencia = require('../../../application/use-cases/servicio_emergencia/ListarServiciosEmergencia');
const ObtenerServicioEmergencia = require('../../../application/use-cases/servicio_emergencia/ObtenerServicioEmergencia');
const ActualizarServicioEmergencia = require('../../../application/use-cases/servicio_emergencia/ActualizarServicioEmergencia');
const EliminarServicioEmergencia = require('../../../application/use-cases/servicio_emergencia/EliminarServicioEmergencia');

// --- Dependency Injection ---
const servicioRepository = new MysqlMongoServicioEmergenciaRepository();
const crearServicioUseCase = new CrearServicioEmergencia(servicioRepository);
const listarServiciosUseCase = new ListarServiciosEmergencia(servicioRepository);
const obtenerServicioUseCase = new ObtenerServicioEmergencia(servicioRepository);
const actualizarServicioUseCase = new ActualizarServicioEmergencia(servicioRepository);
const eliminarServicioUseCase = new EliminarServicioEmergencia(servicioRepository);

const serviciosEmergenciaCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR SERVICIO
serviciosEmergenciaCtl.createEmergencyService = async (req, res) => {
    const logger = getLogger(req);
    const { nombre, usuarioId } = req.body;
    logger.info(`[SERVICIOS_EMERGENCIA] Creación (Hexagonal): nombre=${nombre}, usuarioId=${usuarioId}`);

    try {
        const nuevoServicio = await crearServicioUseCase.execute(req.body);

        res.status(201).json({
            message: 'Servicio de emergencia creado exitosamente.',
            servicioId: nuevoServicio.id,
            servicio: nuevoServicio // Optional return full object
        });
    } catch (error) {
        logger.error(`[SERVICIOS_EMERGENCIA] Error al crear: ${error.message}`);

        if (error.message.includes('obligatorios')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('|409')) {
            return res.status(409).json({ message: error.message.replace('|409', '') });
        }
        // Handle FK error specifically if possible or generic
        if (error.message.includes('foreign key') || error.message.includes('usuario no existe')) {
            return res.status(400).json({ message: 'El usuario asociado no existe o no está activo.' });
        }

        res.status(500).json({ error: 'Error interno del servidor al crear el servicio de emergencia.' });
    }
};

// 2. LISTAR SERVICIOS
serviciosEmergenciaCtl.getAllEmergencyServices = async (req, res) => {
    const logger = getLogger(req);
    const { incluirEliminados } = req.query;
    logger.info(`[SERVICIOS_EMERGENCIA] Listar (Hexagonal). incluirEliminados=${incluirEliminados}`);

    try {
        const servicios = await listarServiciosUseCase.execute({}, incluirEliminados === 'true');
        logger.info(`[SERVICIOS_EMERGENCIA] Se devolvieron ${servicios.length} servicios.`);
        res.status(200).json(servicios);
    } catch (error) {
        logger.error('Error al obtener todos los servicios de emergencia:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener servicios de emergencia.' });
    }
};

// 3. OBTENER SERVICIO POR ID
serviciosEmergenciaCtl.getEmergencyServiceById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[SERVICIOS_EMERGENCIA] Obtener por ID (Hexagonal): ${id}`);

    try {
        const servicio = await obtenerServicioUseCase.execute(id);

        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado o eliminado.' });
        }

        res.status(200).json(servicio);
    } catch (error) {
        logger.error('Error al obtener el servicio de emergencia:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener servicios de emergencia.' });
    }
};

// 4. ACTUALIZAR SERVICIO
serviciosEmergenciaCtl.updateEmergencyService = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[SERVICIOS_EMERGENCIA] Actualizar (Hexagonal): id=${id}`);

    try {
        await actualizarServicioUseCase.execute(id, req.body);

        // Fetch updated to return standard response if needed, or just message plus entity
        // The original controller returned full object.
        const updatedService = await obtenerServicioUseCase.execute(id);

        res.status(200).json({
            message: 'Servicio de emergencia actualizado correctamente.',
            servicio: updatedService
        });
    } catch (error) {
        logger.error('Error al actualizar el servicio de emergencia:', error);

        if (error.message.includes('|409')) {
            return res.status(409).json({ message: error.message.replace('|409', '') });
        }
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Error interno del servidor al actualizar el servicio de emergencia.' });
    }
};

// 5. ELIMINAR SERVICIO
serviciosEmergenciaCtl.deleteEmergencyService = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[SERVICIOS_EMERGENCIA] Eliminar (Hexagonal): id=${id}`);

    try {
        await eliminarServicioUseCase.execute(id);
        res.status(200).json({ message: 'Servicio de emergencia marcado como eliminado exitosamente.' });
    } catch (error) {
        logger.error('Error al eliminar el servicio de emergencia:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al eliminar el servicio de emergencia.' });
    }
};

module.exports = serviciosEmergenciaCtl;
