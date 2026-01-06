const IUsuarioRolRepository = require('../../../../domain/repositories/IUsuarioRolRepository');
const UsuarioRol = require('../../../../domain/entities/UsuarioRol');
const orm = require('../../../../infrastructure/database/connection/dataBase.orm');
const sql = require('../../../../infrastructure/database/connection/dataBase.sql');
const SecurityService = require('../security/SecurityService');

class MysqlUsuarioRolRepository extends IUsuarioRolRepository {
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
        return new UsuarioRol({
            id: row.id,
            usuarioId: row.usuarioId,
            roleId: row.roleId,
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            usuario_info: row.nombre_usuario ? {
                nombre: this.securityService.descifrar(row.nombre_usuario),
                correo_electronico: this.securityService.descifrar(row.correo_usuario)
            } : null,
            rol_info: row.nombre_rol ? {
                nombre: this.securityService.descifrar(row.nombre_rol)
            } : null
        });
    }

    async save(data) {
        const formattedDate = this._formatDate(new Date());

        const nuevaRelacion = await orm.usuarios_roles.create({
            usuarioId: data.usuarioId,
            roleId: data.roleId,
            estado: data.estado || 'activo',
            fecha_creacion: formattedDate
        });

        // Fetch full entity with joins to return consistent object
        return await this.findById(nuevaRelacion.id);
    }

    async findAll(filters = {}, incluirEliminados = false) {
        let query = `
            SELECT ur.id, ur.usuarioId, ur.roleId, ur.estado, ur.fecha_creacion, ur.fecha_modificacion,
                   u.nombre AS nombre_usuario, u.correo_electronico AS correo_usuario,
                   r.nombre AS nombre_rol
            FROM usuarios_roles ur
            LEFT JOIN usuarios u ON ur.usuarioId = u.id
            LEFT JOIN roles r ON ur.roleId = r.id
        `;

        const conditions = [];
        const params = [];

        if (!incluirEliminados) {
            conditions.push("ur.estado = 'activo'");
        }

        if (filters.usuarioId) {
            conditions.push("ur.usuarioId = ?");
            params.push(filters.usuarioId);
        }

        if (filters.roleId) {
            conditions.push("ur.roleId = ?");
            params.push(filters.roleId);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY ur.fecha_creacion DESC";

        const [rows] = await sql.promise().query(query, params);
        return rows.map(row => this._mapToEntity(row));
    }

    async findById(id) {
        const query = `
            SELECT ur.id, ur.usuarioId, ur.roleId, ur.estado, ur.fecha_creacion, ur.fecha_modificacion,
                   u.nombre AS nombre_usuario, u.correo_electronico AS correo_usuario,
                   r.nombre AS nombre_rol
            FROM usuarios_roles ur
            LEFT JOIN usuarios u ON ur.usuarioId = u.id
            LEFT JOIN roles r ON ur.roleId = r.id
            WHERE ur.id = ?
        `;
        const [rows] = await sql.promise().query(query, [id]);
        return rows.length > 0 ? this._mapToEntity(rows[0]) : null;
    }

    async findByUserAndRole(usuarioId, roleId) {
        const query = `SELECT id, estado FROM usuarios_roles WHERE usuarioId = ? AND roleId = ?`;
        const [rows] = await sql.promise().query(query, [usuarioId, roleId]);
        // Return simple object or entity? Original controller checked existence.
        // Let's return entity if found, even if partial.
        if (rows.length === 0) return null;
        return this.findById(rows[0].id);
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());
        const campos = [];
        const valores = [];

        if (data.estado) {
            campos.push('estado = ?');
            valores.push(data.estado);
        }
        if (data.usuarioId) {
            campos.push('usuarioId = ?');
            valores.push(data.usuarioId);
        }
        if (data.roleId) {
            campos.push('roleId = ?');
            valores.push(data.roleId);
        }

        if (campos.length > 0) {
            campos.push('fecha_modificacion = ?');
            valores.push(formattedDate);
            valores.push(id);

            await sql.promise().query(`UPDATE usuarios_roles SET ${campos.join(', ')} WHERE id = ?`, valores);
        }

        return await this.findById(id);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());
        const [result] = await sql.promise().query(
            "UPDATE usuarios_roles SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?",
            [formattedDate, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = MysqlUsuarioRolRepository;
