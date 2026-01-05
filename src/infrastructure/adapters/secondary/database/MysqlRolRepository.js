const IRolRepository = require('../../../../../domain/repositories/IRolRepository');
const Rol = require('../../../../../domain/entities/Rol');
const orm = require('../../../database/connection/dataBase.orm');
const sql = require('../../../database/connection/dataBase.sql');
const SecurityService = require('../../security/SecurityService');

class MysqlRolRepository extends IRolRepository {
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
        return new Rol({
            id: row.id,
            nombre: this.securityService.descifrar(row.nombre),
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion
        });
    }

    async save(rol) {
        const formattedDate = this._formatDate(new Date());

        const nombreCifrado = this.securityService.cifrar(rol.nombre);

        const nuevoRol = {
            nombre: nombreCifrado,
            estado: rol.estado || 'activo',
            fecha_creacion: formattedDate,
        };

        const saved = await orm.rol.create(nuevoRol);
        return await this.findById(saved.id);
    }

    async findAll(incluirEliminados = false) {
        let query = `SELECT id, nombre, estado, fecha_creacion, fecha_modificacion FROM roles`;
        if (!incluirEliminados) {
            query += ` WHERE estado = 'activo'`;
        }
        query += ` ORDER BY fecha_creacion DESC`;

        const [rows] = await sql.promise().query(query);
        return rows.map(row => this._mapRowToEntity(row));
    }

    async findById(id) {
        const query = `SELECT id, nombre, estado, fecha_creacion, fecha_modificacion FROM roles WHERE id = ?`;
        const [rows] = await sql.promise().query(query, [id]);

        if (rows.length === 0) return null;
        const row = rows[0];

        // Ensure entity is returned even if inactive (Use Cases handle filter)
        // Check original controller behavior: "r.estado = 'activo'" for getById
        // Repository should generally find by ID regardless, Use Case decides policy? 
        // Adapter logic should be broad, Use Case logic narrow.

        return this._mapRowToEntity(row);
    }

    async findByName(nombre) {
        // Need to scan all roles because of encryption or check if search query is possible.
        // The original controller fetches all roles and finds using JS .some().
        // We will do the same here as encryption prevents index search unless deterministic (security service is random IV usually).
        // If probabilistic encryption, consistent hashing is needed for fast search, but assuming we follow existing pattern:

        const [rows] = await sql.promise().query("SELECT id, nombre, estado FROM roles WHERE estado = 'activo'");
        const found = rows.find(r => this.securityService.descifrar(r.nombre) === nombre);

        if (!found) return null;

        // Return full entity (fetch by ID to be clean or reuse found row if sufficient)
        return this._mapRowToEntity(found);
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());

        const camposSQL = [];
        const valoresSQL = [];

        if (data.nombre !== undefined) {
            camposSQL.push('nombre = ?');
            valoresSQL.push(this.securityService.cifrar(data.nombre));
        }
        if (data.estado !== undefined) {
            camposSQL.push('estado = ?');
            valoresSQL.push(data.estado);
        }

        if (camposSQL.length === 0) return await this.findById(id);

        camposSQL.push('fecha_modificacion = ?');
        valoresSQL.push(formattedDate);
        valoresSQL.push(id);

        await sql.promise().query(`UPDATE roles SET ${camposSQL.join(', ')} WHERE id = ?`, valoresSQL);

        return await this.findById(id);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());
        const [result] = await sql.promise().query(
            "UPDATE roles SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?",
            [formattedDate, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = MysqlRolRepository;
