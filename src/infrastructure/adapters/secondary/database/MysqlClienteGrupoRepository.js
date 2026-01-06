const path = require('path');
const BASE_PATH = path.resolve(__dirname, '../../../..');
const IClienteGrupoRepository = require(path.join(BASE_PATH, 'domain/repositories/IClienteGrupoRepository'));
const ClienteGrupo = require(path.join(BASE_PATH, 'domain/entities/ClienteGrupo'));
const orm = require(path.join(BASE_PATH, 'infrastructure/database/connection/dataBase.orm'));
const sql = require(path.join(BASE_PATH, 'infrastructure/database/connection/dataBase.sql'));
const SecurityService = require(path.join(BASE_PATH, 'infrastructure/adapters/secondary/security/SecurityService'));

class MysqlClienteGrupoRepository extends IClienteGrupoRepository {
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

    _mapRowToEntity(row) {
        if (!row) return null;
        return new ClienteGrupo({
            id: row.id,
            clienteId: row.clienteId,
            grupoId: row.grupoId,
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            cliente_info: row.cliente_nombre ? {
                nombre: this.securityService.descifrar(row.cliente_nombre),
                correo_electronico: this.securityService.descifrar(row.cliente_correo),
                foto: row.cliente_foto
            } : null,
            grupo_info: row.grupo_nombre ? {
                nombre: this.securityService.descifrar(row.grupo_nombre),
                estado: row.grupo_estado
            } : null
        });
    }

    async save(clienteGrupo) {
        const formattedDate = this._formatDate(new Date());

        // Check if related entities exist? 
        // Use Case responsability or DB constraints will fail.
        // Let's rely on DB or basic checks if critical. The controller did basic check implicitly via insert.

        const nuevaRelacion = {
            clienteId: clienteGrupo.clienteId,
            grupoId: clienteGrupo.grupoId,
            estado: clienteGrupo.estado || 'activo',
            fecha_creacion: formattedDate,
        };

        const saved = await orm.clientes_grupos.create(nuevaRelacion);
        return await this.findById(saved.id);
    }

    async findAll(filters = {}, incluirEliminados = false) {
        let query = `
            SELECT 
                cg.id, cg.clienteId, cg.grupoId, cg.estado, cg.fecha_creacion, cg.fecha_modificacion,
                c.nombre AS cliente_nombre, c.correo_electronico AS cliente_correo, c.foto_perfil AS cliente_foto,
                g.nombre AS grupo_nombre, g.estado AS grupo_estado
            FROM clientes_grupos cg
            JOIN clientes c ON cg.clienteId = c.id
            JOIN grupos g ON cg.grupoId = g.id
        `;

        const conditions = [];
        const params = [];

        if (!incluirEliminados) {
            conditions.push("cg.estado = 'activo'");
        }

        if (filters.clienteId) {
            conditions.push("cg.clienteId = ?");
            params.push(filters.clienteId);
        }

        if (filters.grupoId) {
            conditions.push("cg.grupoId = ?");
            params.push(filters.grupoId);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += ` ORDER BY cg.fecha_creacion DESC`;

        const [rows] = await sql.promise().query(query, params);
        return rows.map(row => this._mapRowToEntity(row));
    }

    async findById(id) {
        const query = `
            SELECT 
                cg.id, cg.clienteId, cg.grupoId, cg.estado, cg.fecha_creacion, cg.fecha_modificacion,
                c.nombre AS cliente_nombre, c.correo_electronico AS cliente_correo,
                g.nombre AS grupo_nombre, g.estado AS grupo_estado
            FROM clientes_grupos cg
            JOIN clientes c ON cg.clienteId = c.id
            JOIN grupos g ON cg.grupoId = g.id
            WHERE cg.id = ?
        `;
        const [rows] = await sql.promise().query(query, [id]);
        if (rows.length === 0) return null;
        return this._mapRowToEntity(rows[0]);
    }

    async findByClientAndGroup(clienteId, grupoId) {
        const query = `
            SELECT id, estado FROM clientes_grupos 
            WHERE clienteId = ? AND grupoId = ?
        `; // Fetch minimal info to check existence/status

        const [rows] = await sql.promise().query(query, [clienteId, grupoId]);
        if (rows.length === 0) return null;

        // If found, might want to return full entity or just status helper.
        // Let's return full entity via findById for consistency
        return await this.findById(rows[0].id);
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());

        const [existing] = await sql.promise().query("SELECT id FROM clientes_grupos WHERE id = ?", [id]);
        if (existing.length === 0) return null;

        const camposSQL = [];
        const valoresSQL = [];

        if (data.estado !== undefined) {
            camposSQL.push('estado = ?');
            valoresSQL.push(data.estado);
        }

        if (camposSQL.length === 0) return await this.findById(id);

        camposSQL.push('fecha_modificacion = ?');
        valoresSQL.push(formattedDate);
        valoresSQL.push(id);

        await sql.promise().query(`UPDATE clientes_grupos SET ${camposSQL.join(', ')} WHERE id = ?`, valoresSQL);

        return await this.findById(id);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());
        const [result] = await sql.promise().query(
            "UPDATE clientes_grupos SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?",
            [formattedDate, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = MysqlClienteGrupoRepository;
