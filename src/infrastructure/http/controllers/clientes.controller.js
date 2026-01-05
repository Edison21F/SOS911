// --- Hexagonal Imports ---
const MysqlMongoClienteRepository = require('../../adapters/secondary/database/MysqlMongoClienteRepository');

const CrearCliente = require('../../../../application/use-cases/cliente/CrearCliente');
const ListarClientes = require('../../../../application/use-cases/cliente/ListarClientes');
const ObtenerCliente = require('../../../../application/use-cases/cliente/ObtenerCliente');
const ActualizarCliente = require('../../../../application/use-cases/cliente/ActualizarCliente');
const EliminarCliente = require('../../../../application/use-cases/cliente/EliminarCliente');
const LoginCliente = require('../../../../application/use-cases/cliente/LoginCliente');
const LoginDevice = require('../../../../application/use-cases/cliente/LoginDevice');
const SubirFotoPerfilCliente = require('../../../../application/use-cases/cliente/SubirFotoPerfilCliente');
const ObtenerEstadisticasCliente = require('../../../../application/use-cases/cliente/ObtenerEstadisticasCliente');

// --- Dependency Injection ---
const clienteRepository = new MysqlMongoClienteRepository();

const crearClienteUseCase = new CrearCliente(clienteRepository);
const listarClientesUseCase = new ListarClientes(clienteRepository);
const obtenerClienteUseCase = new ObtenerCliente(clienteRepository);
const actualizarClienteUseCase = new ActualizarCliente(clienteRepository);
const eliminarClienteUseCase = new EliminarCliente(clienteRepository);
const loginClienteUseCase = new LoginCliente(clienteRepository);
const loginDeviceUseCase = new LoginDevice(clienteRepository);
const subirFotoPerfilClienteUseCase = new SubirFotoPerfilCliente(clienteRepository);
const obtenerEstadisticasClienteUseCase = new ObtenerEstadisticasCliente(clienteRepository);

const clientesCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR CLIENTE
clientesCtl.createClient = async (req, res) => {
    const logger = getLogger(req);
    const { nombre, correo_electronico, cedula_identidad, contrasena, direccion } = req.body;
    logger.info(`[CLIENTE] Solicitud de creación (Hexagonal): correo=${correo_electronico}, nombre=${nombre}`);

    try {
        const nuevoCliente = await crearClienteUseCase.execute(req.body);

        logger.info(`[CLIENTE] Cliente creado exitosamente con ID: ${nuevoCliente.id}`);

        res.status(201).json({
            message: 'Cliente registrado exitosamente.',
            clienteId: nuevoCliente.id
        });
    } catch (error) {
        logger.error(`[CLIENTE] Error al crear el cliente: ${error.message}`);

        if (error.message.includes('requeridos')) return res.status(400).json({ message: error.message });
        if (error.message.includes('ya está registrado') || error.message.includes('ya está registrada')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor al crear el cliente.' });
    }
};

// 2. OBTENER TODOS LOS CLIENTES
clientesCtl.getAllClients = async (req, res) => {
    const logger = getLogger(req);
    const { incluirEliminados } = req.query;
    logger.info(`[CLIENTE] Solicitud de obtención de todos (Hexagonal)`);

    try {
        const clientes = await listarClientesUseCase.execute(incluirEliminados === 'true');

        // Map to legacy response
        const clientesResponse = clientes.map(c => ({
            id: c.id,
            nombre: c.nombre,
            correo_electronico: c.correo_electronico,
            cedula_identidad: c.cedula_identidad,
            numero_ayudas: c.numero_ayudas,
            estado: c.estado,
            fecha_nacimiento: c.fecha_nacimiento,
            direccion: c.direccion,
            fecha_creacion_sql: c.fecha_creacion,
            fecha_modificacion_sql: c.fecha_modificacion,
            // Legacy mongo specific fields provided for compatibility
            fecha_creacion_mongo: c.fecha_creacion,
            fecha_modificacion_mongo: c.fecha_modificacion
        }));

        logger.info(`[CLIENTE] Se devolvieron ${clientesResponse.length} clientes.`);
        res.status(200).json(clientesResponse);
    } catch (error) {
        logger.error('Error al obtener todos los clientes:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 3. OBTENER CLIENTE POR ID
clientesCtl.getClientById = async (req, res) => {
    const logger = getLogger(req);
    const idCliente = req.session.clienteId ? req.session.clienteId : req.params.id;
    logger.info(`[CLIENTE] Solicitud de obtención por ID (Hexagonal): ${idCliente}`);

    try {
        const cliente = await obtenerClienteUseCase.execute(idCliente);

        if (!cliente) {
            logger.warn(`[CLIENTE] Cliente no encontrado: ${idCliente}`);
            return res.status(404).json({ error: 'Cliente no encontrado o eliminado.' });
        }

        logger.info(`[CLIENTE] Cliente encontrado: ${idCliente}`);

        const clienteCompleto = {
            id: cliente.id,
            nombre: cliente.nombre,
            correo_electronico: cliente.correo_electronico,
            cedula_identidad: cliente.cedula_identidad,
            numero_ayudas: cliente.numero_ayudas,
            estado: cliente.estado,
            fecha_nacimiento: cliente.fecha_nacimiento,
            direccion: cliente.direccion,
            fecha_creacion_sql: cliente.fecha_creacion,
            fecha_modificacion_sql: cliente.fecha_modificacion,
            foto_perfil: cliente.foto_perfil,
            ficha_medica: cliente.ficha_medica
        };
        res.status(200).json(clienteCompleto);
    } catch (error) {
        logger.error('Error al obtener el cliente:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 4. ACTUALIZAR CLIENTE
clientesCtl.updateClient = async (req, res) => {
    const logger = getLogger(req);
    const idCliente = req.session.clienteId ? req.session.clienteId : req.params.id;
    logger.info(`[CLIENTE] Solicitud de actualización (Hexagonal): ${idCliente}`);

    try {
        const updatedCliente = await actualizarClienteUseCase.execute(idCliente, req.body);

        logger.info(`[CLIENTE] Cliente actualizado con ID: ${idCliente}`);

        res.status(200).json({
            message: 'Cliente actualizado correctamente.',
            cliente: {
                id: updatedCliente.id,
                nombre: updatedCliente.nombre,
                correo_electronico: updatedCliente.correo_electronico,
                cedula_identidad: updatedCliente.cedula_identidad,
                numero_ayudas: updatedCliente.numero_ayudas,
                estado: updatedCliente.estado,
                fecha_nacimiento: updatedCliente.fecha_nacimiento,
                direccion: updatedCliente.direccion,
                ficha_medica: updatedCliente.ficha_medica
            }
        });
    } catch (error) {
        logger.error('Error al actualizar el cliente:', error.message);
        if (error.message.includes('No se proporcionaron')) return res.status(400).json({ message: error.message });
        if (error.message.includes('no encontrado')) return res.status(404).json({ error: error.message });
        if (error.message.includes('ya está registrada') || error.message.includes('ya está registrado')) return res.status(409).json({ message: error.message });

        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 5. ELIMINAR CLIENTE
clientesCtl.deleteClient = async (req, res) => {
    const logger = getLogger(req);
    const idCliente = req.session.clienteId ? req.session.clienteId : req.params.id;
    logger.info(`[CLIENTE] Solicitud de eliminación (Hexagonal): ${idCliente}`);

    try {
        await eliminarClienteUseCase.execute(idCliente);
        logger.info(`[CLIENTE] Cliente eliminado: ${idCliente}`);
        res.status(200).json({ message: 'Cliente marcado como eliminado exitosamente.' });
    } catch (error) {
        logger.error('Error al eliminar el cliente:', error.message);
        if (error.message.includes('no encontrado')) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 6. LOGIN CLIENTE
clientesCtl.loginClient = async (req, res) => {
    const logger = getLogger(req);
    const { correo_electronico, contrasena, deviceId, tipo_dispositivo, modelo_dispositivo } = req.body;
    logger.info(`[CLIENTE] Intento de login (Hexagonal): correo=${correo_electronico}`);

    try {
        const dispositivoData = { deviceId, tipo_dispositivo, modelo_dispositivo };
        const cliente = await loginClienteUseCase.execute(correo_electronico, contrasena, dispositivoData);

        // Session logic
        req.session.clienteId = cliente.id;
        req.session.clienteNombre = cliente.nombre;
        req.session.clienteEmail = cliente.correo_electronico;
        req.session.tipoUsuario = 'cliente';

        logger.info(`[CLIENTE] Login exitoso para ID: ${cliente.id}`);

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: {
                id: cliente.id,
                nombre: cliente.nombre,
                email: cliente.correo_electronico
            }
        });
    } catch (error) {
        logger.error('Error en el login del cliente:', error.message);
        if (error.message.includes('requeridos')) return res.status(400).json({ success: false, message: error.message });
        if (error.message.includes('Credenciales') || error.message.includes('inactivo')) {
            return res.status(401).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor en el login.' });
    }
};

// 7. LOGIN POR DEVICE ID
clientesCtl.deviceLoginHandler = async (req, res) => {
    const logger = getLogger(req);
    const { deviceId } = req.body;
    logger.info(`[CLIENTE] Intento de device-login (Hexagonal): ${deviceId}`);

    try {
        const cliente = await loginDeviceUseCase.execute(deviceId);

        req.session.clienteId = cliente.id;
        req.session.clienteNombre = cliente.nombre;
        req.session.clienteEmail = cliente.correo_electronico;
        req.session.tipoUsuario = 'cliente';

        logger.info(`[CLIENTE] Device-login exitoso para ID: ${cliente.id}`);

        res.status(200).json({
            success: true,
            message: 'Device login exitoso',
            user: {
                id: cliente.id,
                nombre: cliente.nombre,
                email: cliente.correo_electronico
            }
        });
    } catch (error) {
        logger.error('Error en el device-login:', error.message);
        if (error.message.includes('requerido')) return res.status(400).json({ success: false, message: error.message });
        if (error.message.includes('No autorizado') || error.message.includes('inactivo')) {
            return res.status(401).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

// 8. SUBIR FOTO DE PERFIL
clientesCtl.uploadProfilePicture = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: 'No se subió ningún archivo.' });
    }

    const filename = req.file.filename;
    logger.info(`[CLIENTE] Subida de foto (Hexagonal): ID=${id}, file=${filename}`);

    try {
        const fileUrl = await subirFotoPerfilClienteUseCase.execute(id, filename);
        res.status(200).json({
            message: 'Foto de perfil actualizada correctamente.',
            foto_perfil: filename,
            fileUrl: fileUrl
        });
    } catch (error) {
        logger.error('Error al subir foto de perfil:', error.message);
        if (error.message.includes('no encontrado')) return res.status(404).json({ message: error.message });
        res.status(500).json({ error: 'Error interno al subir la imagen.' });
    }
};

// 9. OBTENER ESTADÍSTICAS
clientesCtl.getClientStats = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;

    try {
        const stats = await obtenerEstadisticasClienteUseCase.execute(id);
        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        logger.error(`[CLIENTE] Error obteniendo estadísticas: ${error.message}`);
        res.status(500).json({ error: 'Error interno al obtener estadísticas.' });
    }
};

module.exports = {
    ...clientesCtl,
    uploadProfilePicture: clientesCtl.uploadProfilePicture,
    getClientStats: clientesCtl.getClientStats
};

