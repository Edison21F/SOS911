const IMensajeGrupoRepository = require('../../../../domain/repositories/IMensajeGrupoRepository');
const MensajeGrupo = require('../../../../domain/entities/MensajeGrupo');
const orm = require('../../../database/connection/dataBase.orm.js');
const sql = require('../../../database/connection/dataBase.sql.js');
const mongo = require('../../../database/connection/dataBase.mongo.js');
const SecurityService = require('../security/SecurityService');

class MysqlMongoMensajeGrupoRepository extends IMensajeGrupoRepository {
    constructor() {
        super();
        this.securityService = new SecurityService();
    }

    _toDomain(mongoDoc, clientInfo = null) {
        if (!mongoDoc) return null;
        return new MensajeGrupo({
            id: mongoDoc._id,
            grupoId: mongoDoc.grupoId,
            clienteId: mongoDoc.clienteId,
            mensaje: mongoDoc.mensaje,
            fecha_envio: mongoDoc.fecha_envio,
            tipo_mensaje: mongoDoc.tipo_mensaje,
            estado: mongoDoc.estado,
            fecha_creacion: mongoDoc.fecha_creacion,
            fecha_modificacion: mongoDoc.fecha_modificacion,
            cliente_info: clientInfo
        });
    }

    _formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    async save(mensaje) {
        const formattedDate = this._formatDate(new Date());

        // 1. Validar existencia de grupo y cliente (Check integrity in SQL)
        const [grupoSQL] = await sql.promise().query("SELECT id FROM grupos WHERE id = ? AND estado = 'activo'", [mensaje.grupoId]);
        if (grupoSQL.length === 0) throw new Error('Grupo no encontrado o inactivo.');

        const [clienteSQL] = await sql.promise().query("SELECT id FROM clientes WHERE id = ? AND estado = 'activo'", [mensaje.clienteId]);
        if (clienteSQL.length === 0) throw new Error('Cliente no encontrado o inactivo.');

        // 2. Save to Mongo
        const nuevoMensajeMongo = {
            grupoId: mensaje.grupoId,
            clienteId: mensaje.clienteId,
            mensaje: mensaje.mensaje,
            fecha_envio: formattedDate,
            estado: mensaje.estado || 'activo',
            tipo_mensaje: mensaje.tipo_mensaje || 'texto',
            fecha_creacion: formattedDate
        };
        const mensajeGuardadoMongo = await mongo.MensajeGrupo.create(nuevoMensajeMongo);

        // 3. Save metadata to SQL 'mensajes_grupos'
        const nuevoMensajeGrupoSQL = {
            grupoId: mensaje.grupoId,
            clienteId: mensaje.clienteId,
            mongoMessageId: mensajeGuardadoMongo._id.toString(),
            tipo_mensaje: mensaje.tipo_mensaje || 'texto',
            fecha_envio: formattedDate,
            estado: mensaje.estado || 'activo',
            fecha_creacion: formattedDate,
        };
        await orm.mensajes_grupo.create(nuevoMensajeGrupoSQL);

        // 4. Update 'grupos' stats in SQL
        await sql.promise().query(
            "UPDATE grupos SET ultimo_mensaje_fecha = ?, total_mensajes = IFNULL(total_mensajes, 0) + 1, fecha_modificacion = ? WHERE id = ?",
            [formattedDate, formattedDate, mensaje.grupoId]
        );

        return this._toDomain(mensajeGuardadoMongo);
    }

    async findByGroup(grupoId) {
        // Verify group exists first
        const [grupoSQL] = await sql.promise().query("SELECT id FROM grupos WHERE id = ? AND estado = 'activo'", [grupoId]);
        if (grupoSQL.length === 0) throw new Error('Grupo no encontrado o inactivo.');

        // Get messages from Mongo
        const mensajesMongo = await mongo.MensajeGrupo.find({ grupoId, estado: 'activo' }).sort({ fecha_envio: 1 });
        if (mensajesMongo.length === 0) return [];

        // Get Client Info from SQL for all messages
        const clienteIds = [...new Set(mensajesMongo.map(m => m.clienteId))];
        let clientesMap = new Map();

        if (clienteIds.length > 0) {
            const [clientesSQL] = await sql.promise().query(`SELECT id, nombre, correo_electronico FROM clientes WHERE id IN (${clienteIds.join(',')})`);
            clientesMap = new Map(clientesSQL.map(c => [
                c.id,
                {
                    nombre: this.securityService.descifrar(c.nombre),
                    correo_electronico: this.securityService.descifrar(c.correo_electronico)
                }
            ]));
        }

        return mensajesMongo.map(msg => this._toDomain(msg, clientesMap.get(msg.clienteId) || { nombre: 'Desconocido', correo_electronico: 'Desconocido' }));
    }

    async findById(id) {
        const mensajeMongo = await mongo.MensajeGrupo.findById(id);
        if (!mensajeMongo) return null;
        return this._toDomain(mensajeMongo);
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());

        const updateDataMongo = { ...data };
        updateDataMongo.fecha_modificacion = formattedDate;
        delete updateDataMongo.id; // Ensure ID is not updated

        const resultMongo = await mongo.MensajeGrupo.updateOne(
            { _id: id, estado: 'activo' },
            { $set: updateDataMongo }
        );

        if (resultMongo.matchedCount === 0) return null;

        // Update SQL metadata if 'estado' changed
        if (data.estado) {
            await sql.promise().query(
                "UPDATE mensajes_grupos SET estado = ?, fecha_modificacion = ? WHERE mongoMessageId = ?",
                [data.estado, formattedDate, id]
            );
        }

        const updated = await mongo.MensajeGrupo.findById(id);
        return this._toDomain(updated);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());

        const resultMongo = await mongo.MensajeGrupo.updateOne(
            { _id: id, estado: 'activo' },
            { $set: { estado: 'eliminado', fecha_modificacion: formattedDate } }
        );

        if (resultMongo.matchedCount === 0) return false;

        await sql.promise().query(
            "UPDATE mensajes_grupos SET estado = 'eliminado', fecha_modificacion = ? WHERE mongoMessageId = ?",
            [formattedDate, id]
        );

        return true;
    }
}

module.exports = MysqlMongoMensajeGrupoRepository;
