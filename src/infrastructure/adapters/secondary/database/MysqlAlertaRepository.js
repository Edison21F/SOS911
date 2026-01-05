const IAlertaRepository = require('../../../../../domain/repositories/IAlertaRepository');
const Alerta = require('../../../../../domain/entities/Alerta');
const orm = require('../../../../database/connection/dataBase.orm');
const sql = require('../../../../database/connection/dataBase.sql');
const SecurityService = require('../../security/SecurityService');

const securityService = new SecurityService();

class MysqlAlertaRepository extends IAlertaRepository {

    _formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    _mapFromSql(row) {
        if (!row) return null;
        return new Alerta({
            id: row.id,
            clienteId: row.clienteId,
            ubicacionesClienteId: row.ubicacionesClienteId,
            marca_tiempo: row.marca_tiempo,
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            cliente_info: row.cliente_nombre ? {
                nombre: securityService.decrypt(row.cliente_nombre),
                correo_electronico: securityService.decrypt(row.cliente_correo)
            } : null,
            ubicacion_info: row.ubicacion_latitud ? {
                latitud: row.ubicacion_latitud,
                longitud: row.ubicacion_longitud
            } : null
        });
    }

    async save(alerta) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        const nuevaPresionSQL = {
            clienteId: alerta.clienteId,
            ubicacionesClienteId: alerta.ubicacionesClienteId,
            marca_tiempo: formattedNow,
            estado: alerta.estado,
            fecha_creacion: formattedNow,
        };

        const presionGuardadaSQL = await orm.presiones_boton_panico.create(nuevaPresionSQL);
        alerta.id = presionGuardadaSQL.id;

        // Return full object with joins
        return this.findById(alerta.id);
    }

    async findById(id) {
        const query = `
            SELECT 
                p.id, p.clienteId, p.ubicacionesClienteId, p.marca_tiempo, 
                p.fecha_creacion, p.fecha_modificacion, p.estado,
                c.nombre AS cliente_nombre, c.correo_electronico AS cliente_correo,
                uc.latitud AS ubicacion_latitud, uc.longitud AS ubicacion_longitud
            FROM presiones_boton_panicos p
            JOIN clientes c ON p.clienteId = c.id
            JOIN ubicaciones_clientes uc ON p.ubicacionesClienteId = uc.id 
            WHERE p.id = ?`; // Logic 'active' check depends on caller or we enforce it? Original: AND p.estado = 'activo'

        const [rows] = await sql.promise().query(query, [id]);
        return this._mapFromSql(rows[0]);
    }

    async findAll(incluirEliminados = false) {
        let query = `
            SELECT 
                p.id, p.clienteId, p.ubicacionesClienteId, p.marca_tiempo, 
                p.fecha_creacion, p.fecha_modificacion, p.estado,
                c.nombre AS cliente_nombre, c.correo_electronico AS cliente_correo,
                uc.latitud AS ubicacion_latitud, uc.longitud AS ubicacion_longitud
            FROM presiones_boton_panicos p
            JOIN clientes c ON p.clienteId = c.id
            JOIN ubicaciones_clientes uc ON p.ubicacionesClienteId = uc.id`;

        if (!incluirEliminados) {
            query += ` WHERE p.estado = 'activo'`;
        }
        query += ` ORDER BY p.marca_tiempo DESC`;

        const [rows] = await sql.promise().query(query);
        return rows.map(r => this._mapFromSql(r));
    }

    async update(alerta) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        const campos = [];
        const valores = [];

        if (alerta.marca_tiempo) { campos.push('marca_tiempo = ?'); valores.push(alerta.marca_tiempo); }
        if (alerta.estado) { campos.push('estado = ?'); valores.push(alerta.estado); }

        campos.push('fecha_modificacion = ?'); valores.push(formattedNow);
        valores.push(alerta.id);

        await sql.promise().query(`UPDATE presiones_boton_panicos SET ${campos.join(', ')} WHERE id = ?`, valores);

        return this.findById(alerta.id);
    }

    async delete(id) {
        const now = new Date();
        const formattedNow = this._formatDate(now);
        await sql.promise().query("UPDATE presiones_boton_panicos SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?", [formattedNow, id]);
        return true;
    }

    async validateDependencies(clienteId, ubicacionesClienteId) {
        const [cliente] = await sql.promise().query("SELECT id FROM clientes WHERE id = ? AND estado = 'activo'", [clienteId]);
        const [ubicacion] = await sql.promise().query("SELECT id FROM ubicaciones_clientes WHERE id = ? AND estado = 'activo'", [ubicacionesClienteId]);

        return {
            cliente: cliente.length > 0,
            ubicacion: ubicacion.length > 0
        };
    }
}

module.exports = MysqlAlertaRepository;
