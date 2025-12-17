// Importa los modelos y utilidades necesarias
const orm = require('../../database/connection/dataBase.orm'); // Para Sequelize (SQL) - Necesario para la relación y el modelo
const sql = require('../../database/connection/dataBase.sql'); // Para MySQL directo
const { cifrarDato, descifrarDato } = require('../../../application/controller/encrypDates');

const contactosEmergenciasCtl = {};

// --- Utilidad para Descifrado Seguro ---
function safeDecrypt(data) {
    try {
        return data ? descifrarDato(data) : '';
    } catch (error) {
        console.error('Error al descifrar datos:', error.message);
        return '';
    }
}

// Función para formatear una fecha a 'YYYY-MM-DD HH:mm:ss'
function formatLocalDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses son 0-index
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Utilidad para obtener el logger
function getLogger(req) {
    return req.app && req.app.get ? req.app.get('logger') : console;
}

// 1. CREAR UN NUEVO CONTACTO DE EMERGENCIA
contactosEmergenciasCtl.createEmergencyContact = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId, nombre, relacion, numero, telefono, descripcion, estado } = req.body;

    // Usar 'numero' si existe, sino usar 'telefono' para compatibilidad
    const phone = numero || telefono;
    // Usar 'relacion' si existe, sino usar 'descripcion' para compatibilidad
    const desc = relacion || descripcion;

    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de creación de contacto para clienteId: ${clienteId}, nombre: ${nombre}`);

    try {
        // Validar campos obligatorios
        if (!clienteId || !nombre || !phone) {
            logger.warn('[CONTACTOS_EMERGENCIA] Creación fallida: campos obligatorios faltantes.');
            return res.status(400).json({ message: 'Los campos clienteId, nombre y número/teléfono son requeridos.' });
        }

        const now = new Date();
        // CAMBIO: Formatear la fecha a string 'YYYY-MM-DD HH:mm:ss' para columnas STRING
        const formattedNow = formatLocalDateTime(now);

        // Cifrar los datos sensibles
        const nombreCifrado = cifrarDato(nombre);
        const telefonoCifrado = cifrarDato(phone);
        const descripcionCifrada = cifrarDato(desc);

        // Verificar si el contacto ya existe para ese cliente y nombre (usando SQL directo)
        const [contactoExistenteSQL] = await sql.promise().query(
            "SELECT id FROM contactos_emergencias WHERE clienteId = ? AND nombre = ? AND estado = 'activo'",
            [clienteId, nombreCifrado]
        );

        if (contactoExistenteSQL.length > 0) {
            logger.warn(`[CONTACTOS_EMERGENCIA] Error: Contacto duplicado para clienteId=${clienteId}, nombre=${nombre}.`);
            return res.status(409).json({ message: 'El contacto de emergencia ya está registrado para este cliente con ese nombre.' });
        }

        // Crear el nuevo contacto usando ORM (como usuario.controller.js)
        const nuevoContacto = await orm.contactos_emergencia.create({
            clienteId: clienteId,
            nombre: nombreCifrado,
            descripcion: descripcionCifrada,
            telefono: telefonoCifrado,
            estado: estado || 'activo',
            fecha_creacion: formattedNow, // Se añade la fecha de creación (hora local formateada)
        });

        const newContactId = nuevoContacto.id; // Obtener el ID insertado por ORM
        logger.info(`[CONTACTOS_EMERGENCIA] Contacto creado exitosamente con ID: ${newContactId} para clienteId: ${clienteId}.`);

        // Obtener el contacto recién creado para la respuesta
        const [createdContactSQL] = await sql.promise().query("SELECT * FROM contactos_emergencias WHERE id = ?", [newContactId]);
        const createdContact = createdContactSQL[0];

        res.status(201).json({
            message: 'Contacto de emergencia registrado exitosamente.',
            contactoEmergencia: {
                id: createdContact.id,
                clienteId: createdContact.clienteId,
                nombre: safeDecrypt(createdContact.nombre),
                descripcion: safeDecrypt(createdContact.descripcion),
                telefono: safeDecrypt(createdContact.telefono),
                estado: createdContact.estado,
                fecha_creacion: createdContact.fecha_creacion,
                fecha_modificacion: createdContact.fecha_modificacion // Puede ser null si no se ha modificado
            }
        });
    } catch (error) {
        logger.error(`[CONTACTOS_EMERGENCIA] Error al crear contacto: ${error.message}`, error);
        res.status(500).json({ error: 'Error interno del servidor al crear el contacto de emergencia.' });
    }
};

// 2. OBTENER TODOS LOS CONTACTOS DE EMERGENCIA ACTIVOS
contactosEmergenciasCtl.getAllEmergencyContacts = async (req, res) => {
    const logger = getLogger(req);
    const { incluirEliminados } = req.query; // Añadido para consistencia
    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de obtención de todos los contactos de emergencia (incluirEliminados: ${incluirEliminados}).`);

    try {
        let querySQL = `SELECT 
                            ce.id, 
                            ce.clienteId, 
                            ce.nombre, 
                            ce.descripcion, 
                            ce.telefono, 
                            ce.estado, 
                            ce.fecha_creacion, 
                            ce.fecha_modificacion,
                            c.nombre AS cliente_nombre,
                            c.correo_electronico AS cliente_correo
                        FROM 
                            contactos_emergencias ce
                        JOIN 
                            clientes c ON ce.clienteId = c.id`;

        const params = [];
        if (!incluirEliminados) {
            querySQL += ` WHERE ce.estado = 'activo'`;
        }
        querySQL += ` ORDER BY ce.fecha_creacion DESC`; // Ordenar para consistencia

        const [contactosSQL] = await sql.promise().query(querySQL, params);

        // Descifrar los datos sensibles antes de enviar
        const contactosCompletos = contactosSQL.map(contactSQL => ({
            id: contactSQL.id,
            clienteId: contactSQL.clienteId,
            nombre: safeDecrypt(contactSQL.nombre),
            descripcion: safeDecrypt(contactSQL.descripcion),
            telefono: safeDecrypt(contactSQL.telefono),
            estado: contactSQL.estado,
            fecha_creacion: contactSQL.fecha_creacion,
            fecha_modificacion: contactSQL.fecha_modificacion,
            cliente_info: {
                nombre: safeDecrypt(contactSQL.cliente_nombre),
                correo_electronico: safeDecrypt(contactSQL.cliente_correo)
            }
        }));

        logger.info(`[CONTACTOS_EMERGENCIA] Se devolvieron ${contactosCompletos.length} contactos de emergencia.`);
        res.status(200).json(contactosCompletos);
    } catch (error) {
        logger.error('Error al obtener los contactos de emergencia:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener los contactos de emergencia.' });
    }
};

// 3. OBTENER CONTACTOS DE EMERGENCIA POR ID DE CLIENTE
contactosEmergenciasCtl.getContactsByClientId = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId } = req.params; // Usamos clienteId para el parámetro de ruta
    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de contactos de emergencia para clienteId: ${clienteId}`);

    try {
        // Usar ORM (Sequelize) en lugar de SQL directo para mayor estabilidad
        const contactos = await orm.contactos_emergencia.findAll({
            where: {
                clienteId: clienteId,
                estado: 'activo'
            },
            order: [['fecha_creacion', 'DESC']]
        });

        // Descifrar los datos antes de enviar
        const contactosDescifrados = contactos.map(contact => ({
            id: contact.id,
            clienteId: contact.clienteId,
            nombre: safeDecrypt(contact.nombre),
            descripcion: safeDecrypt(contact.descripcion),
            telefono: safeDecrypt(contact.telefono),
            estado: contact.estado,
            fecha_creacion: contact.fecha_creacion,
            fecha_modificacion: contact.fecha_modificacion
        }));

        logger.info(`[CONTACTOS_EMERGENCIA] Se devolvieron ${contactosDescifrados.length} contactos para clienteId: ${clienteId}.`);
        res.status(200).json(contactosDescifrados);
    } catch (error) {
        logger.error('Error al obtener los contactos de emergencia del cliente:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener los contactos de emergencia del cliente.' });
    }
};

// 4. OBTENER UN CONTACTO DE EMERGENCIA POR ID
contactosEmergenciasCtl.getEmergencyContactById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de obtención de contacto por ID: ${id}`);

    try {
        // Usar SQL directo para obtener el contacto por ID
        const [contactoSQL] = await sql.promise().query("SELECT * FROM contactos_emergencias WHERE id = ? AND estado = 'activo'", [id]);

        if (contactoSQL.length === 0) {
            logger.warn(`[CONTACTOS_EMERGENCIA] Contacto de emergencia no encontrado o inactivo con ID: ${id}`);
            return res.status(404).json({ error: 'Contacto de emergencia no encontrado o inactivo.' });
        }

        const contacto = contactoSQL[0];
        logger.info(`[CONTACTOS_EMERGENCIA] Contacto de emergencia encontrado con ID: ${id}.`);

        res.status(200).json({
            id: contacto.id,
            clienteId: contacto.clienteId,
            nombre: safeDecrypt(contacto.nombre),
            descripcion: safeDecrypt(contacto.descripcion),
            telefono: safeDecrypt(contacto.telefono),
            estado: contacto.estado,
            fecha_creacion: contacto.fecha_creacion,
            fecha_modificacion: contacto.fecha_modificacion
        });
    } catch (error) {
        logger.error('Error al obtener el contacto de emergencia:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener el contacto de emergencia.' });
    }
};

// 5. ACTUALIZAR UN CONTACTO DE EMERGENCIA POR ID
contactosEmergenciasCtl.updateEmergencyContact = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    const { nombre, relacion, numero, telefono, descripcion, estado } = req.body;

    // Usar 'numero' si existe, sino usar 'telefono' para compatibilidad
    const phone = numero || telefono;
    // Usar 'relacion' si existe, sino usar 'descripcion' para compatibilidad
    const desc = relacion || descripcion;

    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de actualización de contacto con ID: ${id}`);

    try {
        // Verificar si el contacto existe y está activo
        const [existingContactSQL] = await sql.promise().query("SELECT * FROM contactos_emergencias WHERE id = ? AND estado = 'activo'", [id]);
        if (existingContactSQL.length === 0) {
            logger.warn(`[CONTACTOS_EMERGENCIA] Contacto de emergencia no encontrado o inactivo para actualizar con ID: ${id}`);
            return res.status(404).json({ error: 'Contacto de emergencia no encontrado o inactivo para actualizar.' });
        }
        const contactoExistente = existingContactSQL[0];

        const now = new Date();
        // CAMBIO: Formatear la fecha a string 'YYYY-MM-DD HH:mm:ss' para columnas STRING
        const formattedNow = formatLocalDateTime(now);

        // Preparar datos para SQL (solo los que no son undefined)
        const camposSQL = [];
        const valoresSQL = [];

        if (nombre !== undefined) {
            camposSQL.push('nombre = ?');
            valoresSQL.push(cifrarDato(nombre));
        }
        if (desc !== undefined) {
            camposSQL.push('descripcion = ?');
            valoresSQL.push(cifrarDato(desc));
        }
        if (phone !== undefined) {
            camposSQL.push('telefono = ?');
            valoresSQL.push(cifrarDato(phone));
        }
        if (estado !== undefined) {
            camposSQL.push('estado = ?');
            valoresSQL.push(estado);
        }

        if (camposSQL.length === 0) {
            logger.warn(`[CONTACTOS_EMERGENCIA] No se proporcionaron campos para actualizar el contacto con ID: ${id}.`);
            return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
        }

        // Siempre actualizar fecha_modificacion en SQL
        camposSQL.push('fecha_modificacion = ?');
        valoresSQL.push(formattedNow);

        valoresSQL.push(id); // Para el WHERE
        const consultaSQL = `UPDATE contactos_emergencias SET ${camposSQL.join(', ')} WHERE id = ?`;
        const [resultadoSQLUpdate] = await sql.promise().query(consultaSQL, valoresSQL);

        if (resultadoSQLUpdate.affectedRows === 0) {
            logger.warn(`[CONTACTOS_EMERGENCIA] No se pudo actualizar el contacto de emergencia SQL con ID: ${id}.`);
        } else {
            logger.info(`[CONTACTOS_EMERGENCIA] Contacto de emergencia SQL actualizado con ID: ${id}`);
        }

        // Obtener el contacto actualizado para la respuesta
        const [updatedContactSQL] = await sql.promise().query("SELECT * FROM contactos_emergencias WHERE id = ?", [id]);
        const updatedContact = updatedContactSQL[0];

        res.status(200).json({
            message: 'Contacto de emergencia actualizado correctamente.',
            contactoEmergencia: {
                id: updatedContact.id,
                clienteId: updatedContact.clienteId,
                nombre: safeDecrypt(updatedContact.nombre),
                descripcion: safeDecrypt(updatedContact.descripcion),
                telefono: safeDecrypt(updatedContact.telefono),
                estado: updatedContact.estado,
                fecha_creacion: updatedContact.fecha_creacion,
                fecha_modificacion: updatedContact.fecha_modificacion
            }
        });

    } catch (error) {
        logger.error('Error al actualizar el contacto de emergencia:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el contacto de emergencia.' });
    }
};

// 6. ELIMINAR UN CONTACTO DE EMERGENCIA (Borrado Lógico)
contactosEmergenciasCtl.deleteEmergencyContact = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de eliminación lógica de contacto con ID: ${id}`);

    try {
        // Verificar si el contacto existe y está activo
        const [existingContactSQL] = await sql.promise().query("SELECT id FROM contactos_emergencias WHERE id = ? AND estado = 'activo'", [id]);
        if (existingContactSQL.length === 0) {
            logger.warn(`[CONTACTOS_EMERGENCIA] Contacto de emergencia no encontrado o ya eliminado con ID: ${id}`);
            return res.status(404).json({ error: 'Contacto de emergencia no encontrado o ya estaba eliminado.' });
        }

        const now = new Date();
        // CAMBIO: Formatear la fecha a string 'YYYY-MM-DD HH:mm:ss' para columnas STRING
        const formattedNow = formatLocalDateTime(now);

        // Marcar como eliminado en SQL directo
        const [resultadoSQL] = await sql.promise().query("UPDATE contactos_emergencias SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?", [formattedNow, id]);

        if (resultadoSQL.affectedRows === 0) {
            logger.error(`[CONTACTOS_EMERGENCIA] No se pudo marcar como eliminado el contacto con ID: ${id}.`);
            return res.status(500).json({ error: 'No se pudo eliminar el contacto de emergencia.' });
        }

        logger.info(`[CONTACTOS_EMERGENCIA] Contacto de emergencia marcado como eliminado: id=${id}`);
        res.status(200).json({ message: 'Contacto de emergencia marcado como eliminado correctamente.' });
    } catch (error) {
        logger.error('Error al borrar el contacto de emergencia:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al borrar el contacto de emergencia.' });
    }
};

// 7. SOLICITAR VINCULACIÓN (Buscar usuario por cédula O teléfono)
contactosEmergenciasCtl.requestContact = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId, criterio } = req.body; // criterio: cédula o teléfono

    logger.info(`[CONTACTOS_EMERGENCIA] Solicitud de vinculación de: ${clienteId}, criterio: ${criterio}`);

    if (!clienteId || !criterio) {
        return res.status(400).json({ message: 'ClienteId y criterio de búsqueda son requeridos.' });
    }

    try {
        const criterioCifrado = cifrarDato(criterio);
        let usuarioDestino = null;
        let telefonoDestino = 'Sin número registrado';

        // 1. Intentar buscar por CÉDULA en tabla clientes
        const [usuarioPorCedula] = await sql.promise().query(
            "SELECT id, nombre FROM clientes WHERE cedula_identidad = ? AND estado = 'activo'",
            [criterioCifrado]
        );

        if (usuarioPorCedula.length > 0) {
            usuarioDestino = usuarioPorCedula[0];
            // Intentar buscar su teléfono
            try {
                const [numerosSQL] = await sql.promise().query(
                    "SELECT numero FROM clientes_numeros WHERE clienteId = ? AND estado = 'activo' LIMIT 1",
                    [usuarioDestino.id]
                );
                if (numerosSQL.length > 0) {
                    telefonoDestino = safeDecrypt(numerosSQL[0].numero);
                }
            } catch (e) {
                logger.warn('No se pudo obtener el numero del destino (por cédula):', e.message);
            }
        }

        // 2. Si no se encontró por cédula, intentar buscar por TELÉFONO en clientes_numeros
        if (!usuarioDestino) {
            const [numeroMatch] = await sql.promise().query(
                "SELECT clienteId, numero FROM clientes_numeros WHERE numero = ? AND estado = 'activo'",
                [criterioCifrado]
            );

            if (numeroMatch.length > 0) {
                const match = numeroMatch[0];
                telefonoDestino = safeDecrypt(match.numero); // El teléfono es el criterio buscado

                // Buscar datos del cliente propietario del número
                const [usuarioPorTel] = await sql.promise().query(
                    "SELECT id, nombre FROM clientes WHERE id = ? AND estado = 'activo'",
                    [match.clienteId]
                );

                if (usuarioPorTel.length > 0) {
                    usuarioDestino = usuarioPorTel[0];
                }
            }
        }

        if (!usuarioDestino) {
            return res.status(404).json({ message: 'Usuario no encontrado con esa cédula o teléfono.' });
        }

        const idUsuarioContactoSql = usuarioDestino.id;

        if (idUsuarioContactoSql == clienteId) {
            return res.status(400).json({ message: 'No puedes agregarte a ti mismo.' });
        }

        // 3. Verificar si ya existe relación
        const [relacionExistente] = await sql.promise().query(
            "SELECT id, estado FROM contactos_emergencias WHERE clienteId = ? AND idUsuarioContactoSql = ? AND estado != 'eliminado'",
            [clienteId, idUsuarioContactoSql]
        );

        if (relacionExistente.length > 0) {
            return res.status(409).json({
                message: 'Ya existe una solicitud o vínculo con este usuario.',
                estado: relacionExistente[0].estado
            });
        }

        // 4. Crear solicitud PENDIENTE
        const now = new Date();
        const formattedNow = formatLocalDateTime(now);

        const nombreDestino = safeDecrypt(usuarioDestino.nombre);

        const nuevaSolicitud = await orm.contactos_emergencia.create({
            clienteId: clienteId,
            idUsuarioContactoSql: idUsuarioContactoSql, // VINCULACIÓN CLAVE
            nombre: cifrarDato(nombreDestino),
            telefono: cifrarDato(telefonoDestino),
            estado: 'PENDIENTE',
            fecha_creacion: formattedNow
        });

        // Notificar via Socket al usuario destino (si está conectado)
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${idUsuarioContactoSql}`).emit('contact:request', {
                fromId: clienteId,
                mensaje: `El usuario quiere agregarte como contacto de emergencia.`
            });
        }

        res.status(201).json({
            message: 'Solicitud enviada exitosamente.',
            data: { id: nuevaSolicitud.id, estado: 'PENDIENTE' }
        });

    } catch (error) {
        console.error('Error solicitando contacto:', error);
        res.status(500).json({ error: 'Error interno al procesar solicitud.' });
    }
};

// 8. RESPONDER SOLICITUD (Aceptar/Rechazar)
contactosEmergenciasCtl.respondToRequest = async (req, res) => {
    const logger = getLogger(req);
    const { id, respuesta } = req.body; // id de la tabla contactos_emergencias, respuesta: 'ACEPTAR' | 'RECHAZAR'

    logger.info(`[CONTACTOS_EMERGENCIA] Respuesta a solicitud ${id}: ${respuesta}`);

    try {
        const nuevoEstado = respuesta === 'ACEPTAR' ? 'VINCULADO' : 'RECHAZADO';

        const [updateResult] = await sql.promise().query(
            "UPDATE contactos_emergencias SET estado = ? WHERE id = ?",
            [nuevoEstado, id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada.' });
        }

        // Si acepta, Opcional: Crear la relación inversa automáticamente?
        // Por ahora solo actualizamos el estado unidireccional (A considera a B su contacto)

        res.status(200).json({ message: `Solicitud ${nuevoEstado.toLowerCase()}.` });

    } catch (error) {
        console.error('Error respondiendo solicitud:', error);
        res.status(500).json({ error: 'Error interno.' });
    }
};

// 9. OBTENER SOLICITUDES PENDIENTES (Donde yo soy el usuario destino)
contactosEmergenciasCtl.getPendingRequests = async (req, res) => {
    const { idUsuarioSql } = req.params;
    try {
        // Buscar en contactos_emergencias donde idUsuarioContactoSql = YO y estado = 'PENDIENTE'
        // NOTA: c.telefono NO existe en la tabla clientes. Se ha eliminado del SELECT.
        const [solicitudes] = await sql.promise().query(
            `SELECT 
                ce.id, ce.clienteId AS requesterId, c.nombre, ce.fecha_creacion
             FROM contactos_emergencias ce
             JOIN clientes c ON ce.clienteId = c.id
             WHERE ce.idUsuarioContactoSql = ? AND ce.estado = 'PENDIENTE'`,
            [idUsuarioSql]
        );

        const solicitudesProcess = solicitudes.map(sol => ({
            id: sol.id,
            requesterId: sol.requesterId,
            nombre: safeDecrypt(sol.nombre),
            fecha: sol.fecha_creacion
        }));

        res.status(200).json(solicitudesProcess);
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

