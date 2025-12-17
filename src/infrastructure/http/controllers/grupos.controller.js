// Importa los modelos y utilidades necesarias
const orm = require('../../database/connection/dataBase.orm'); // Para Sequelize (SQL)
const sql = require('../../database/connection/dataBase.sql'); // MySQL directo
const mongo = require('../../database/connection/dataBase.mongo'); // Para Mongoose (MongoDB)

const { cifrarDato, descifrarDato } = require('../../../application/controller/encrypDates');

const gruposCtl = {};

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

// 1. CREAR UN NUEVO GRUPO
gruposCtl.createGroup = async (req, res) => {
    const logger = getLogger(req);
    // Ahora esperamos clienteId y ciframos el nombre
    const { clienteId, nombre, descripcion, estado } = req.body;

    logger.info(`[GRUPOS] Solicitud de creación de grupo: nombre=${nombre}, clienteId=${clienteId}`);

    try {
        // Validar campos obligatorios, incluyendo clienteId
        if (!clienteId || !nombre) {
            logger.warn('[GRUPOS] Creación fallida: los campos "clienteId" y "nombre" son obligatorios.');
            return res.status(400).json({ message: 'El clienteId y el nombre del grupo son requeridos.' });
        }

        const now = new Date();
        const formattedNow = formatLocalDateTime(now);
        const nombreCifrado = cifrarDato(nombre);

        // Generar Código de Acceso Único (6 dígitos)
        let codigoAcceso = '';
        let esUnico = false;
        while (!esUnico) {
            codigoAcceso = Math.floor(100000 + Math.random() * 900000).toString();
            // Verificar unicidad en DB
            const [existingCode] = await sql.promise().query("SELECT id FROM grupos WHERE codigo_acceso = ? AND estado='activo'", [codigoAcceso]);
            if (existingCode.length === 0) esUnico = true;
        }

        // Verificar si el grupo ya existe por nombre cifrado y clienteId (usando SQL directo)
        const [existingGroupSQL] = await sql.promise().query(
            "SELECT id FROM grupos WHERE clienteId = ? AND nombre = ? AND estado = 'activo'",
            [clienteId, nombreCifrado]
        );

        if (existingGroupSQL.length > 0) {
            logger.warn(`[GRUPOS] Creación fallida: El clienteId ${clienteId} ya tiene un grupo con el nombre "${nombre}" registrado.`);
            return res.status(409).json({ message: 'Ya tienes un grupo con ese nombre registrado.' });
        }

        // Crear grupo en la base de datos SQL usando ORM (orm.grupos.create())
        const nuevoGrupoSQL = {
            clienteId: clienteId,
            nombre: nombreCifrado,
            codigo_acceso: codigoAcceso, // Guardar código
            estado: estado || 'activo',
            fecha_creacion: formattedNow,
        };
        const grupoGuardadoSQL = await orm.grupos.create(nuevoGrupoSQL);
        const idGrupoSql = grupoGuardadoSQL.id;

        logger.info(`[GRUPOS] Grupo SQL creado exitosamente con ID: ${idGrupoSql}, Código: ${codigoAcceso}`);

        // Crear documento en la base de datos MongoDB
        const nuevoGrupoMongo = {
            idGrupoSql,
            descripcion: descripcion || '',
            estado: estado || 'activo',
            fecha_creacion: formattedNow
        };
        await mongo.Grupo.create(nuevoGrupoMongo);
        logger.info(`[GRUPOS] Grupo Mongo creado exitosamente para ID SQL: ${idGrupoSql}`);

        // AGREGAR AL CREADOR COMO MIEMBRO DEL GRUPO AUTOMATICAMENTE
        await orm.clientes_grupos.create({
            clienteId: clienteId,
            grupoId: idGrupoSql,
            estado: 'activo',
            fecha_creacion: formattedNow
        });
        logger.info(`[GRUPOS] Creador agregado como miembro del grupo ${idGrupoSql}`);

        res.status(201).json({
            message: 'Grupo creado exitosamente.',
            grupoId: idGrupoSql,
            codigo: codigoAcceso
        });

    } catch (error) {
        logger.error(`[GRUPOS] Error al crear el grupo: ${error.message}`, error);
        res.status(500).json({ error: 'Error interno del servidor al crear el grupo.' });
    }
};

// 2. OBTENER TODOS LOS GRUPOS (GET /grupos/listar)
// 2. OBTENER TODOS LOS GRUPOS (GET /grupos/listar)
gruposCtl.getAllGroups = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId } = req.query; // Filtrar por cliente si se envía
    logger.info(`[GRUPOS] Solicitud de listado de grupos.${clienteId ? ' Filtrado por clienteId: ' + clienteId : ''}`);

    try {
        let query = `SELECT 
                g.id, 
                g.clienteId, 
                g.nombre,
                g.codigo_acceso, 
                g.estado, 
                g.fecha_creacion,
                (SELECT COUNT(*) FROM clientes_grupos cg_count WHERE cg_count.grupoId = g.id AND cg_count.estado = 'activo') as miembros
            FROM 
                grupos g`;

        const params = [];

        if (clienteId) {
            query += ` JOIN clientes_grupos cg ON g.id = cg.grupoId 
                       WHERE cg.clienteId = ? AND cg.estado = 'activo' AND g.estado = 'activo'`;
            params.push(clienteId);
        } else {
            query += ` WHERE g.estado = 'activo'`;
        }

        const [gruposSQL] = await sql.promise().query(query, params);

        // Decrypt names
        const gruposDecrypted = await Promise.all(gruposSQL.map(async (grp) => {
            const mongoGroup = await mongo.Grupo.findOne({ idGrupoSql: grp.id });
            return {
                id: grp.id,
                clienteId: grp.clienteId,
                nombre: safeDecrypt(grp.nombre),
                codigo: grp.codigo_acceso, // Include code
                descripcion: mongoGroup?.descripcion || '',
                miembros: grp.miembros || 1,
                estado: grp.estado,
                fecha_creacion: grp.fecha_creacion
            };
        }));

        res.status(200).json(gruposDecrypted);
    } catch (error) {
        logger.error(`[GRUPOS] Error al listar grupos: ${error.message}`, error);
        res.status(500).json({ error: 'Error interno al listar grupos.' });
    }
};

// 4. ACTUALIZAR GRUPO (PUT /grupos/actualizar/:id)
gruposCtl.updateGroup = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    logger.info(`[GRUPOS] Solicitud de actualización del grupo ${id}`);

    try {
        const now = new Date();
        const formattedNow = formatLocalDateTime(now);

        if (nombre) {
            const nombreCifrado = cifrarDato(nombre);
            await sql.promise().query(
                "UPDATE grupos SET nombre = ?, fecha_modificacion = ? WHERE id = ?",
                [nombreCifrado, formattedNow, id]
            );
        }

        if (descripcion !== undefined) {
            await mongo.Grupo.updateOne({ idGrupoSql: id }, { $set: { descripcion, fecha_modificacion: formattedNow } });
        }

        res.status(200).json({ message: 'Grupo actualizado correctamente.' });
    } catch (error) {
        logger.error(`[GRUPOS] Error al actualizar grupo: ${error.message}`, error);
        res.status(500).json({ error: 'Error al actualizar grupo.' });
    }
};

// 5. ELIMINAR GRUPO (DELETE /grupos/eliminar/:id)
gruposCtl.deleteGroup = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[GRUPOS] Solicitud de eliminación del grupo ${id}`);

    try {
        const now = new Date();
        const formattedNow = formatLocalDateTime(now);

        // Soft delete SQL
        await sql.promise().query(
            "UPDATE grupos SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?",
            [formattedNow, id]
        );

        // Soft delete Mongo
        await mongo.Grupo.updateOne({ idGrupoSql: id }, { $set: { estado: 'eliminado', fecha_modificacion: formattedNow } });

        // Soft delete Memberships
        await sql.promise().query(
            "UPDATE clientes_grupos SET estado = 'eliminado', fecha_modificacion = ? WHERE grupoId = ?",
            [formattedNow, id]
        );

        res.status(200).json({ message: 'Grupo eliminado correctamente.' });
    } catch (error) {
        logger.error(`[GRUPOS] Error al eliminar grupo: ${error.message}`, error);
        res.status(500).json({ error: 'Error al eliminar grupo.' });
    }
};
gruposCtl.getGroupById = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    logger.info(`[GRUPOS] Solicitud de obtención de grupo por ID: ${id}`);

    try {
        // SQL directo para obtener grupo
        const [gruposSQL] = await sql.promise().query(
            `SELECT 
                g.id, 
                g.clienteId, 
                g.nombre,
                g.codigo_acceso,
                g.estado, 
                g.fecha_creacion, 
                g.fecha_modificacion,
                c.nombre AS cliente_nombre,
                c.correo_electronico AS cliente_correo
            FROM 
                grupos g
            JOIN 
                clientes c ON g.clienteId = c.id
            WHERE 
                g.id = ? AND g.estado = 'activo'`,
            [id]
        );

        if (gruposSQL.length === 0) {
            return res.status(404).json({ error: 'Grupo no encontrado o eliminado.' });
        }

        const groupSQL = gruposSQL[0];
        let grupoMongo = await mongo.Grupo.findOne({ idGrupoSql: id });

        const grupoCompleto = {
            id: groupSQL.id,
            clienteId: groupSQL.clienteId,
            nombre: safeDecrypt(groupSQL.nombre),
            codigo: groupSQL.codigo_acceso, // Devolver código
            estado: groupSQL.estado,
            descripcion: grupoMongo?.descripcion || '',
            imagen: grupoMongo?.imagen || null, // Include image
            fecha_creacion_sql: groupSQL.fecha_creacion,
            cliente_info: {
                nombre: safeDecrypt(groupSQL.cliente_nombre),
                correo_electronico: safeDecrypt(groupSQL.cliente_correo)
            }
        };
        res.status(200).json(grupoCompleto);
    } catch (error) {
        logger.error('Error al obtener el grupo:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener el grupo.' });
    }
};

// ... (updateGroup se mantiene)
// ... (deleteGroup se mantiene)

// 7. OBTENER MIEMBROS DEL GRUPO (GET /grupos/miembros/:id)
gruposCtl.getMembers = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    
    try {
        const [miembros] = await sql.promise().query(
            `SELECT c.id, c.nombre, c.foto_perfil, cg.estado 
             FROM clientes c 
             JOIN clientes_grupos cg ON c.id = cg.clienteId 
             WHERE cg.grupoId = ? AND cg.estado = 'activo'`,
            [id]
        );
        
        const miembrosDecrypted = miembros.map(m => ({
            id: m.id,
            nombre: safeDecrypt(m.nombre),
            foto: m.foto_perfil, // Assuming this is a URL or filename
            estado: m.estado
        }));
        
        res.status(200).json(miembrosDecrypted);
    } catch (error) {
        logger.error(`[GRUPOS] Error al obtener miembros: ${error.message}`, error);
        res.status(500).json({ error: 'Error al obtener miembros.' });
    }
};

// 8. SUBIR FOTO DE GRUPO (POST /grupos/foto/:id)
gruposCtl.uploadPhoto = async (req, res) => {
    const logger = getLogger(req);
    const { id } = req.params;
    
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
    }

    const archivo = req.files.image; // Field name 'image'
    const path = require('path');
    
    // Validate file type
    if (!archivo.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: 'El archivo debe ser una imagen.' });
    }

    const uploadDir = path.join(__dirname, '../../../../public/uploads/groups');
    const fileName = `group_${id}_${Date.now()}${path.extname(archivo.name)}`;
    const uploadPath = path.join(uploadDir, fileName);

    // Ensure directory exists (fs is likely needed)
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    archivo.mv(uploadPath, async (err) => {
        if (err) {
            logger.error(`[GRUPOS] Error al mover archivo: ${err.message}`, error);
            return res.status(500).json({ error: err });
        }

        const imageUrl = `/uploads/groups/${fileName}`;
        
        // Update Mongo
        await mongo.Grupo.updateOne({ idGrupoSql: id }, { $set: { imagen: imageUrl } }, { upsert: true });

        res.status(200).json({ message: 'Foto subida correctamente', url: imageUrl });
    });
};


// 6. UNIRSE A GRUPO POR CÓDIGO
gruposCtl.joinGroup = async (req, res) => {
    const logger = getLogger(req);
    const { clienteId, codigo } = req.body;

    if (!clienteId || !codigo) {
        return res.status(400).json({ message: 'ClienteId y Código son requeridos.' });
    }

    try {
        // Buscar grupo por código
        const [grupoSQL] = await sql.promise().query(
            "SELECT id, nombre FROM grupos WHERE codigo_acceso = ? AND estado = 'activo'",
            [codigo]
        );

        if (grupoSQL.length === 0) {
            return res.status(404).json({ message: 'Código de grupo inválido o grupo no existe.' });
        }

        const grupoId = grupoSQL[0].id;
        const nombreGrupo = safeDecrypt(grupoSQL[0].nombre);

        // Verificar si ya es miembro
        const [esMiembro] = await sql.promise().query(
            "SELECT id, estado FROM clientes_grupos WHERE clienteId = ? AND grupoId = ?",
            [clienteId, grupoId]
        );

        if (esMiembro.length > 0) {
            if (esMiembro[0].estado === 'activo') {
                return res.status(409).json({ message: 'Ya eres miembro de este grupo.' });
            } else {
                // Reactivar si estaba eliminado
                const now = new Date();
                const formattedNow = formatLocalDateTime(now);
                await sql.promise().query("UPDATE clientes_grupos SET estado = 'activo', fecha_modificacion = ? WHERE id = ?", [formattedNow, esMiembro[0].id]);
                return res.status(200).json({ message: 'Re-unido al grupo exitosamente.', grupoId, nombre: nombreGrupo });
            }
        }

        // Crear relación
        const now = new Date();
        const formattedNow = formatLocalDateTime(now);

        await orm.clientes_grupos.create({
            clienteId: clienteId,
            grupoId: grupoId,
            estado: 'activo',
            fecha_creacion: formattedNow
        });

        logger.info(`[GRUPOS] Cliente ${clienteId} se unió al grupo ${grupoId} con código.`);
        res.status(200).json({ message: 'Te has unido al grupo exitosamente.', grupoId, nombre: nombreGrupo });

    } catch (e) {
        logger.error('Error al unirse al grupo:', e);
        res.status(500).json({ error: 'Error interno al unirse al grupo.' });
    }
};


module.exports = {
    ...gruposCtl,
    joinGroup: gruposCtl.joinGroup
};

