// --- Hexagonal Imports ---
const MysqlEvaluacionSituacionRepository = require('../../adapters/secondary/database/MysqlEvaluacionSituacionRepository');
const MysqlNotificacionRepository = require('../../adapters/secondary/database/MysqlNotificacionRepository');
const CrearEvaluacionSituacion = require('../../../../application/use-cases/evaluacion_situacion/CrearEvaluacionSituacion');
const ListarEvaluacionesSituaciones = require('../../../../application/use-cases/evaluacion_situacion/ListarEvaluacionesSituaciones');
const ObtenerEvaluacionSituacion = require('../../../../application/use-cases/evaluacion_situacion/ObtenerEvaluacionSituacion');
const ActualizarEvaluacionSituacion = require('../../../../application/use-cases/evaluacion_situacion/ActualizarEvaluacionSituacion');
const EliminarEvaluacionSituacion = require('../../../../application/use-cases/evaluacion_situacion/EliminarEvaluacionSituacion');

// --- Dependency Injection ---
const evaluacionRepository = new MysqlEvaluacionSituacionRepository();
const notificacionRepository = new MysqlNotificacionRepository();

const crearEvaluacionUseCase = new CrearEvaluacionSituacion(evaluacionRepository, notificacionRepository);
const listarEvaluacionesUseCase = new ListarEvaluacionesSituaciones(evaluacionRepository);
const obtenerEvaluacionUseCase = new ObtenerEvaluacionSituacion(evaluacionRepository);
const actualizarEvaluacionUseCase = new ActualizarEvaluacionSituacion(evaluacionRepository);
const eliminarEvaluacionUseCase = new EliminarEvaluacionSituacion(evaluacionRepository);

const evaluacionesSituacionesCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR UNA NUEVA EVALUACIÓN DE SITUACIÓN
evaluacionesSituacionesCtl.createSituationEvaluation = async (req, res) => {
    const logger = getLogger(req);
    const { notificacioneId, evaluacion } = req.body;
    logger.info(`[EVALUACIONES_SITUACIONES] Solicitud de creación: notificacioneId=${notificacioneId}, evaluacion=${evaluacion}`);

    try {
        const nuevaEvaluacion = await crearEvaluacionUseCase.execute(req.body);

        res.status(201).json({
            message: 'Evaluación de situación registrada exitosamente.',
            evaluacion: nuevaEvaluacion
        });
    } catch (error) {
        console.error(`[EVALUACIONES_SITUACIONES] Error al crear la evaluación: ${error.message}`);
        if (error.message.includes('requeridos')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('Notificación no encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al crear la evaluación de situación.' });
    }
};

// 2. OBTENER TODAS LAS EVALUACIONES DE SITUACIONES
evaluacionesSituacionesCtl.getAllSituationEvaluations = async (req, res) => {
    const logger = getLogger(req);
    const { incluirEliminados } = req.query;
    logger.info(`[EVALUACIONES_SITUACIONES] Solicitud de obtención de todas las evaluaciones (incluirEliminados: ${incluirEliminados})`);

    try {
        const evaluaciones = await listarEvaluacionesUseCase.execute(incluirEliminados === 'true');
        logger.info(`[EVALUACIONES_SITUACIONES] Se devolvieron ${evaluaciones.length} evaluaciones.`);
        res.status(200).json(evaluaciones);
    } catch (error) {
        console.error('Error al obtener las evaluaciones de situaciones:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener las evaluaciones de situaciones.' });
    }
};

// 3. OBTENER UNA EVALUACIÓN DE SITUACIÓN POR ID
evaluacionesSituacionesCtl.getSituationEvaluationById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[EVALUACIONES_SITUACIONES] Solicitud de obtención de evaluación por ID: ${id}`);

    try {
        const evaluacion = await obtenerEvaluacionUseCase.execute(id);

        if (!evaluacion) {
            logger.warn(`[EVALUACIONES_SITUACIONES] Evaluación no encontrada o eliminada con ID: ${id}.`);
            return res.status(404).json({ error: 'Evaluación no encontrada o eliminada.' });
        }

        logger.info(`[EVALUACIONES_SITUACIONES] Evaluación encontrada con ID: ${id}.`);
        res.status(200).json(evaluacion);
    } catch (error) {
        console.error('Error al obtener la evaluación de situación:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener la evaluación de situación.' });
    }
};

// 4. ACTUALIZAR UNA EVALUACIÓN DE SITUACIÓN
evaluacionesSituacionesCtl.updateSituationEvaluation = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[EVALUACIONES_SITUACIONES] Solicitud de actualización de evaluación con ID: ${id}`);

    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
        }

        const updatedEvaluation = await actualizarEvaluacionUseCase.execute(id, req.body);

        res.status(200).json({
            message: 'Evaluación de situación actualizada correctamente.',
            evaluacion: updatedEvaluation
        });
    } catch (error) {
        console.error('Error al actualizar la evaluación de situación:', error.message);
        if (error.message.includes('No se proporcionaron campos')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('no encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al actualizar la evaluación de situación.' });
    }
};

// 5. ELIMINAR UNA EVALUACIÓN DE SITUACIÓN (Borrado Lógico)
evaluacionesSituacionesCtl.deleteSituationEvaluation = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[EVALUACIONES_SITUACIONES] Solicitud de eliminación lógica de evaluación con ID: ${id}`);

    try {
        await eliminarEvaluacionUseCase.execute(id);
        logger.info(`[EVALUACIONES_SITUACIONES] Evaluación marcada como eliminada: id=${id}.`);
        res.status(200).json({ message: 'Evaluación de situación marcada como eliminada correctamente.' });
    } catch (error) {
        console.error('Error al borrar la evaluación de situación:', error.message);
        if (error.message.includes('no encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al borrar la evaluación de situación.' });
    }
};

module.exports = evaluacionesSituacionesCtl;

