// --- Hexagonal Imports ---
const MysqlInformeEstadisticaRepository = require('../../adapters/secondary/database/MysqlInformeEstadisticaRepository');
const CrearInformeEstadistica = require('../../../application/use-cases/informe_estadistica/CrearInformeEstadistica');
const ListarInformesEstadisticas = require('../../../application/use-cases/informe_estadistica/ListarInformesEstadisticas');
const ObtenerInformeEstadistica = require('../../../application/use-cases/informe_estadistica/ObtenerInformeEstadistica');
const ActualizarInformeEstadistica = require('../../../application/use-cases/informe_estadistica/ActualizarInformeEstadistica');
const EliminarInformeEstadistica = require('../../../application/use-cases/informe_estadistica/EliminarInformeEstadistica');

// --- Dependency Injection ---
const informeRepository = new MysqlInformeEstadisticaRepository();

const crearInformeUseCase = new CrearInformeEstadistica(informeRepository);
const listarInformesUseCase = new ListarInformesEstadisticas(informeRepository);
const obtenerInformeUseCase = new ObtenerInformeEstadistica(informeRepository);
const actualizarInformeUseCase = new ActualizarInformeEstadistica(informeRepository);
const eliminarInformeUseCase = new EliminarInformeEstadistica(informeRepository);

const informesCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR UN NUEVO INFORME DE ESTADÍSTICAS
informesCtl.createReport = async (req, res) => {
    const logger = getLogger(req);
    const { presionesBotonPanicoId } = req.body;
    logger.info(`[INFORMES_ESTADISTICAS] Solicitud de creación: presionesBotonPanicoId=${presionesBotonPanicoId}`);

    try {
        const nuevoInforme = await crearInformeUseCase.execute(req.body);

        res.status(201).json({
            message: 'Informe creado exitosamente.',
            informe: nuevoInforme
        });
    } catch (error) {
        console.error(`[INFORMES_ESTADISTICAS] Error al crear el informe: ${error.message}`);
        if (error.message.includes('requerido')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al crear el informe.' });
    }
};

// 2. OBTENER TODOS LOS INFORMES DE ESTADÍSTICAS
informesCtl.getAllReports = async (req, res) => {
    const logger = getLogger(req);
    const { incluirEliminados } = req.query;
    logger.info(`[INFORMES_ESTADISTICAS] Solicitud de obtención de todos los informes (incluirEliminados: ${incluirEliminados})`);

    try {
        const informes = await listarInformesUseCase.execute(incluirEliminados === 'true');
        logger.info(`[INFORMES_ESTADISTICAS] Se devolvieron ${informes.length} informes.`);
        res.status(200).json(informes);
    } catch (error) {
        console.error('Error al obtener los informes de estadísticas:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener los informes de estadísticas.' });
    }
};

// 3. OBTENER UN INFORME DE ESTADÍSTICAS POR ID
informesCtl.getReportById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[INFORMES_ESTADISTICAS] Solicitud de obtención de informe por ID: ${id}`);

    try {
        const informe = await obtenerInformeUseCase.execute(id);

        if (!informe) {
            logger.warn(`[INFORMES_ESTADISTICAS] Informe no encontrado o eliminado con ID: ${id}.`);
            return res.status(404).json({ error: 'Informe no encontrado o eliminado.' });
        }

        logger.info(`[INFORMES_ESTADISTICAS] Informe encontrado con ID: ${id}.`);
        res.status(200).json(informe);
    } catch (error) {
        console.error('Error al obtener el informe de estadísticas:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener el informe de estadísticas.' });
    }
};

// 4. ACTUALIZAR UN INFORME DE ESTADÍSTICAS
informesCtl.updateReport = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[INFORMES_ESTADISTICAS] Solicitud de actualización de informe con ID: ${id}`);

    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
        }

        const updatedReport = await actualizarInformeUseCase.execute(id, req.body);

        res.status(200).json({
            message: 'Informe de estadísticas actualizado correctamente.',
            informe: updatedReport
        });

    } catch (error) {
        console.error('Error al actualizar el informe de estadísticas:', error.message);
        if (error.message.includes('No se proporcionaron campos')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al actualizar el informe de estadísticas.' });
    }
};

// 5. ELIMINAR UN INFORME DE ESTADÍSTICAS (Borrado Lógico)
informesCtl.deleteReport = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[INFORMES_ESTADISTICAS] Solicitud de eliminación lógica de informe con ID: ${id}`);

    try {
        await eliminarInformeUseCase.execute(id);
        logger.info(`[INFORMES_ESTADISTICAS] Informe marcado como eliminado: id=${id}.`);
        res.status(200).json({ message: 'Informe marcado como eliminado correctamente.' });
    } catch (error) {
        console.error('Error al borrar el informe de estadísticas:', error.message);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al borrar el informe de estadísticas.' });
    }
};

module.exports = informesCtl;

