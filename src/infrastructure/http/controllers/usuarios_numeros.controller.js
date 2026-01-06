// --- Hexagonal Imports ---
const MysqlUsuarioNumeroRepository = require('../../adapters/secondary/database/MysqlUsuarioNumeroRepository');
const CrearNumeroUsuario = require('../../../application/use-cases/usuario_numero/CrearNumeroUsuario');
const ListarNumerosUsuarios = require('../../../application/use-cases/usuario_numero/ListarNumerosUsuarios');
const ObtenerNumeroUsuario = require('../../../application/use-cases/usuario_numero/ObtenerNumeroUsuario');
const ActualizarNumeroUsuario = require('../../../application/use-cases/usuario_numero/ActualizarNumeroUsuario');
const EliminarNumeroUsuario = require('../../../application/use-cases/usuario_numero/EliminarNumeroUsuario');

// --- Dependency Injection ---
const usuarioNumeroRepository = new MysqlUsuarioNumeroRepository();
const crearNumeroUseCase = new CrearNumeroUsuario(usuarioNumeroRepository);
const listarNumerosUseCase = new ListarNumerosUsuarios(usuarioNumeroRepository);
const obtenerNumeroUseCase = new ObtenerNumeroUsuario(usuarioNumeroRepository);
const actualizarNumeroUseCase = new ActualizarNumeroUsuario(usuarioNumeroRepository);
const eliminarNumeroUseCase = new EliminarNumeroUsuario(usuarioNumeroRepository);

const usuarioNumeroCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR NUMERO DE USUARIO
usuarioNumeroCtl.createUserNumber = async (req, res) => {
    const logger = getLogger(req);
    const { nombre, numero, usuarioId } = req.body;
    logger.info(`[USUARIOS_NUMEROS] Registro (Hexagonal): nombre=${nombre}, numero=${numero}, usuarioId=${usuarioId}`);

    try {
        const nuevoNumero = await crearNumeroUseCase.execute(req.body);

        res.status(201).json({
            message: 'Registro exitoso',
            usuarioNumero: nuevoNumero
        });
    } catch (error) {
        logger.error(`[USUARIOS_NUMEROS] Error al crear: ${error.message}`);

        if (error.message.includes('Faltan campos')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('foreign key') || error.message.includes('usuario no existe')) {
            return res.status(400).json({ message: 'El usuario asociado no existe o no está activo.' });
        }

        res.status(500).json({ error: 'Error al crear el usuarioNumero' });
    }
};

// 2. LISTAR NUMEROS DE USUARIO
usuarioNumeroCtl.getAllUserNumbers = async (req, res) => {
    const logger = getLogger(req);
    const incluirEliminados = req.query.incluirEliminados === 'true';
    logger.info(`[USUARIOS_NUMEROS] Listar (Hexagonal). incluirEliminados=${incluirEliminados}`);

    try {
        const numeros = await listarNumerosUseCase.execute({}, incluirEliminados);
        logger.info(`[USUARIOS_NUMEROS] Se devolvieron ${numeros.length} números.`);
        res.status(200).json(numeros);
    } catch (error) {
        logger.error(`[USUARIOS_NUMEROS] Error al obtener: ${error.message}`);
        res.status(500).json({ error: 'Error al obtener los usuariosNumeros' });
    }
};

// 3. OBTENER NUMERO POR ID
usuarioNumeroCtl.getUserNumberById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[USUARIOS_NUMEROS] Obtener por ID (Hexagonal): ${id}`);

    try {
        const numero = await obtenerNumeroUseCase.execute(id);

        if (!numero) {
            return res.status(404).json({ error: 'Número de usuario no encontrado o inactivo.' });
        }

        res.status(200).json(numero);
    } catch (error) {
        logger.error(`[USUARIOS_NUMEROS] Error al obtener: ${error.message}`);
        res.status(500).json({ error: 'Error al obtener el número de usuario' });
    }
};

// 4. ACTUALIZAR NUMERO
usuarioNumeroCtl.updateUserNumber = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[USUARIOS_NUMEROS] Actualizar (Hexagonal): id=${id}`);

    try {
        const updated = await actualizarNumeroUseCase.execute(id, req.body);

        res.status(200).json({
            message: 'Número de usuario actualizado correctamente.',
            usuarioNumero: updated
        });
    } catch (error) {
        logger.error(`[USUARIOS_NUMEROS] Error al actualizar: ${error.message}`);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al actualizar el número de usuario' });
    }
};

// 5. ELIMINAR NUMERO
usuarioNumeroCtl.deleteUserNumber = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[USUARIOS_NUMEROS] Eliminar (Hexagonal): id=${id}`);

    try {
        await eliminarNumeroUseCase.execute(id);
        res.status(200).json({ message: 'Número de usuario marcado como eliminado correctamente.' });
    } catch (error) {
        logger.error(`[USUARIOS_NUMEROS] Error al borrar: ${error.message}`);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al borrar el número de usuario' });
    }
};

// 6. OBTENER POR USUARIO ID
usuarioNumeroCtl.getNumbersByUser = async (req, res) => {
    const logger = getLogger(req);
    const { usuarioId } = req.params;
    const incluirEliminados = req.query.incluirEliminados === 'true';
    logger.info(`[USUARIOS_NUMEROS] Obtener por Usuario (Hexagonal): usuarioId=${usuarioId}`);

    try {
        const numeros = await listarNumerosUseCase.execute({ usuarioId }, incluirEliminados);
        res.status(200).json(numeros);
    } catch (error) {
        logger.error(`[USUARIOS_NUMEROS] Error al obtener números del usuario: ${error.message}`);
        res.status(500).json({ error: 'Error al obtener números del usuario' });
    }
};

module.exports = usuarioNumeroCtl;

