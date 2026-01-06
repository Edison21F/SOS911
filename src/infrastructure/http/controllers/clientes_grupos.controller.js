// Importa los modelos y utilidades necesarias
const orm = require('../../database/connection/dataBase.orm'); // Para Sequelize (SQL) - Necesario para las relaciones
// --- Hexagonal Imports ---
const MysqlClienteGrupoRepository = require('../../adapters/secondary/database/MysqlClienteGrupoRepository');
const AsignarClienteGrupo = require('../../../application/use-cases/cliente_grupo/AsignarClienteGrupo');
const ListarClientesGrupos = require('../../../application/use-cases/cliente_grupo/ListarClientesGrupos');
const ObtenerClienteGrupo = require('../../../application/use-cases/cliente_grupo/ObtenerClienteGrupo');
const ActualizarClienteGrupo = require('../../../application/use-cases/cliente_grupo/ActualizarClienteGrupo');
const EliminarClienteGrupo = require('../../../application/use-cases/cliente_grupo/EliminarClienteGrupo');

// --- Dependency Injection ---
const clienteGrupoRepository = new MysqlClienteGrupoRepository();
const asignarClienteGrupoUseCase = new AsignarClienteGrupo(clienteGrupoRepository);
const listarClientesGruposUseCase = new ListarClientesGrupos(clienteGrupoRepository);
const obtenerClienteGrupoUseCase = new ObtenerClienteGrupo(clienteGrupoRepository);
const actualizarClienteGrupoUseCase = new ActualizarClienteGrupo(clienteGrupoRepository);
const eliminarClienteGrupoUseCase = new EliminarClienteGrupo(clienteGrupoRepository);

const clientesGruposCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. ASIGNAR USUARIO A GRUPO
clientesGruposCtl.AsignarUsuariosGrupo = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId, grupoId } = req.body;
    logger.info(`[CLIENTE_GRUPO] Intento de asignar cliente a grupo (Hexagonal): clienteId=${clienteId}, grupoId=${grupoId}`);

    try {
        const relacionCreada = await asignarClienteGrupoUseCase.execute(req.body);
        logger.info(`[CLIENTE_GRUPO] Asignación exitosa: id=${relacionCreada.id}`);

        res.status(201).json({
            message: 'Usuario asignado al grupo exitosamente.',
            cliente_grupo: relacionCreada
        });
    } catch (error) {
        console.error(`[CLIENTE_GRUPO] Error al asignar: ${error.message}`);
        if (error.message.includes('obligatorios')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('ya es miembro')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ error: 'Error al asignar usuario al grupo' });
    }
};

// 2. LISTAR USUARIOS DE GRUPOS (Con filtros)
clientesGruposCtl.ListarUsuariosGrupos = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId, grupoId } = req.query;
    const incluirEliminados = req.query.incluirEliminados === 'true';

    logger.info(`[CLIENTE_GRUPO] Listar relaciones (Hexagonal). clienteId=${clienteId}, grupoId=${grupoId}, incluirEliminados=${incluirEliminados}`);

    try {
        const filters = {};
        if (clienteId) filters.clienteId = clienteId;
        if (grupoId) filters.grupoId = grupoId;

        const relaciones = await listarClientesGruposUseCase.execute(filters, incluirEliminados);
        res.status(200).json(relaciones);
    } catch (error) {
        console.error(`[CLIENTE_GRUPO] Error al listar: ${error.message}`);
        res.status(500).json({ error: 'Error al listar usuarios y grupos' });
    }
};

// 3. OBTENER DETALLE DE RELACION
clientesGruposCtl.ObtenerUsuariosGrupo = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CLIENTE_GRUPO] Obtener por ID (Hexagonal): ${id}`);

    try {
        const relacion = await obtenerClienteGrupoUseCase.execute(id);

        if (!relacion) {
            logger.warn(`[CLIENTE_GRUPO] Relación no encontrada o inactiva: id=${id}`);
            return res.status(404).json({ error: 'Relación no encontrada o inactiva.' });
        }

        res.status(200).json(relacion);
    } catch (error) {
        console.error(`[CLIENTE_GRUPO] Error al obtener: ${error.message}`);
        res.status(500).json({ error: 'Error al obtener el detalle' });
    }
};

// 4. ACTUALIZAR RELACION
clientesGruposCtl.ActualizarUsuariosGrupo = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CLIENTE_GRUPO] Actualizar relación (Hexagonal): id=${id}`);

    try {
        const relacionActualizada = await actualizarClienteGrupoUseCase.execute(id, req.body);

        res.status(200).json({
            message: 'Relación actualizada correctamente.',
            cliente_grupo: relacionActualizada
        });
    } catch (error) {
    console.error(`[CLIENTE_GRUPO] Error al actualizar: ${error.message}`);
    if (error.message.includes('no encontrada')) {
        return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al actualizar la relación' });
}
};

// 5. ELIMINAR RELACION
clientesGruposCtl.EliminarUsuariosGrupo = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CLIENTE_GRUPO] Eliminar relación (Hexagonal): id=${id}`);

    try {
        await eliminarClienteGrupoUseCase.execute(id);
        logger.info(`[CLIENTE_GRUPO] Relación eliminada: id=${id}`);
        res.status(200).json({ message: 'Relación eliminada correctamente.' });
    } catch (error) {
        console.error(`[CLIENTE_GRUPO] Error al eliminar: ${error.message}`);
        if (error.message.includes('no encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al eliminar la relación' });
    }
};

module.exports = clientesGruposCtl;

