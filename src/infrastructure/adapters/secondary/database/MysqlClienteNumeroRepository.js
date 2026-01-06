const IClienteNumeroRepository = require('../../../../domain/repositories/IClienteNumeroRepository');
const ClienteNumero = require('../../../../domain/entities/ClienteNumero');
const orm = require('../../../database/connection/dataBase.orm.js');
const sql = require('../../../database/connection/dataBase.sql.js');
const SecurityService = require('../security/SecurityService');

class MysqlClienteNumeroRepository extends IClienteNumeroRepository {
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
        return new ClienteNumero({
            id: row.id,
            clienteId: row.clienteId,
            nombre: this.securityService.decrypt(row.nombre),
            numero: this.securityService.decrypt(row.numero),

            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            cliente_info: row.cliente_nombre ? {
                nombre: this.securityService.decrypt(row.cliente_nombre),
                correo_electronico: this.securityService.decrypt(row.cliente_correo)

            } : null
        });
    }

    async save(datos) {
        const formattedDate = this._formatDate(new Date());

        const nombreCifrado = this.securityService.encrypt(datos.nombre);
        const numeroCifrado = this.securityService.encrypt(datos.numero);


        const nuevoNumero = await orm.clientes_numeros.create({
            clienteId: datos.clienteId,
            nombre: nombreCifrado,
            numero: numeroCifrado,
            estado: datos.estado || 'activo',
            fecha_creacion: formattedDate
        });

        return await this.findById(nuevoNumero.id);
    }

    async findAll(filters = {}, incluirEliminados = false) {
        let query = `
            SELECT cn.id, cn.clienteId, cn.nombre, cn.numero, cn.estado, 
                   cn.fecha_creacion, cn.fecha_modificacion,
                   c.nombre AS cliente_nombre, c.correo_electronico AS cliente_correo
            FROM clientes_numeros cn
            JOIN clientes c ON cn.clienteId = c.id
        `;

        const conditions = [];
        if (!incluirEliminados) {
            conditions.push("cn.estado = 'activo'");
        }

        if (filters.clienteId) {
            conditions.push(`cn.clienteId = ${filters.clienteId}`);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY cn.fecha_creacion DESC";

        const [rows] = await sql.promise().query(query);
        return rows.map(row => this._mapToEntity(row));
    }

    async findById(id) {
        const query = `
            SELECT cn.id, cn.clienteId, cn.nombre, cn.numero, cn.estado, 
                   cn.fecha_creacion, cn.fecha_modificacion,
                   c.nombre AS cliente_nombre, c.correo_electronico AS cliente_correo
            FROM clientes_numeros cn
            JOIN clientes c ON cn.clienteId = c.id
            WHERE cn.id = ?
        `;
        const [rows] = await sql.promise().query(query, [id]);
        return this._mapToEntity(rows[0]);
    }

    async findByClientAndNumber(clienteId, numero) {
        const numeroCifrado = this.securityService.encrypt(numero);

        const [rows] = await sql.promise().query(
            "SELECT id FROM clientes_numeros WHERE clienteId = ? AND numero = ?",
            [clienteId, numeroCifrado]
        );
        return rows.length > 0;
    }

    async findByClientId(clienteId) {
        // This can be served by findAll but explicit method is good for the controller specific route
        return await this.findAll({ clienteId }, false);
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());
        const campos = [];
        const valores = [];

        if (data.nombre !== undefined) {
            campos.push('nombre = ?');
            valores.push(this.securityService.encrypt(data.nombre));

        }
        if (data.numero !== undefined) {
            campos.push('numero = ?');
            valores.push(this.securityService.encrypt(data.numero));

        }
        if (data.estado !== undefined) {
            campos.push('estado = ?');
            valores.push(data.estado);
        }

        if (campos.length > 0) {
            campos.push('fecha_modificacion = ?');
            valores.push(formattedDate);
            valores.push(id);

            await sql.promise().query(
                `UPDATE clientes_numeros SET ${campos.join(', ')} WHERE id = ?`,
                valores
            );
        }

        return await this.findById(id);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());
        const [result] = await sql.promise().query(
            "UPDATE clientes_numeros SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?",
            [formattedDate, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = MysqlClienteNumeroRepository;
