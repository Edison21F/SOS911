const IServicioEmergenciaRepository = require('../../../../domain/repositories/IServicioEmergenciaRepository');
const ServicioEmergencia = require('../../../../domain/entities/ServicioEmergencia');
const orm = require('../../../database/connection/dataBase.orm.js');
const sql = require('../../../database/connection/dataBase.sql.js');
const mongo = require('../../../database/connection/dataBase.mongo.js');
const SecurityService = require('../security/SecurityService');

class MysqlMongoServicioEmergenciaRepository extends IServicioEmergenciaRepository {
    constructor() {
        super();
        this.securityService = new SecurityService();
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

    async _enrichWithMongo(entities) {
        const ids = entities.map(e => e.id);
        const mongoDocs = await mongo.ServicioEmergencia.find({ idServicioEmergenciaSql: { $in: ids } });

        return entities.map(entity => {
            const doc = mongoDocs.find(d => d.idServicioEmergenciaSql == entity.id);
            if (doc) {
                entity.descripcion = doc.descripcion;
                // Could also map specific dates but entity usually prefers SQL dates for consistency
            }
            return entity;
        });
    }

    // Maps SQL row to basic entity, encryption handled
    _mapToEntity(row) {
        if (!row) return null;
        return new ServicioEmergencia({
            id: row.id,
            nombre: this.securityService.descifrar(row.nombre),
            telefono: this.securityService.descifrar(row.telefono),
            estado: row.estado,
            usuarioId: row.usuarioId,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            usuario_info: row.usuario_nombre ? {
                nombre: this.securityService.descifrar(row.usuario_nombre),
                correo_electronico: this.securityService.descifrar(row.usuario_correo)
            } : null
        });
    }

    async save(datos) {
        const formattedDate = this._formatDate(new Date());

        // Encryption
        const nombreCifrado = this.securityService.cifrar(datos.nombre);
        const telefonoCifrado = this.securityService.cifrar(datos.telefono);

        const nuevoServicioSQL = {
            nombre: nombreCifrado,
            telefono: telefonoCifrado,
            estado: datos.estado || 'activo',
            usuarioId: datos.usuarioId,
            fecha_creacion: formattedDate
        };

        const servicioGuardado = await orm.servicios_emergencia.create(nuevoServicioSQL);

        // Save to Mongo
        await mongo.ServicioEmergencia.create({
            idServicioEmergenciaSql: servicioGuardado.id,
            descripcion: datos.descripcion || '',
            estado: datos.estado || 'activo',
            fecha_creacion: formattedDate
        });

        return await this.findById(servicioGuardado.id);
    }

    async findAll(filters = {}, incluirEliminados = false) {
        let query = `
            SELECT se.id, se.nombre, se.telefono, se.estado, se.usuarioId,
                   se.fecha_creacion, se.fecha_modificacion,
                   u.nombre AS usuario_nombre, u.correo_electronico AS usuario_correo
            FROM servicios_emergencia se
            JOIN usuarios u ON se.usuarioId = u.id
        `;

        const conditions = [];

        if (!incluirEliminados) {
            conditions.push("se.estado = 'activo'");
        }

        // Add more filters if needed

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY se.fecha_creacion DESC";

        const [rows] = await sql.promise().query(query);
        const entities = rows.map(row => this._mapToEntity(row));

        return await this._enrichWithMongo(entities);
    }

    async findById(id) {
        const query = `
            SELECT se.id, se.nombre, se.telefono, se.estado, se.usuarioId,
                   se.fecha_creacion, se.fecha_modificacion,
                   u.nombre AS usuario_nombre, u.correo_electronico AS usuario_correo
            FROM servicios_emergencia se
            JOIN usuarios u ON se.usuarioId = u.id
            WHERE se.id = ?
        `;
        const [rows] = await sql.promise().query(query, [id]);
        if (rows.length === 0) return null;

        const entity = this._mapToEntity(rows[0]);
        const enriched = await this._enrichWithMongo([entity]);
        return enriched[0];
    }

    async findByNameAndUser(nombre, usuarioId, excludeId = null) {
        const nombreCifrado = this.securityService.cifrar(nombre);
        let query = "SELECT id FROM servicios_emergencia WHERE nombre = ? AND usuarioId = ? AND estado = 'activo'";
        const params = [nombreCifrado, usuarioId];

        if (excludeId) {
            query += " AND id != ?";
            params.push(excludeId);
        }

        const [rows] = await sql.promise().query(query, params);
        return rows.length > 0;
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());
        const campos = [];
        const valores = [];

        if (data.nombre !== undefined) {
            campos.push('nombre = ?');
            valores.push(this.securityService.cifrar(data.nombre));
        }
        if (data.telefono !== undefined) {
            campos.push('telefono = ?');
            valores.push(this.securityService.cifrar(data.telefono));
        }
        if (data.estado !== undefined) {
            campos.push('estado = ?');
            valores.push(data.estado);
        }
        if (data.usuarioId !== undefined) {
            campos.push('usuarioId = ?');
            valores.push(data.usuarioId);
        }

        if (campos.length > 0) {
            campos.push('fecha_modificacion = ?');
            valores.push(formattedDate);
            valores.push(id);
            await sql.promise().query(`UPDATE servicios_emergencia SET ${campos.join(', ')} WHERE id = ?`, valores);
        }

        // Update Mongo
        const updateMongo = { fecha_modificacion: formattedDate };
        if (data.descripcion !== undefined) updateMongo.descripcion = data.descripcion;
        if (data.estado !== undefined) updateMongo.estado = data.estado;

        await mongo.ServicioEmergencia.updateOne({ idServicioEmergenciaSql: id }, { $set: updateMongo });

        return await this.findById(id);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());
        // SQL Soft Delete
        const [result] = await sql.promise().query(
            "UPDATE servicios_emergencia SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?",
            [formattedDate, id]
        );

        if (result.affectedRows > 0) {
            // Mongo Soft Delete
            await mongo.ServicioEmergencia.updateOne(
                { idServicioEmergenciaSql: id },
                { $set: { estado: 'eliminado', fecha_modificacion: formattedDate } }
            );
            return true;
        }
        return false;
    }
}

module.exports = MysqlMongoServicioEmergenciaRepository;
