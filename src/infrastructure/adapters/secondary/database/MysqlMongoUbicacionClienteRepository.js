const IUbicacionClienteRepository = require('../../../../../domain/repositories/IUbicacionClienteRepository');
const UbicacionCliente = require('../../../../../domain/entities/UbicacionCliente');
const orm = require('../../../database/connection/dataBase.orm');
const sql = require('../../../database/connection/dataBase.sql');
const mongo = require('../../../database/connection/dataBase.mongo');
const SecurityService = require('../../security/SecurityService');

class MysqlMongoUbicacionClienteRepository extends IUbicacionClienteRepository {
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

    _mapToEntity(row) {
        if (!row) return null;
        return new UbicacionCliente({
            id: row.id,
            clienteId: row.clienteId,
            latitud: row.latitud,
            longitud: row.longitud,
            marca_tiempo: row.marca_tiempo,
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            cliente_info: row.cliente_nombre ? {
                nombre: this.securityService.descifrar(row.cliente_nombre),
                correo_electronico: this.securityService.descifrar(row.cliente_correo)
            } : null
        });
    }

    async save(datos) {
        const formattedDate = this._formatDate(new Date());

        // 1. Save to SQL (History)
        const nuevaUbicacionSQL = {
            clienteId: datos.clienteId,
            latitud: datos.latitud,
            longitud: datos.longitud,
            marca_tiempo: datos.marca_tiempo || formattedDate,
            estado: datos.estado || 'activo',
            fecha_creacion: formattedDate
        };

        const ubicacionGuardada = await orm.ubicacion_cliente.create(nuevaUbicacionSQL);

        // 2. Sync to Mongo (Current Location)
        try {
            await mongo.Ubicacion.findOneAndUpdate(
                { idClienteSql: datos.clienteId },
                {
                    idClienteSql: datos.clienteId,
                    location: {
                        type: 'Point',
                        coordinates: [parseFloat(datos.longitud), parseFloat(datos.latitud)]
                    },
                    estado: 'activo',
                    ultima_actualizacion: new Date()
                },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Error syncing location to Mongo:', error);
            // Non-blocking
        }

        return await this.findById(ubicacionGuardada.id);
    }

    async findAll(filters = {}, incluirEliminados = false) {
        let query = `
            SELECT 
                uc.id, uc.clienteId, uc.latitud, uc.longitud, uc.marca_tiempo, 
                uc.estado, uc.fecha_creacion, uc.fecha_modificacion,
                c.nombre AS cliente_nombre,
                c.correo_electronico AS cliente_correo
            FROM ubicaciones_clientes uc
            JOIN clientes c ON uc.clienteId = c.id
        `;

        const conditions = [];

        if (!incluirEliminados) {
            conditions.push("uc.estado = 'activo'");
        }

        // Add potential filters? The controller didn't have many, but we can add 'clienteId' if needed.
        if (filters.clienteId) {
            conditions.push("uc.clienteId = " + sql.escape(filters.clienteId));
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY uc.fecha_creacion DESC";

        const [rows] = await sql.promise().query(query);
        return rows.map(row => this._mapToEntity(row));
    }

    async findById(id) {
        const query = `
            SELECT 
                uc.id, uc.clienteId, uc.latitud, uc.longitud, uc.marca_tiempo, 
                uc.estado, uc.fecha_creacion, uc.fecha_modificacion,
                c.nombre AS cliente_nombre,
                c.correo_electronico AS cliente_correo
            FROM ubicaciones_clientes uc
            JOIN clientes c ON uc.clienteId = c.id
            WHERE uc.id = ?
        `;
        const [rows] = await sql.promise().query(query, [id]);
        return rows.length > 0 ? this._mapToEntity(rows[0]) : null;
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());
        const campos = [];
        const valores = [];

        if (data.latitud !== undefined) {
            campos.push('latitud = ?');
            valores.push(data.latitud);
        }
        if (data.longitud !== undefined) {
            campos.push('longitud = ?');
            valores.push(data.longitud);
        }
        if (data.marca_tiempo !== undefined) {
            campos.push('marca_tiempo = ?');
            valores.push(data.marca_tiempo);
        }
        if (data.estado !== undefined) {
            campos.push('estado = ?');
            valores.push(data.estado);
        }

        if (campos.length > 0) {
            campos.push('fecha_modificacion = ?');
            valores.push(formattedDate);
            valores.push(id);

            await sql.promise().query(`UPDATE ubicaciones_clientes SET ${campos.join(', ')} WHERE id = ?`, valores);
        }

        // Note: Controller does NOT update Mongo on 'update' or 'delete'.

        return await this.findById(id);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());
        const [result] = await sql.promise().query(
            "UPDATE ubicaciones_clientes SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?",
            [formattedDate, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = MysqlMongoUbicacionClienteRepository;
