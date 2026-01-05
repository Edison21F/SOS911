// --- Hexagonal Imports ---
const MysqlMongoContenidoAppRepository = require('../../adapters/secondary/database/MysqlMongoContenidoAppRepository');
const ObtenerContenidoApp = require('../../../../application/use-cases/contenido_app/ObtenerContenidoApp');
const CrearContenidoApp = require('../../../../application/use-cases/contenido_app/CrearContenidoApp');
const ActualizarContenidoApp = require('../../../../application/use-cases/contenido_app/ActualizarContenidoApp');
const CambiarEstadoContenidoApp = require('../../../../application/use-cases/contenido_app/CambiarEstadoContenidoApp');

// --- Dependency Injection ---
const contenidoAppRepository = new MysqlMongoContenidoAppRepository();
const obtenerContenidoUseCase = new ObtenerContenidoApp(contenidoAppRepository);
const crearContenidoUseCase = new CrearContenidoApp(contenidoAppRepository);
const actualizarContenidoUseCase = new ActualizarContenidoApp(contenidoAppRepository);
const cambiarEstadoUseCase = new CambiarEstadoContenidoApp(contenidoAppRepository);

const contenidoAppCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. OBTENER EL CONTENIDO GLOBAL
contenidoAppCtl.getContent = async (req, res) => {
    const logger = getLogger(req);
    logger.info('[CONTENIDO_APP] Solicitud de obtención del contenido global (Hexagonal).');

    try {
        const contenido = await obtenerContenidoUseCase.execute();

        const response = {
            id: contenido.id,
            gradientStart: contenido.gradientStart,
            gradientEnd: contenido.gradientEnd,
            fontFamily: contenido.fontFamily,
            mainTitle: contenido.mainTitle,
            estado_sql: contenido.estado, // Legacy mapping
            fecha_creacion_sql: contenido.fecha_creacion,
            fecha_modificacion_sql: contenido.fecha_modificacion,

            howItWorksKey: contenido.howItWorksKey,
            howItWorksTitle: contenido.howItWorksTitle,
            howItWorksContent: contenido.howItWorksContent,
            missionKey: contenido.missionKey,
            missionTitle: contenido.missionTitle,
            missionContent: contenido.missionContent,
            visionKey: contenido.visionKey,
            visionTitle: contenido.visionTitle,
            visionContent: contenido.visionContent,
            logoApp: contenido.logoApp,
            estado_mongo: contenido.estado, // Legacy mapping
            fecha_creacion_mongo: contenido.fecha_creacion,
            fecha_modificacion_mongo: contenido.fecha_modificacion,
        };

        logger.info(`[CONTENIDO_APP] Configuración devuelta. ID: ${contenido.id}`);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error al obtener el contenido global:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener el contenido.' });
    }
};

// 2. CREAR CONTENIDO INICIAL
contenidoAppCtl.createInitialContent = async (req, res) => {
    const logger = getLogger(req);
    logger.info('[CONTENIDO_APP] Solicitud de creación inicial (Hexagonal).');

    try {
        const nuevoContenido = await crearContenidoUseCase.execute(req.body);
        res.status(201).json({ message: 'Contenido global creado exitosamente.', id: nuevoContenido.id });
    } catch (error) {
        console.error('Error al crear el contenido:', error);
        if (error.message.includes('ya existe')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al crear el contenido.' });
    }
};

// 3. ACTUALIZAR CONTENIDO
contenidoAppCtl.updateContent = async (req, res) => {
    const logger = getLogger(req);
    logger.info('[CONTENIDO_APP] Solicitud de actualización (Hexagonal).');

    try {
        await actualizarContenidoUseCase.execute(req.body);
        res.status(200).json({ message: 'Contenido actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar el contenido:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ message: 'Contenido no encontrado para actualizar. Considere usar POST /crear primero.' });
        }
        res.status(500).json({ error: 'Error interno del servidor al actualizar el contenido.' });
    }
};

// 4. CAMBIAR ESTADO
contenidoAppCtl.changeStatus = async (req, res) => {
    const logger = getLogger(req);
    const { estado } = req.body;
    logger.info(`[CONTENIDO_APP] Cambio de estado a: ${estado} (Hexagonal)`);

    try {
        await cambiarEstadoUseCase.execute(estado);
        res.status(200).json({ message: 'Estado actualizado correctamente.' });
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        if (error.message.includes('Estado inválido')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ message: 'Contenido no encontrado.' });
        }
        res.status(500).json({ error: 'Error interno del servidor al cambiar el estado.' });
    }
};

module.exports = contenidoAppCtl;
