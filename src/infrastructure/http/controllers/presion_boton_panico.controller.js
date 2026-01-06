// --- Hexagonal Imports ---
const MysqlAlertaRepository = require('../../adapters/secondary/database/MysqlAlertaRepository');
const CrearAlerta = require('../../../application/use-cases/alerta/CrearAlerta');
const ObtenerAlerta = require('../../../application/use-cases/alerta/ObtenerAlerta');
const ListarAlertas = require('../../../application/use-cases/alerta/ListarAlertas');
const ActualizarAlerta = require('../../../application/use-cases/alerta/ActualizarAlerta');
const EliminarAlerta = require('../../../application/use-cases/alerta/EliminarAlerta');

// --- Dependency Injection ---
const alertaRepository = new MysqlAlertaRepository();
const crearAlertaUseCase = new CrearAlerta(alertaRepository);
const obtenerAlertaUseCase = new ObtenerAlerta(alertaRepository);
const listarAlertasUseCase = new ListarAlertas(alertaRepository);
const actualizarAlertaUseCase = new ActualizarAlerta(alertaRepository);
const eliminarAlertaUseCase = new EliminarAlerta(alertaRepository);

const presionesBotonPanicoCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR UNA NUEVA PRESIÓN DEL BOTÓN DE PÁNICO
presionesBotonPanicoCtl.createPanicButtonPress = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId, ubicacionesClienteId } = req.body;
    logger.info(`[PRESION_BOTON_PANICO] Solicitud de creación (Hexagonal): clienteId=${clienteId}, ubicacionesClienteId=${ubicacionesClienteId}`);

    try {
        const alertaCreada = await crearAlertaUseCase.execute(req.body);

        logger.info(`[PRESION_BOTON_PANICO] Presión de pánico creada exitosamente con ID: ${alertaCreada.id}`);

        res.status(201).json({
            message: 'Presión de botón de pánico registrada exitosamente.',
            presion: {
                id: alertaCreada.id,
                clienteId: alertaCreada.clienteId,
                ubicacionesClienteId: alertaCreada.ubicacionesClienteId,
                marca_tiempo: alertaCreada.marca_tiempo,
                estado: alertaCreada.estado,
                fecha_creacion: alertaCreada.fecha_creacion,
                fecha_modificacion: alertaCreada.fecha_modificacion,
                cliente_info: alertaCreada.cliente_info || {},
                ubicacion_info: alertaCreada.ubicacion_info || {}
            }
        });
    } catch (error) {
        console.error(`[PRESION_BOTON_PANICO] Error al crear la presión del botón de pánico: ${error.message}`);

        if (error.message.includes('requeridos') || error.message.includes('no encontrado') || error.message.includes('inactivo')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al crear la presión del botón de pánico.' });
    }
};

// 2. OBTENER TODAS LAS PRESIONES DEL BOTÓN DE PÁNICO
presionesBotonPanicoCtl.getAllPanicButtonPresses = async (req, res) => {
    const logger = getLogger(req);
    const { incluirEliminados } = req.query;
    logger.info(`[PRESION_BOTON_PANICO] Solicitud de obtención de todas las presiones (Hexagonal).`);

    try {
        const alertas = await listarAlertasUseCase.execute(incluirEliminados === 'true');
        logger.info(`[PRESION_BOTON_PANICO] Se devolvieron ${alertas.length} presiones.`);

        // Map to match exact previous response structure if needed, but Entity is already close
        res.status(200).json(alertas);
    } catch (error) {
        console.error('Error al obtener las presiones del botón de pánico:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 3. OBTENER UNA PRESIÓN DEL BOTÓN DE PÁNICO POR ID
presionesBotonPanicoCtl.getPanicButtonPressById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[PRESION_BOTON_PANICO] Solicitud de obtención de presión por ID (Hexagonal): ${id}`);

    try {
        const alerta = await obtenerAlertaUseCase.execute(id);

        if (!alerta) {
            logger.warn(`[PRESION_BOTON_PANICO] Presión no encontrada: ${id}.`);
            return res.status(404).json({ error: 'Presión del botón de pánico no encontrada.' });
        }

        logger.info(`[PRESION_BOTON_PANICO] Presión encontrada: ${id}.`);
        res.status(200).json(alerta);
    } catch (error) {
        console.error('Error al obtener la presión del botón de pánico:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 4. ACTUALIZAR UNA PRESIÓN DEL BOTÓN DE PÁNICO
presionesBotonPanicoCtl.updatePanicButtonPress = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[PRESION_BOTON_PANICO] Solicitud de actualización (Hexagonal): ${id}`);

    try {
        const alertaActualizada = await actualizarAlertaUseCase.execute(id, req.body);
        logger.info(`[PRESION_BOTON_PANICO] Presión actualizada: ${id}`);

        res.status(200).json({
            message: 'Presión del botón de pánico actualizada correctamente.',
            presion: alertaActualizada
        });

    } catch (error) {
        console.error('Error al actualizar la presión del botón de pánico:', error.message);
        if (error.message === 'Presión del botón de pánico no encontrada.') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 5. ELIMINAR UNA PRESIÓN DEL BOTÓN DE PÁNICO
presionesBotonPanicoCtl.deletePanicButtonPress = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[PRESION_BOTON_PANICO] Solicitud de eliminación (Hexagonal): ${id}`);

    try {
        await eliminarAlertaUseCase.execute(id);
        logger.info(`[PRESION_BOTON_PANICO] Presión marcada como eliminada: ${id}.`);
        res.status(200).json({ message: 'Presión del botón de pánico marcada como eliminado correctamente.' });
    } catch (error) {
        console.error('Error al borrar la presión del botón de pánico:', error.message);
        if (error.message === 'Presión del botón de pánico no encontrada.') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = presionesBotonPanicoCtl;

