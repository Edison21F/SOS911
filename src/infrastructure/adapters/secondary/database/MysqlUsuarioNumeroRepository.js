const IUsuarioNumeroRepository = require('../../../../domain/repositories/IUsuarioNumeroRepository');
const UsuarioNumero = require('../../../../domain/entities/UsuarioNumero');
const orm = require('../../../database/connection/dataBase.orm.js');
const sql = require('../../../database/connection/dataBase.sql.js');
const SecurityService = require('../security/SecurityService');

class MysqlUsuarioNumeroRepository extends IUsuarioNumeroRepository {
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
        return new UsuarioNumero({
            id: row.id,
            usuarioId: row.usuarioId,
            nombre: this.securityService.descifrar(row.nombre),
            numero: this.securityService.descifrar(row.numero),
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            usuario_info: row.nombre_usuario_asociado ? {
                nombre: this.securityService.descifrar(row.nombre_usuario_asociado),
                correo_electronico: this.securityService.descifrar(row.correo_usuario_asociado)
            } : null
        });
    }

    async save(datos) {
        const formattedDate = this._formatDate(new Date());

        const nombreCifrado = this.securityService.cifrar(datos.nombre);
        const numeroCifrado = this.securityService.cifrar(datos.numero);

        const nuevoNumero = await orm.usuario_numero.create({
            usuarioId: datos.usuarioId,
            nombre: nombreCifrado,
            numero: numeroCifrado,
            estado: datos.estado || 'activo',
            fecha_creacion: formattedDate
        });

        // The query in controller for create response doesn't join with users, but findById does.
        return await this.findById(nuevoNumero.id);
    }

    async findAll(filters = {}, incluirEliminados = false) {
        let query = `
            SELECT un.id, un.nombre, un.numero, un.estado, un.usuarioId, 
                   un.fecha_creacion, un.fecha_modificacion,
                   u.nombre AS nombre_usuario_asociado, u.correo_electronico AS correo_usuario_asociado
            FROM usuarios_numeros un
            JOIN usuarios u ON un.usuarioId = u.id
        `;

        const conditions = [];
        if (!incluirEliminados) {
            conditions.push("un.estado = 'activo'");
        }

        if (filters.usuarioId) {
            conditions.push(`un.usuarioId = ${filters.usuarioId}`);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        // Apply order from controller
        if (filters.usuarioId) {
            query += " ORDER BY un.fecha_creacion ASC"; // Different order in getNumbersByUser
        } else {
            query += " ORDER BY un.fecha_creacion DESC";
        }

        const [rows] = await sql.promise().query(query);
        return rows.map(row => this._mapToEntity(row));
    }

    async findById(id) {
        const query = `
            SELECT un.id, un.nombre, un.numero, un.estado, un.usuarioId, 
                   un.fecha_creacion, un.fecha_modificacion,
                   u.nombre AS nombre_usuario_asociado, u.correo_electronico AS correo_usuario_asociado
            FROM usuarios_numeros un
            JOIN usuarios u ON un.usuarioId = u.id
            WHERE un.id = ?
        `;
        const [rows] = await sql.promise().query(query, [id]);
        return this._mapToEntity(rows[0]);
    }

    async findByUser(usuarioId) {
        return await this.findAll({ usuarioId }, false);
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());
        const campos = [];
        const valores = [];

        if (data.nombre !== undefined) {
            campos.push('nombre = ?');
            valores.push(this.securityService.cifrar(data.nombre));
        }
        if (data.numero !== undefined) {
            campos.push('numero = ?');
            valores.push(this.securityService.cifrar(data.numero));
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
                `UPDATE usuarios_numeros SET ${campos.join(', ')} WHERE id = ?`,
                valores
            );
        }

        return await this.findById(id);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());
        const [result] = await sql.promise().query(
            "UPDATE usuarios_numeros SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?",
            [formattedDate, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = MysqlUsuarioNumeroRepository;
