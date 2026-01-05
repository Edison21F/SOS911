const MysqlMongoPaginaRepository = require('../../adapters/secondary/database/MysqlMongoPaginaRepository');
const CrearPagina = require('../../../../application/use-cases/pagina/CrearPagina');
const ObtenerPagina = require('../../../../application/use-cases/pagina/ObtenerPagina');
const ActualizarPagina = require('../../../../application/use-cases/pagina/ActualizarPagina');
const EliminarPagina = require('../../../../application/use-cases/pagina/EliminarPagina');

const paginaRepository = new MysqlMongoPaginaRepository();
const crearPaginaUseCase = new CrearPagina(paginaRepository);
const obtenerPaginaUseCase = new ObtenerPagina(paginaRepository);
const actualizarPaginaUseCase = new ActualizarPagina(paginaRepository);
const eliminarPaginaUseCase = new EliminarPagina(paginaRepository);

const paginaCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

paginaCtl.getPagina = async (req, res) => {
    const logger = getLogger(req);
    const id = req.params.id;
    logger.info(`[PAGINA] Solicitud de obtención de configuración. ID: ${id || 'default'}`);

    try {
        const pagina = await obtenerPaginaUseCase.execute(id);

        const response = {
            id: pagina.id,
            nombrePagina: pagina.nombrePagina,
            descripcionPagina: pagina.descripcionPagina,
            estado_sql: pagina.estado,
            fecha_creacion_sql: pagina.fecha_creacion,
            fecha_modificacion_sql: pagina.fecha_modificacion,
            mision: pagina.mision,
            vision: pagina.vision,
            logoUrl: pagina.logoUrl,
            estado_mongo: pagina.estado_mongo,
            fecha_creacion_mongo: pagina.fecha_creacion, // Simplified mapping
            fecha_modificacion_mongo: pagina.fecha_modificacion
        };

        res.status(200).json(response);
    } catch (error) {
        logger.error(`[PAGINA] Error: ${error.message}`);
        if (error.message.includes('no encontrada')) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

paginaCtl.createPagina = async (req, res) => {
    const logger = getLogger(req);
    logger.info('[PAGINA] Solicitud de creación.');

    try {
        const nuevaPagina = await crearPaginaUseCase.execute(req.body);
        logger.info(`[PAGINA] Creada exitosamente con ID: ${nuevaPagina.id}`);
        res.status(201).json({ message: 'Configuración de página creada exitosamente.', id: nuevaPagina.id });
    } catch (error) {
        logger.error(`[PAGINA] Error al crear: ${error.message}`);
        if (error.message.includes('Ya existe') || error.message.includes('ya está registrado')) {
            return res.status(409).json({ message: error.message });
        }
        if (error.message.includes('requeridos')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

paginaCtl.getPaginaById = paginaCtl.getPagina;

paginaCtl.updatePagina = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[PAGINA] Solicitud de actualización ID: ${id}`);

    try {
        await actualizarPaginaUseCase.execute(id, req.body);
        res.status(200).json({ message: 'Configuración de página actualizada exitosamente.' });
    } catch (error) {
        logger.error(`[PAGINA] Error al actualizar: ${error.message}`);
        if (error.message.includes('no encontrada')) return res.status(404).json({ error: error.message });
        if (error.message.includes('ya está registrado')) return res.status(409).json({ message: error.message });
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

paginaCtl.deletePagina = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[PAGINA] Solicitud de eliminación ID: ${id}`);

    try {
        await eliminarPaginaUseCase.execute(id);
        res.status(200).json({ message: 'Configuración de página marcada como eliminada.' });
    } catch (error) {
        logger.error(`[PAGINA] Error al eliminar: ${error.message}`);
        if (error.message.includes('no encontrada')) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = paginaCtl;
