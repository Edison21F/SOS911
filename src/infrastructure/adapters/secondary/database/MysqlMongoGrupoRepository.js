const path = require('path');
const BASE_PATH = path.resolve(__dirname, '../../../..');
const IGrupoRepository = require(path.join(BASE_PATH, 'domain/repositories/IGrupoRepository'));
const Grupo = require(path.join(BASE_PATH, 'domain/entities/Grupo'));
const orm = require(path.join(BASE_PATH, 'infrastructure/database/connection/dataBase.orm'));
const sql = require(path.join(BASE_PATH, 'infrastructure/database/connection/dataBase.sql'));
const mongo = require(path.join(BASE_PATH, 'infrastructure/database/connection/dataBase.mongo'));
const SecurityService = require(path.join(BASE_PATH, 'infrastructure/adapters/secondary/security/SecurityService'));

class MysqlMongoGrupoRepository extends IGrupoRepository {
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

    async _mapToEntity(sqlRow) {
        if (!sqlRow) return null;

        // Fetch Mongo details
        const mongoGroup = await mongo.Grupo.findOne({ idGrupoSql: sqlRow.id });

        return new Grupo({
            id: sqlRow.id,
            clienteId: sqlRow.clienteId,
            nombre: this.securityService.descifrar(sqlRow.nombre),
            codigo_acceso: sqlRow.codigo_acceso,
            estado: sqlRow.estado,
            fecha_creacion: sqlRow.fecha_creacion,
            fecha_modificacion: sqlRow.fecha_modificacion,
            descripcion: mongoGroup?.descripcion || '',
            imagen: mongoGroup?.imagen || null,
            miembros: sqlRow.miembros || 0, // Should be populated by SQL query
            cliente_info: sqlRow.cliente_nombre ? {
                nombre: this.securityService.descifrar(sqlRow.cliente_nombre)
            } : null
        });
    }

    async save(grupo) {
        const formattedDate = this._formatDate(new Date());
        const nombreCifrado = this.securityService.cifrar(grupo.nombre);

        // 1. Save to MySQL
        const nuevoGrupoSQL = {
            clienteId: grupo.clienteId,
            nombre: nombreCifrado,
            codigo_acceso: grupo.codigo_acceso,
            estado: grupo.estado || 'activo',
            fecha_creacion: formattedDate,
        };

        const savedSQL = await orm.grupos.create(nuevoGrupoSQL);

        // 2. Save to Mongo
        const nuevoGrupoMongo = {
            idGrupoSql: savedSQL.id,
            descripcion: grupo.descripcion || '',
            imagen: grupo.imagen || '', // Or handle if file path
            estado: grupo.estado || 'activo',
            fecha_creacion: formattedDate
        };
        await mongo.Grupo.create(nuevoGrupoMongo);

        return await this.findById(savedSQL.id);
    }

    async findAll(filters = {}, incluirEliminados = false) {
        let query = `
            SELECT 
                g.id, 
                g.clienteId, 
                g.nombre,
                g.codigo_acceso, 
                g.estado, 
                g.fecha_creacion,
                g.fecha_modificacion,
                (SELECT COUNT(*) FROM clientes_grupos cg_count WHERE cg_count.grupoId = g.id AND cg_count.estado = 'activo') as miembros,
                c.nombre as cliente_nombre
            FROM 
                grupos g
            JOIN
                clientes c ON g.clienteId = c.id
        `;

        const conditions = [];
        const params = [];

        if (!incluirEliminados) {
            conditions.push("g.estado = 'activo'");
        }

        if (filters.clienteId) {
            conditions.push("g.clienteId = ?");
            params.push(filters.clienteId);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY g.fecha_creacion DESC";

        const [rows] = await sql.promise().query(query, params);

        // Map all in parallel
        return await Promise.all(rows.map(row => this._mapToEntity(row)));
    }

    async findById(id) {
        let query = `
            SELECT 
                g.id, 
                g.clienteId, 
                g.nombre,
                g.codigo_acceso, 
                g.estado, 
                g.fecha_creacion,
                g.fecha_modificacion,
                (SELECT COUNT(*) FROM clientes_grupos cg_count WHERE cg_count.grupoId = g.id AND cg_count.estado = 'activo') as miembros,
                 c.nombre as cliente_nombre
            FROM 
                grupos g
            JOIN
                clientes c ON g.clienteId = c.id
            WHERE 
                g.id = ?
        `;

        const [rows] = await sql.promise().query(query, [id]);
        if (rows.length === 0) return null;

        return await this._mapToEntity(rows[0]);
    }

    async findByCodigo(codigo) {
        let query = `
            SELECT id
            FROM grupos 
            WHERE codigo_acceso = ?
        `;
        // We just find ID and then call findById to get full object logic reuse
        const [rows] = await sql.promise().query(query, [codigo]);
        if (rows.length === 0) return null;

        return await this.findById(rows[0].id);
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());

        // Update SQL
        const camposSQL = [];
        const valoresSQL = [];

        if (data.nombre) {
            camposSQL.push('nombre = ?');
            valoresSQL.push(this.securityService.cifrar(data.nombre));
        }
        if (data.estado) {
            camposSQL.push('estado = ?');
            valoresSQL.push(data.estado);
        }
        // codigo_acceso usually not updated, but potentially could be.

        if (camposSQL.length > 0) {
            camposSQL.push('fecha_modificacion = ?');
            valoresSQL.push(formattedDate);
            valoresSQL.push(id);
            await sql.promise().query(`UPDATE grupos SET ${camposSQL.join(', ')} WHERE id = ?`, valoresSQL);
        }

        // Update Mongo
        const updateMongo = {};
        if (data.descripcion !== undefined) updateMongo.descripcion = data.descripcion;
        if (data.imagen !== undefined) updateMongo.imagen = data.imagen;
        if (data.estado !== undefined) updateMongo.estado = data.estado;

        if (Object.keys(updateMongo).length > 0) {
            updateMongo.fecha_modificacion = formattedDate;
            await mongo.Grupo.updateOne({ idGrupoSql: id }, { $set: updateMongo });
        }

        return await this.findById(id);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());

        const [result] = await sql.promise().query(
            "UPDATE grupos SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?",
            [formattedDate, id]
        );

        await mongo.Grupo.updateOne({ idGrupoSql: id }, { $set: { estado: 'eliminado', fecha_modificacion: formattedDate } });

        // Also soft delete members?
        await sql.promise().query(
            "UPDATE clientes_grupos SET estado = 'eliminado', fecha_modificacion = ? WHERE grupoId = ?",
            [formattedDate, id]
        );

        return result.affectedRows > 0;
    }
}

module.exports = MysqlMongoGrupoRepository;
