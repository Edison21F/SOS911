const IUsuarioRepository = require('../../../../../domain/repositories/IUsuarioRepository');
const Usuario = require('../../../../../domain/entities/Usuario');
const orm = require('../../../../database/connection/dataBase.orm');
const sql = require('../../../../database/connection/dataBase.sql');
const mongo = require('../../../../database/connection/dataBase.mongo');
const SecurityService = require('../../security/SecurityService');

// Instantiate security service (simple DI for now)
const securityService = new SecurityService();

/**
 * Implementation of IUsuarioRepository using MySQL and MongoDB.
 * Handles the hybrid persistence strategy.
 */
class MysqlMongoUsuarioRepository extends IUsuarioRepository {

    constructor() {
        super();
    }

    /**
     * Helper to format dates for SQL
     */
    _formatDate(date) {
        // Implementation from original controller
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * Map internal DB structure to Domain Entity
     */
    _toDomain(userSql, userMongo) {
        if (!userSql) return null;

        return new Usuario({
            id: userSql.id,
            nombre: securityService.decrypt(userSql.nombre),
            correo_electronico: securityService.decrypt(userSql.correo_electronico),
            cedula_identidad: securityService.decrypt(userSql.cedula_identidad),
            contrasena: userSql.contrasena_hash, // Usually we don't need this in domain, but might be needed for check
            estado: userSql.estado,
            fecha_nacimiento: userMongo?.fecha_nacimiento ? securityService.decrypt(userMongo.fecha_nacimiento) : null,
            direccion: userMongo?.direccion ? securityService.decrypt(userMongo.direccion) : null,
            fecha_creacion: userSql.fecha_creacion,
            fecha_modificacion: userSql.fecha_modificacion
        });
    }

    async save(usuario) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        // Prepare SQL Data
        const nuevoUsuarioSQL = {
            nombre: securityService.encrypt(usuario.nombre),
            correo_electronico: securityService.encrypt(usuario.correo_electronico),
            cedula_identidad: securityService.encrypt(usuario.cedula_identidad),
            contrasena_hash: securityService.encrypt(usuario.contrasena),
            estado: usuario.estado,
            fecha_creacion: formattedNow,
        };

        try {
            // Save to MySQL
            const usuarioGuardadoSQL = await orm.usuario.create(nuevoUsuarioSQL);
            const idUsuarioSql = usuarioGuardadoSQL.id;

            // Prepare Mongo Data
            const nuevoUsuarioMongo = {
                idUsuarioSql,
                fecha_nacimiento: securityService.encrypt(usuario.fecha_nacimiento),
                direccion: securityService.encrypt(usuario.direccion),
                estado: usuario.estado,
                fecha_creacion: formattedNow,
            };

            // Save to Mongo
            await mongo.Usuario.create(nuevoUsuarioMongo);

            // Return domain entity with new ID
            usuario.id = idUsuarioSql;
            return usuario;

        } catch (error) {
            console.error('Error saving user to DB:', error);
            throw new Error('Database Error: Could not save user');
        }
    }

    async findByEmail(email) {
        try {
            // We need to fetch ALL users to decrypt email check... 
            // This is a major performance flaw in the original design, but we must maintain parity.
            // PROPOSED IMPROVEMENT: If we can't change the DB encryption, we have to keep this.

            const [users] = await sql.promise().query("SELECT * FROM usuarios");
            const foundSql = users.find(u => securityService.decrypt(u.correo_electronico) === email);

            if (!foundSql) return null;

            // Fetch Mongo part
            const foundMongo = await mongo.Usuario.findOne({ idUsuarioSql: foundSql.id });

            return this._toDomain(foundSql, foundMongo);
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    async findByCedula(cedula) {
        try {
            // Same inefficiency issue as Email
            const [users] = await sql.promise().query("SELECT * FROM usuarios");
            const foundSql = users.find(u => securityService.decrypt(u.cedula_identidad) === cedula);

            if (!foundSql) return null;

            const foundMongo = await mongo.Usuario.findOne({ idUsuarioSql: foundSql.id });

            return this._toDomain(foundSql, foundMongo);
        } catch (error) {
            console.error('Error finding user by cedula:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const [users] = await sql.promise().query("SELECT * FROM usuarios WHERE id = ?", [id]);
            if (users.length === 0) return null;

            const userSql = users[0];
            const userMongo = await mongo.Usuario.findOne({ idUsuarioSql: id });

            return this._toDomain(userSql, userMongo);
        } catch (error) {
            console.error('Error finding user by id:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const [usersSql] = await sql.promise().query("SELECT * FROM usuarios WHERE estado = 'activo'");

            // This map/promise pattern is from the original controller
            const usuarios = await Promise.all(usersSql.map(async (userSql) => {
                const userMongo = await mongo.Usuario.findOne({ idUsuarioSql: userSql.id });
                return this._toDomain(userSql, userMongo);
            }));

            return usuarios;
        } catch (error) {
            console.error('Error finding all users:', error);
            throw error;
        }
    }

    async update(usuario) {
        try {
            const now = new Date();
            const formattedNow = this._formatDate(now);

            // Update SQL
            // Dynamic query building based on what changed is complex here because Domain Entity usually has all fields.
            // We will update everything that is present in the entity.

            const campos = [];
            const valores = [];

            if (usuario.nombre) { campos.push('nombre = ?'); valores.push(securityService.encrypt(usuario.nombre)); }
            if (usuario.correo_electronico) { campos.push('correo_electronico = ?'); valores.push(securityService.encrypt(usuario.correo_electronico)); }
            if (usuario.cedula_identidad) { campos.push('cedula_identidad = ?'); valores.push(securityService.encrypt(usuario.cedula_identidad)); }
            if (usuario.estado) { campos.push('estado = ?'); valores.push(usuario.estado); }
            if (usuario.contrasena) { campos.push('contrasena_hash = ?'); valores.push(securityService.encrypt(usuario.contrasena)); }

            campos.push('fecha_modificacion = ?'); valores.push(formattedNow);
            valores.push(usuario.id);

            const consultaSQL = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
            await sql.promise().query(consultaSQL, valores);

            // Update Mongo
            const datosParaMongo = {
                fecha_nacimiento: securityService.encrypt(usuario.fecha_nacimiento),
                direccion: securityService.encrypt(usuario.direccion),
                estado: usuario.estado,
                fecha_modificacion: formattedNow
            };

            // Remove undefined/nulls if original logic did so, but Domain Entity should be complete. 
            // We'll write what we have.

            await mongo.Usuario.updateOne({ idUsuarioSql: usuario.id }, { $set: datosParaMongo });

            // Return updated
            return this.findById(usuario.id);

        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const now = new Date();
            const formattedNow = this._formatDate(now);

            // Soft delete SQL
            await sql.promise().query("UPDATE usuarios SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?", [formattedNow, id]);

            // Soft delete Mongo
            await mongo.Usuario.updateOne({ idUsuarioSql: id }, { $set: { estado: 'eliminado', fecha_modificacion: formattedNow } });

            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    async countUsers() {
        const [rows] = await sql.promise().query('SELECT COUNT(*) AS total FROM usuarios');
        return rows[0].total;
    }

    async getMaxId() {
        const [rows] = await sql.promise().query('SELECT MAX(id) AS Maximo FROM usuarios');
        return rows[0].Maximo || 0;
    }
}

module.exports = MysqlMongoUsuarioRepository;
