// --- Hexagonal Imports ---
const MysqlRolRepository = require('../../adapters/secondary/database/MysqlRolRepository');
const CrearRol = require('../../../application/use-cases/rol/CrearRol');
const ListarRoles = require('../../../application/use-cases/rol/ListarRoles');
const ObtenerRol = require('../../../application/use-cases/rol/ObtenerRol');
const ActualizarRol = require('../../../application/use-cases/rol/ActualizarRol');
const EliminarRol = require('../../../application/use-cases/rol/EliminarRol');

// --- Dependency Injection ---
const rolRepository = new MysqlRolRepository();
const crearRolUseCase = new CrearRol(rolRepository);
const listarRolesUseCase = new ListarRoles(rolRepository);
const obtenerRolUseCase = new ObtenerRol(rolRepository);
const actualizarRolUseCase = new ActualizarRol(rolRepository);
const eliminarRolUseCase = new EliminarRol(rolRepository);

const rolCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR UN NUEVO ROL
rolCtl.createRole = async (req, res) => {
    const logger = getLogger(req);
    const { nombre } = req.body;
    logger.info(`[ROL] Intento de registro de rol (Hexagonal): nombre=${nombre}`);

    try {
        const rolCreado = await crearRolUseCase.execute(req.body);
        logger.info(`[ROL] Registro exitoso: id=${rolCreado.id}, nombre=${rolCreado.nombre}`);

        res.status(201).json({
            message: 'Rol registrado exitosamente.',
            rol: rolCreado
        });
    } catch (error) {
        console.error(`[ROL] Error al crear el rol: ${error.message}`);
        if (error.message.includes('obligatorio')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('ya está registrado')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ error: 'Error al crear el rol' });
    }
};

// 2. OBTENER TODOS LOS ROLES
rolCtl.getRoles = async (req, res) => {
    const logger = getLogger(req);
    const incluirEliminados = req.query.incluirEliminados === 'true';
    logger.info(`[ROL] Solicitud de listado de roles (incluirEliminados: ${incluirEliminados}) (Hexagonal)`);

    try {
        const roles = await listarRolesUseCase.execute(incluirEliminados);
        res.status(200).json(roles);
    } catch (error) {
        console.error(`[ROL] Error al obtener los roles: ${error.message}`);
        res.status(500).json({ error: 'Error al obtener los roles' });
    }
};

// 3. OBTENER UN ROL POR ID
rolCtl.getRolById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[ROL] Solicitud de rol por ID (Hexagonal): ${id}`);

    try {
        const rol = await obtenerRolUseCase.execute(id);

        if (!rol) {
            logger.warn(`[ROL] Rol no encontrado o inactivo: id=${id}`);
            return res.status(404).json({ error: 'Rol no encontrado o inactivo.' });
        }

        res.status(200).json(rol);
    } catch (error) {
        console.error(`[ROL] Error al obtener el rol: ${error.message}`);
        res.status(500).json({ error: 'Error al obtener el rol' });
    }
};

// 4. ACTUALIZAR UN ROL POR ID
rolCtl.updateRol = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[ROL] Actualización de rol (Hexagonal): id=${id}`);

    try {
        const rolActualizado = await actualizarRolUseCase.execute(id, req.body);

        res.status(200).json({
            message: 'Rol actualizado correctamente.',
            rol: rolActualizado
        });

    } catch (error) {
        console.error(`[ROL] Error al actualizar el rol: ${error.message}`);
        if (error.message.includes('No se proporcionaron campos')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('ya está registrado por otro')) {
            return res.status(409).json({ message: error.message });
        }
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al actualizar el rol' });
    }
};

// 5. ELIMINAR UN ROL
rolCtl.deleteRol = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[ROL] Eliminación de rol (Hexagonal): id=${id}`);

    try {
        await eliminarRolUseCase.execute(id);
        logger.info(`[ROL] Rol marcado como eliminado: id=${id}`);
        res.status(200).json({ message: 'Rol marcado como eliminado correctamente.' });
    } catch (error) {
        console.error(`[ROL] Error al borrar el rol: ${error.message}`);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al borrar el rol' });
    }
};

module.exports = rolCtl;

