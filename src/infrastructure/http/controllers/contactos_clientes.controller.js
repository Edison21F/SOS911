// --- Hexagonal Imports ---
const path = require('path');
const BASE_PATH = path.resolve(__dirname, '../../../../');
const MysqlContactoClienteRepository = require(path.join(BASE_PATH, 'src/infrastructure/adapters/secondary/database/MysqlContactoClienteRepository'));
const CrearContactoCliente = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_cliente/CrearContactoCliente'));
const ListarContactosClientes = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_cliente/ListarContactosClientes'));
const ObtenerContactoCliente = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_cliente/ObtenerContactoCliente'));
const ActualizarContactoCliente = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_cliente/ActualizarContactoCliente'));
const EliminarContactoCliente = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_cliente/EliminarContactoCliente'));

// --- Dependency Injection ---
const contactoClienteRepository = new MysqlContactoClienteRepository();
const crearContactoClienteUseCase = new CrearContactoCliente(contactoClienteRepository);
const listarContactosClientesUseCase = new ListarContactosClientes(contactoClienteRepository);
const obtenerContactoClienteUseCase = new ObtenerContactoCliente(contactoClienteRepository);
const actualizarContactoClienteUseCase = new ActualizarContactoCliente(contactoClienteRepository);
const eliminarContactoClienteUseCase = new EliminarContactoCliente(contactoClienteRepository);

const contactosClientesCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR UN NUEVO CONTACTO DE CLIENTE
contactosClientesCtl.createClientContact = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId, contactosEmergenciaId, notificacioneId } = req.body;
    logger.info(`[CONTACTOS_CLIENTES] Solicitud de creación (Hexagonal): clienteId=${clienteId}, contactosEmergenciaId=${contactosEmergenciaId}, notificacionId=${notificacioneId}`);

    try {
        const createdRelation = await crearContactoClienteUseCase.execute(req.body);

        logger.info(`[CONTACTOS_CLIENTES] Contacto de cliente creado exitosamente con ID: ${createdRelation.id}.`);

        res.status(201).json({
            message: 'Contacto de cliente registrado exitosamente.',
            contactoCliente: {
                id: createdRelation.id,
                clienteId: createdRelation.clienteId,
                contactosEmergenciaId: createdRelation.contactosEmergenciaId,
                notificacionId: createdRelation.notificacioneId, // Corrected prop name from entity
                estado: createdRelation.estado,
                fecha_creacion: createdRelation.fecha_creacion,
                fecha_modificacion: createdRelation.fecha_modificacion,
                cliente_info: createdRelation.cliente_info || {},
                contacto_emergencia_info: createdRelation.contacto_emergencia_info || {},
                notificacion_info: createdRelation.notificacion_info || {}
            }
        });
    } catch (error) {
        console.error(`[CONTACTOS_CLIENTES] Error al crear el contacto de cliente: ${error.message}`);

        if (error.message.includes('requeridos') || error.message.includes('No se proporcionaron')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('no encontrado') || error.message.includes('eliminada')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('ya está registrada')) {
            return res.status(409).json({ message: error.message });
        }

        res.status(500).json({ error: 'Error interno del servidor al crear el contacto de cliente.' });
    }
};

// 2. OBTENER TODOS LOS CONTACTOS DE CLIENTES
contactosClientesCtl.getAllClientContacts = async (req, res) => {
    const logger = getLogger(req);
    const { incluirEliminados } = req.query;
    logger.info(`[CONTACTOS_CLIENTES] Solicitud de obtención de todos (Hexagonal).`);

    try {
        const relations = await listarContactosClientesUseCase.execute(incluirEliminados === 'true');
        logger.info(`[CONTACTOS_CLIENTES] Se devolvieron ${relations.length} relaciones.`);

        // Map keys to match legacy response exactly if strictly required, 
        // Entity properties: notificacioneId -> legacy: notificacionId
        const relationsResponse = relations.map(r => ({
            id: r.id,
            clienteId: r.clienteId,
            contactosEmergenciaId: r.contactosEmergenciaId,
            notificacionId: r.notificacioneId,
            estado: r.estado,
            fecha_creacion: r.fecha_creacion,
            fecha_modificacion: r.fecha_modificacion,
            cliente_info: r.cliente_info || {},
            contacto_emergencia_info: r.contacto_emergencia_info || {},
            notificacion_info: r.notificacion_info || {}
        }));

        res.status(200).json(relationsResponse);
    } catch (error) {
        console.error('Error al obtener los contactos de clientes:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 3. OBTENER UN CONTACTO DE CLIENTE POR ID
contactosClientesCtl.getClientContactById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CONTACTOS_CLIENTES] Solicitud de contacto por ID (Hexagonal): ${id}`);

    try {
        const relation = await obtenerContactoClienteUseCase.execute(id);

        if (!relation) {
            logger.warn(`[CONTACTOS_CLIENTES] Contacto no encontrado: ${id}.`);
            return res.status(404).json({ error: 'Contacto de cliente no encontrado o inactivo.' });
        }

        logger.info(`[CONTACTOS_CLIENTES] Contacto encontrado: ${id}.`);

        res.status(200).json({
            id: relation.id,
            clienteId: relation.clienteId,
            contactosEmergenciaId: relation.contactosEmergenciaId,
            notificacionId: relation.notificacioneId,
            estado: relation.estado,
            fecha_creacion: relation.fecha_creacion,
            fecha_modificacion: relation.fecha_modificacion,
            cliente_info: relation.cliente_info || {},
            contacto_emergencia_info: relation.contacto_emergencia_info || {},
            notificacion_info: relation.notificacion_info || {}
        });
    } catch (error) {
        console.error('Error al obtener el contacto de cliente:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 4. ACTUALIZAR UN CONTACTO DE CLIENTE
contactosClientesCtl.updateClientContact = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CONTACTOS_CLIENTES] Solicitud de actualización (Hexagonal): ${id}`);

    try {
        const updatedRelation = await actualizarContactoClienteUseCase.execute(id, req.body);
        logger.info(`[CONTACTOS_CLIENTES] Relación actualizada: ${id}`);

        res.status(200).json({
            message: 'Contacto de cliente actualizado correctamente.',
            contactoCliente: {
                id: updatedRelation.id,
                clienteId: updatedRelation.clienteId,
                contactosEmergenciaId: updatedRelation.contactosEmergenciaId,
                notificacionId: updatedRelation.notificacioneId,
                estado: updatedRelation.estado,
                fecha_creacion: updatedRelation.fecha_creacion,
                fecha_modificacion: updatedRelation.fecha_modificacion,
                cliente_info: updatedRelation.cliente_info || {},
                contacto_emergencia_info: updatedRelation.contacto_emergencia_info || {},
                notificacion_info: updatedRelation.notificacion_info || {}
            }
        });

    } catch (error) {
        console.error('Error al actualizar la relación de contacto de cliente:', error.message);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('No se proporcionaron')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 5. ELIMINAR UN CONTACTO DE CLIENTE (Borrado Lógico)
contactosClientesCtl.deleteClientContact = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CONTACTOS_CLIENTES] Solicitud de eliminación (Hexagonal): ${id}`);

    try {
        await eliminarContactoClienteUseCase.execute(id);
        logger.info(`[CONTACTOS_CLIENTES] Relación eliminada: id=${id}.`);
        res.status(200).json({ message: 'Relación de contacto de cliente marcada como eliminada correctamente.' });
    } catch (error) {
        console.error('Error al borrar el contacto de cliente:', error.message);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = contactosClientesCtl;

