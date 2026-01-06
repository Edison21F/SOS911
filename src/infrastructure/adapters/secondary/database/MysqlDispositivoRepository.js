const path = require('path');
const BASE_PATH = path.resolve(__dirname, '../../../..');
const IDispositivoRepository = require(path.join(BASE_PATH, 'domain/repositories/IDispositivoRepository'));
const Dispositivo = require(path.join(BASE_PATH, 'domain/entities/Dispositivo'));
const orm = require(path.join(BASE_PATH, 'infrastructure/database/connection/dataBase.orm'));
const sql = require(path.join(BASE_PATH, 'infrastructure/database/connection/dataBase.sql'));
const SecurityService = require(path.join(BASE_PATH, 'infrastructure/adapters/secondary/security/SecurityService'));

class MysqlDispositivoRepository extends IDispositivoRepository {
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
        return new Dispositivo({
            id: row.id,
            clienteId: row.clienteId,
            token_dispositivo: this.securityService.descifrar(row.token_dispositivo),
            tipo_dispositivo: this.securityService.descifrar(row.tipo_dispositivo),
            modelo_dispositivo: this.securityService.descifrar(row.modelo_dispositivo),
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            cliente_info: row.cliente_nombre ? {
                nombre: this.securityService.descifrar(row.cliente_nombre),
                correo_electronico: this.securityService.descifrar(row.cliente_correo),
                cedula_identidad: row.cliente_cedula ? this.securityService.descifrar(row.cliente_cedula) : null
            } : null
        });
    }

    async save(dispositivo) {
        const formattedDate = this._formatDate(new Date());

        const tokenCifrado = this.securityService.cifrar(dispositivo.token_dispositivo);
        const tipoCifrado = this.securityService.cifrar(dispositivo.tipo_dispositivo);
        const modeloCifrado = this.securityService.cifrar(dispositivo.modelo_dispositivo);

        const nuevoDispositivo = {
            clienteId: dispositivo.clienteId,
            token_dispositivo: tokenCifrado,
            tipo_dispositivo: tipoCifrado,
            modelo_dispositivo: modeloCifrado,
            estado: dispositivo.estado || 'activo',
            fecha_creacion: formattedDate,
        };

        const saved = await orm.dispositivos.create(nuevoDispositivo);
        return await this.findById(saved.id);
    }

    async findAll(incluirEliminados = false) {
        let query = `
            SELECT 
                d.id, d.clienteId, d.token_dispositivo, d.tipo_dispositivo, d.modelo_dispositivo, 
                d.estado, d.fecha_creacion, d.fecha_modificacion,
                c.nombre AS cliente_nombre, c.correo_electronico AS cliente_correo, c.cedula_identidad AS cliente_cedula
            FROM dispositivos d
            JOIN clientes c ON d.clienteId = c.id
        `;
        if (!incluirEliminados) {
            query += ` WHERE d.estado = 'activo'`;
        }
        query += ` ORDER BY d.fecha_creacion DESC`;

        const [rows] = await sql.promise().query(query);
        return rows.map(row => this._mapRowToEntity(row));
    }

    async findById(id) {
        const query = `
            SELECT 
                 d.id, d.clienteId, d.token_dispositivo, d.tipo_dispositivo, d.modelo_dispositivo, 
                 d.estado, d.fecha_creacion, d.fecha_modificacion,
                 c.nombre AS cliente_nombre, c.correo_electronico AS cliente_correo, c.cedula_identidad AS cliente_cedula
            FROM dispositivos d
            JOIN clientes c ON d.clienteId = c.id
            WHERE d.id = ? AND d.estado = 'activo'
        `;
        const [rows] = await sql.promise().query(query, [id]);
        if (rows.length === 0) return null;
        return this._mapRowToEntity(rows[0]);
    }

    async findByToken(clienteId, token) {
        const tokenCifrado = this.securityService.cifrar(token);
        const [rows] = await sql.promise().query(
            "SELECT id FROM dispositivos WHERE clienteId = ? AND token_dispositivo = ?",
            [clienteId, tokenCifrado]
        );
        if (rows.length === 0) return null;
        // Optimization: return minimal object or just true/false? Interface returns Dispositivo.
        // Let's create a minimal proxy or fetch full. Fetching full is safer.
        return await this.findById(rows[0].id);
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());

        const [existing] = await sql.promise().query("SELECT id FROM dispositivos WHERE id = ? AND estado = 'activo'", [id]);
        if (existing.length === 0) return null;

        const camposSQL = [];
        const valoresSQL = [];

        if (data.token_dispositivo !== undefined) {
            camposSQL.push('token_dispositivo = ?');
            valoresSQL.push(this.securityService.cifrar(data.token_dispositivo));
        }
        if (data.tipo_dispositivo !== undefined) {
            camposSQL.push('tipo_dispositivo = ?');
            valoresSQL.push(this.securityService.cifrar(data.tipo_dispositivo));
        }
        if (data.modelo_dispositivo !== undefined) {
            camposSQL.push('modelo_dispositivo = ?');
            valoresSQL.push(this.securityService.cifrar(data.modelo_dispositivo));
        }
        if (data.estado !== undefined) {
            camposSQL.push('estado = ?');
            valoresSQL.push(data.estado);
        }

        if (camposSQL.length === 0) return await this.findById(id);

        camposSQL.push('fecha_modificacion = ?');
        valoresSQL.push(formattedDate);
        valoresSQL.push(id);

        await sql.promise().query(`UPDATE dispositivos SET ${camposSQL.join(', ')} WHERE id = ?`, valoresSQL);

        return await this.findById(id);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());
        const [result] = await sql.promise().query(
            "UPDATE dispositivos SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?",
            [formattedDate, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = MysqlDispositivoRepository;
