// --- Hexagonal Imports ---
const MysqlMongoMensajeGrupoRepository = require('../../adapters/secondary/database/MysqlMongoMensajeGrupoRepository');
const CrearMensajeGrupo = require('../../../application/use-cases/mensaje_grupo/CrearMensajeGrupo');
const ListarMensajesGrupo = require('../../../application/use-cases/mensaje_grupo/ListarMensajesGrupo');
const ActualizarMensajeGrupo = require('../../../application/use-cases/mensaje_grupo/ActualizarMensajeGrupo');
const EliminarMensajeGrupo = require('../../../application/use-cases/mensaje_grupo/EliminarMensajeGrupo');

// --- Dependency Injection ---
const mensajeGrupoRepository = new MysqlMongoMensajeGrupoRepository();
const crearMensajeGrupoUseCase = new CrearMensajeGrupo(mensajeGrupoRepository);
const listarMensajesGrupoUseCase = new ListarMensajesGrupo(mensajeGrupoRepository);
const actualizarMensajeGrupoUseCase = new ActualizarMensajeGrupo(mensajeGrupoRepository);
const eliminarMensajeGrupoUseCase = new EliminarMensajeGrupo(mensajeGrupoRepository);

const mensajesGrupoCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR UN NUEVO MENSAJE DE GRUPO
mensajesGrupoCtl.createGroupMessage = async (req, res) => {
    const logger = getLogger(req);
    const { grupoId } = req.body;
    logger.info(`[MENSAJES_GRUPO] Solicitud de creación (Hexagonal): grupoId=${grupoId}`);

    try {
        const mensajeCreado = await crearMensajeGrupoUseCase.execute(req.body);
        logger.info(`[MENSAJES_GRUPO] Mensaje creado exitosamente: ID=${mensajeCreado.id}`);

        // 3. Emitir evento de Socket.IO a la sala del grupo (Infraestructura HTTP/Socket)
        const io = req.app.get('io');
        if (io) {
            io.to(`group_${grupoId}`).emit('group_message', mensajeCreado);
            logger.info(`[MENSAJES_GRUPO] Evento 'group_message' emitido a la sala group_${grupoId}`);
        } else {
            logger.warn('[MENSAJES_GRUPO] No se pudo obtener la instancia de Socket.IO para emitir el evento.');
        }

        res.status(201).json({
            message: 'Mensaje creado exitosamente.',
            mensaje: mensajeCreado
        });
    } catch (error) {
        console.error(`[MENSAJES_GRUPO] Error al crear el mensaje: ${error.message}`);
        if (error.message.includes('requeridos') || error.message.includes('no encontrado')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al crear el mensaje.' });
    }
};

// 2. OBTENER TODOS LOS MENSAJES DE UN GRUPO
mensajesGrupoCtl.getMessagesByGroup = async (req, res) => {
    const logger = getLogger(req);
    const { grupoId } = req.params;
    logger.info(`[MENSAJES_GRUPO] Solicitud de mensajes para grupoId (Hexagonal): ${grupoId}`);

    try {
        const mensajes = await listarMensajesGrupoUseCase.execute(grupoId);
        logger.info(`[MENSAJES_GRUPO] Se devolvieron ${mensajes.length} mensajes.`);
        res.status(200).json(mensajes);
    } catch (error) {
        console.error(`[MENSAJES_GRUPO] Error al obtener mensajes: ${error.message}`);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 3. ACTUALIZAR UN MENSAJE EXISTENTE
mensajesGrupoCtl.updateGroupMessage = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[MENSAJES_GRUPO] Solicitud de actualización (Hexagonal): ${id}`);

    try {
        const mensajeActualizado = await actualizarMensajeGrupoUseCase.execute(id, req.body);
        logger.info(`[MENSAJES_GRUPO] Mensaje actualizado: ${id}`);

        res.status(200).json({
            message: 'Mensaje actualizado correctamente.',
            mensaje: mensajeActualizado
        });
    } catch (error) {
        console.error(`[MENSAJES_GRUPO] Error al actualizar: ${error.message}`);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('requiere el campo')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 4. ELIMINAR UN MENSAJE (Borrado Lógico)
mensajesGrupoCtl.deleteGroupMessage = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[MENSAJES_GRUPO] Solicitud de eliminación (Hexagonal): ${id}`);

    try {
        await eliminarMensajeGrupoUseCase.execute(id);
        logger.info(`[MENSAJES_GRUPO] Mensaje marcado como eliminado: ${id}`);
        res.status(200).json({ message: 'Mensaje marcado como eliminado correctamente.' });
    } catch (error) {
        console.error(`[MENSAJES_GRUPO] Error al eliminar: ${error.message}`);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = mensajesGrupoCtl;

