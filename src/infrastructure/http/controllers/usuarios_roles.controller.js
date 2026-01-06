// --- Hexagonal Imports ---
const MysqlUsuarioRolRepository = require('../../adapters/secondary/database/MysqlUsuarioRolRepository');
const AsignarUsuarioRol = require('../../../application/use-cases/usuario_rol/AsignarUsuarioRol');
const ListarUsuariosRoles = require('../../../application/use-cases/usuario_rol/ListarUsuariosRoles');
const ObtenerUsuarioRol = require('../../../application/use-cases/usuario_rol/ObtenerUsuarioRol');
const ActualizarUsuarioRol = require('../../../application/use-cases/usuario_rol/ActualizarUsuarioRol');
const EliminarUsuarioRol = require('../../../application/use-cases/usuario_rol/EliminarUsuarioRol');

// --- Dependency Injection ---
const usuarioRolRepository = new MysqlUsuarioRolRepository();
const asignarUsuarioRolUseCase = new AsignarUsuarioRol(usuarioRolRepository);
const listarUsuariosRolesUseCase = new ListarUsuariosRoles(usuarioRolRepository);
const obtenerUsuarioRolUseCase = new ObtenerUsuarioRol(usuarioRolRepository);
const actualizarUsuarioRolUseCase = new ActualizarUsuarioRol(usuarioRolRepository);
const eliminarUsuarioRolUseCase = new EliminarUsuarioRol(usuarioRolRepository);

const usuarioRolesCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. ASIGNAR ROL A USUARIO
usuarioRolesCtl.assignRoleToUser = async (req, res) => {
    const logger = getLogger(req);
    const { usuarioId, roleId } = req.body;
    logger.info(`[USUARIO-ROL] Intento de asignación (Hexagonal): usuarioId=${usuarioId}, roleId=${roleId}`);

    try {
        const nuevaRelacion = await asignarUsuarioRolUseCase.execute(req.body);

        logger.info(`[USUARIO-ROL] Asignación exitosa: id=${nuevaRelacion.id}`);
        res.status(201).json({
            message: 'Rol asignado exitosamente.',
            usuarioRol: nuevaRelacion
        });
    } catch (error) {
        console.error(`[USUARIO-ROL] Error al asignar: ${error.message}`);
        if (error.message.includes('obligatorios')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('ya existe')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ error: 'Error al asignar rol' });
    }
};

// 2. LISTAR ASIGNACIONES
usuarioRolesCtl.getAllUserRoles = async (req, res) => {
    const logger = getLogger(req);
    const incluirEliminados = req.query.incluirEliminados === 'true';
    logger.info(`[USUARIO-ROL] Listado (Hexagonal). incluirEliminados=${incluirEliminados}`);

    try {
        const relaciones = await listarUsuariosRolesUseCase.execute({}, incluirEliminados);
        res.status(200).json(relaciones);
    } catch (error) {
        console.error(`[USUARIO-ROL] Error al listar: ${error.message}`);
        res.status(500).json({ error: 'Error al obtener las relaciones' });
    }
};

// 3. OBTENER RELACIÓN por ID
usuarioRolesCtl.getUserRoleById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[USUARIO-ROL] Obtener por ID (Hexagonal): ${id}`);

    try {
        const relacion = await obtenerUsuarioRolUseCase.execute(id);

        if (!relacion) {
            return res.status(404).json({ error: 'Relación usuario-rol no encontrada.' });
        }

        res.status(200).json(relacion);
    } catch (error) {
        console.error(`[USUARIO-ROL] Error al obtener: ${error.message}`);
        res.status(500).json({ error: 'Error al obtener la relación' });
    }
};

// 4. ACTUALIZAR RELACIÓN
usuarioRolesCtl.updateUserRole = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[USUARIO-ROL] Actualizar relación (Hexagonal): id=${id}`);

    try {
        await actualizarUsuarioRolUseCase.execute(id, req.body);
        res.status(200).json({ message: 'Relación actualizada correctamente.' });
    } catch (error) {
        console.error(`[USUARIO-ROL] Error al actualizar: ${error.message}`);
        if (error.message.includes(' no encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al actualizar la relación' });
    }
};

// 5. ELIMINAR RELACIÓN
usuarioRolesCtl.deleteUserRole = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[USUARIO-ROL] Eliminar relación (Hexagonal): id=${id}`);

    try {
        await eliminarUsuarioRolUseCase.execute(id);
        res.status(200).json({ message: 'Relación marcada como eliminada correctamente.' });
    } catch (error) {
        console.error(`[USUARIO-ROL] Error al eliminar: ${error.message}`);
        if (error.message.includes(' no encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al borrar la relación' });
    }
};

module.exports = usuarioRolesCtl;
