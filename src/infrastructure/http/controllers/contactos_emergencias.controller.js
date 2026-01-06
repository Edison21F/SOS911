const path = require('path');
const BASE_PATH = path.resolve(__dirname, '../../../../');
const MysqlContactoEmergenciaRepository = require(path.join(BASE_PATH, 'src/infrastructure/adapters/secondary/database/MysqlContactoEmergenciaRepository'));
const MysqlMongoClienteRepository = require(path.join(BASE_PATH, 'src/infrastructure/adapters/secondary/database/MysqlMongoClienteRepository'));

const CrearContactoEmergencia = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_emergencia/CrearContactoEmergencia'));
const ListarContactosEmergencia = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_emergencia/ListarContactosEmergencia'));
const ObtenerContactoEmergencia = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_emergencia/ObtenerContactoEmergencia'));
const ObtenerContactosPorCliente = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_emergencia/ObtenerContactosPorCliente'));
const ActualizarContactoEmergencia = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_emergencia/ActualizarContactoEmergencia'));
const EliminarContactoEmergencia = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_emergencia/EliminarContactoEmergencia'));
const SolicitarVinculacionContacto = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_emergencia/SolicitarVinculacionContacto'));
const ResponderVinculacionContacto = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_emergencia/ResponderVinculacionContacto'));
const ListarSolicitudesPendientes = require(path.join(BASE_PATH, 'src/application/use-cases/contacto_emergencia/ListarSolicitudesPendientes'));

// --- Dependency Injection ---
const contactoEmergenciaRepository = new MysqlContactoEmergenciaRepository();
const clienteRepository = new MysqlMongoClienteRepository();

const crearContactoEmergenciaUseCase = new CrearContactoEmergencia(contactoEmergenciaRepository);
const listarContactosEmergenciaUseCase = new ListarContactosEmergencia(contactoEmergenciaRepository);
const obtenerContactoEmergenciaUseCase = new ObtenerContactoEmergencia(contactoEmergenciaRepository);
const obtenerContactosPorClienteUseCase = new ObtenerContactosPorCliente(contactoEmergenciaRepository);
const actualizarContactoEmergenciaUseCase = new ActualizarContactoEmergencia(contactoEmergenciaRepository);
const eliminarContactoEmergenciaUseCase = new EliminarContactoEmergencia(contactoEmergenciaRepository);
const solicitarVinculacionContactoUseCase = new SolicitarVinculacionContacto(contactoEmergenciaRepository, clienteRepository);
const responderVinculacionContactoUseCase = new ResponderVinculacionContacto(contactoEmergenciaRepository, clienteRepository);
const listarSolicitudesPendientesUseCase = new ListarSolicitudesPendientes(contactoEmergenciaRepository);

const contactosEmergenciasCtl = {};

function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR UN NUEVO CONTACTO DE EMERGENCIA
contactosEmergenciasCtl.createEmergencyContact = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId, nombre } = req.body;

    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de creación (Hexagonal) para clienteId: ${clienteId}, nombre: ${nombre}`);

    try {
        const createdContact = await crearContactoEmergenciaUseCase.execute(req.body);

        logger.info(`[CONTACTOS_EMERGENCIA] Contacto creado exitosamente con ID: ${createdContact.id}.`);

        res.status(201).json({
            message: 'Contacto de emergencia registrado exitosamente.',
            contactoEmergencia: {
                id: createdContact.id,
                clienteId: createdContact.clienteId,
                nombre: createdContact.nombre,
                descripcion: createdContact.descripcion,
                telefono: createdContact.telefono,
                estado: createdContact.estado,
                fecha_creacion: createdContact.fecha_creacion,
                fecha_modificacion: createdContact.fecha_modificacion
            }
        });
    } catch (error) {
        logger.error(`[CONTACTOS_EMERGENCIA] Error al crear contacto: ${error.message}`);

        if (error.message.includes('requeridos') || error.message.includes('No se proporcionaron')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('ya está registrado')) {
            return res.status(409).json({ message: error.message });
        }

        res.status(500).json({ error: 'Error interno del servidor al crear el contacto de emergencia.' });
    }
};

// 2. OBTENER TODOS LOS CONTACTOS DE EMERGENCIA ACTIVOS
contactosEmergenciasCtl.getAllEmergencyContacts = async (req, res) => {
    const logger = getLogger(req);
    const { incluirEliminados } = req.query;
    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de obtención de todos (Hexagonal).`);

    try {
        const contactos = await listarContactosEmergenciaUseCase.execute(incluirEliminados === 'true');

        // Map to legacy response structure
        const contactosCompletos = contactos.map(c => ({
            id: c.id,
            clienteId: c.clienteId,
            nombre: c.nombre,
            descripcion: c.descripcion,
            telefono: c.telefono,
            estado: c.estado,
            fecha_creacion: c.fecha_creacion,
            fecha_modificacion: c.fecha_modificacion,
            cliente_info: c.cliente_info || {}
        }));

        logger.info(`[CONTACTOS_EMERGENCIA] Se devolvieron ${contactosCompletos.length} contactos de emergencia.`);
        res.status(200).json(contactosCompletos);
    } catch (error) {
        logger.error('Error al obtener los contactos de emergencia:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 3. OBTENER CONTACTOS DE EMERGENCIA POR ID DE CLIENTE
contactosEmergenciasCtl.getContactsByClientId = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId } = req.params;
    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de contactos para clienteId (Hexagonal): ${clienteId}`);

    try {
        const contactos = await obtenerContactosPorClienteUseCase.execute(clienteId);

        const contactosResponse = contactos.map(c => ({
            id: c.id,
            clienteId: c.clienteId,
            nombre: c.nombre,
            descripcion: c.descripcion,
            telefono: c.telefono,
            estado: c.estado,
            fecha_creacion: c.fecha_creacion,
            fecha_modificacion: c.fecha_modificacion
        }));

        logger.info(`[CONTACTOS_EMERGENCIA] Se devolvieron ${contactosResponse.length} contactos.`);
        res.status(200).json(contactosResponse);
    } catch (error) {
        logger.error('Error al obtener los contactos de emergencia del cliente:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 4. OBTENER UN CONTACTO DE EMERGENCIA POR ID
contactosEmergenciasCtl.getEmergencyContactById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de obtención por ID (Hexagonal): ${id}`);

    try {
        const contacto = await obtenerContactoEmergenciaUseCase.execute(id);

        if (!contacto) {
            logger.warn(`[CONTACTOS_EMERGENCIA] Contacto no encontrado: ${id}`);
            return res.status(404).json({ error: 'Contacto de emergencia no encontrado o inactivo.' });
        }

        logger.info(`[CONTACTOS_EMERGENCIA] Contacto encontrado: ${id}.`);

        res.status(200).json({
            id: contacto.id,
            clienteId: contacto.clienteId,
            nombre: contacto.nombre,
            descripcion: contacto.descripcion,
            telefono: contacto.telefono,
            estado: contacto.estado,
            fecha_creacion: contacto.fecha_creacion,
            fecha_modificacion: contacto.fecha_modificacion
        });
    } catch (error) {
        logger.error('Error al obtener el contacto de emergencia:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 5. ACTUALIZAR UN CONTACTO DE EMERGENCIA POR ID
contactosEmergenciasCtl.updateEmergencyContact = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de actualización (Hexagonal): ${id}`);

    try {
        const updatedContact = await actualizarContactoEmergenciaUseCase.execute(id, req.body);

        logger.info(`[CONTACTOS_EMERGENCIA] Contacto actualizado con ID: ${id}`);

        res.status(200).json({
            message: 'Contacto de emergencia actualizado correctamente.',
            contactoEmergencia: {
                id: updatedContact.id,
                clienteId: updatedContact.clienteId,
                nombre: updatedContact.nombre,
                descripcion: updatedContact.descripcion,
                telefono: updatedContact.telefono,
                estado: updatedContact.estado,
                fecha_creacion: updatedContact.fecha_creacion,
                fecha_modificacion: updatedContact.fecha_modificacion
            }
        });

    } catch (error) {
        logger.error('Error al actualizar el contacto de emergencia:', error.message);
        if (error.message.includes('No se proporcionaron')) return res.status(400).json({ message: error.message });
        if (error.message.includes('no encontrado')) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 6. ELIMINAR UN CONTACTO DE EMERGENCIA (Borrado Lógico)
contactosEmergenciasCtl.deleteEmergencyContact = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de eliminación (Hexagonal): ${id}`);

    try {
        await eliminarContactoEmergenciaUseCase.execute(id);
        logger.info(`[CONTACTOS_EMERGENCIA] Contacto eliminado: id=${id}`);
        res.status(200).json({ message: 'Contacto de emergencia marcado como eliminado correctamente.' });
    } catch (error) {
        logger.error('Error al borrar el contacto de emergencia:', error.message);
        if (error.message.includes('no encontrado')) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 7. SOLICITAR VINCULACIÓN
contactosEmergenciasCtl.requestContact = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId, criterio } = req.body;
    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de vinculación (Hexagonal): ${clienteId}, criterio: ${criterio}`);

    try {
        const io = req.app.get('io');
        const solicitud = await solicitarVinculacionContactoUseCase.execute(clienteId, criterio, io);

        res.status(201).json({
            message: 'Solicitud enviada exitosamente.',
            data: { id: solicitud.id, estado: 'PENDIENTE' }
        });

    } catch (error) {
        console.error('Error solicitando contacto:', error.message);
        if (error.message.includes('requeridos') || error.message.includes('mismo')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('Ya existe')) {
            return res.status(409).json({ message: error.message, estado: error.estado });
        }

        res.status(500).json({ error: 'Error interno al procesar solicitud.' });
    }
};

// 8. RESPONDER SOLICITUD (Aceptar/Rechazar)
contactosEmergenciasCtl.respondToRequest = async (req, res) => {
    const logger = getLogger(req);
    const { id, respuesta } = req.body;
    logger.info(`[CONTACTOS_EMERGENCIA] Respuesta a solicitud (Hexagonal) ${id}: ${respuesta}`);

    try {
        const nuevoEstado = await responderVinculacionContactoUseCase.execute(id, respuesta);
        res.status(200).json({ message: `Solicitud ${nuevoEstado.toLowerCase()}.` });
    } catch (error) {
        console.error('Error respondiendo solicitud:', error.message);
        if (error.message.includes('no encontrada')) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Error interno.' });
    }
};

// 9. OBTENER SOLICITUDES PENDIENTES
contactosEmergenciasCtl.getPendingRequests = async (req, res) => {
    const { idUsuarioSql } = req.params;
    try {
        const solicitudes = await listarSolicitudesPendientesUseCase.execute(idUsuarioSql);
        res.status(200).json(solicitudes);
    } catch (error) {
        console.error('Error obteniendo solicitudes:', error);
        res.status(500).json({ error: 'Error obteniendo solicitudes.' });
    }
};

module.exports = {
    createEmergencyContact: contactosEmergenciasCtl.createEmergencyContact,
    getAllEmergencyContacts: contactosEmergenciasCtl.getAllEmergencyContacts,
    getEmergencyContactById: contactosEmergenciasCtl.getEmergencyContactById,
    updateEmergencyContact: contactosEmergenciasCtl.updateEmergencyContact,
    deleteEmergencyContact: contactosEmergenciasCtl.deleteEmergencyContact,
    getContactsByClient: contactosEmergenciasCtl.getContactsByClientId,
    requestContact: contactosEmergenciasCtl.requestContact,
    respondToRequest: contactosEmergenciasCtl.respondToRequest,
    getPendingRequests: contactosEmergenciasCtl.getPendingRequests
};

