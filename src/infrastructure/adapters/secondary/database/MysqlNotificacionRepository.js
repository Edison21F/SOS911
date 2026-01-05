const INotificacionRepository = require('../../../../../domain/repositories/INotificacionRepository');
const Notificacion = require('../../../../../domain/entities/Notificacion');
const orm = require('../../../database/connection/dataBase.orm');
const sql = require('../../../database/connection/dataBase.sql');
const SecurityService = require('../../security/SecurityService');

class MysqlNotificacionRepository extends INotificacionRepository {
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
        return new Notificacion({
            id: row.id,
            presionesBotonPanicoId: row.presionesBotonPanicoId,
            clienteId: row.clienteId,
            recibido: row.recibido,
            respuesta: row.respuesta,
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            presion_info: {
                marca_tiempo: row.presion_marca_tiempo
            },
            cliente_info: {
                nombre: this.securityService.descifrar(row.cliente_nombre),
                correo_electronico: this.securityService.descifrar(row.cliente_correo)
            }
        });
    }

    async save(notificacion) {
        const formattedDate = this._formatDate(new Date());

        // Verify dependencies
        const [existingPresionSQL] = await sql.promise().query("SELECT id FROM presiones_boton_panicos WHERE id = ? AND estado = 'activo'", [notificacion.presionesBotonPanicoId]);
        if (existingPresionSQL.length === 0) throw new Error('Presión del botón de pánico no encontrada o inactiva.');

        const [existingClienteSQL] = await sql.promise().query("SELECT id FROM clientes WHERE id = ? AND estado = 'activo'", [notificacion.clienteId]);
        if (existingClienteSQL.length === 0) throw new Error('Cliente no encontrado o inactivo.');

        // Save
        const nuevaNotificacionSQL = {
            presionesBotonPanicoId: notificacion.presionesBotonPanicoId,
            clienteId: notificacion.clienteId,
            recibido: 0,
            respuesta: 0,
            estado: notificacion.estado || 'pendiente',
            fecha_creacion: formattedDate,
        };
        const saved = await orm.notificaciones.create(nuevaNotificacionSQL);

        // Fetch full entity with joins for return
        return await this.findById(saved.id);
    }

    async findAll(incluirEliminados = false) {
        const estadoQuery = incluirEliminados ? "" : " WHERE n.estado != 'eliminado'";
        const query = `
            SELECT 
                n.id, n.presionesBotonPanicoId, n.clienteId, n.recibido, n.respuesta, n.estado, n.fecha_creacion, n.fecha_modificacion,
                pbp.marca_tiempo AS presion_marca_tiempo,
                c.nombre AS cliente_nombre, c.correo_electronico AS cliente_correo
            FROM notificaciones n
            JOIN presiones_boton_panicos pbp ON n.presionesBotonPanicoId = pbp.id 
            JOIN clientes c ON n.clienteId = c.id 
            ${estadoQuery}
            ORDER BY n.fecha_creacion DESC
        `;
        const [rows] = await sql.promise().query(query);
        return rows.map(row => this._mapRowToEntity(row));
    }

    async findById(id) {
        const query = `
            SELECT 
                n.id, n.presionesBotonPanicoId, n.clienteId, n.recibido, n.respuesta, n.estado, n.fecha_creacion, n.fecha_modificacion,
                pbp.marca_tiempo AS presion_marca_tiempo,
                c.nombre AS cliente_nombre, c.correo_electronico AS cliente_correo
            FROM notificaciones n
            JOIN presiones_boton_panicos pbp ON n.presionesBotonPanicoId = pbp.id 
            JOIN clientes c ON n.clienteId = c.id 
            WHERE n.id = ?
        `;
        const [rows] = await sql.promise().query(query, [id]);
        if (rows.length === 0) return null;
        return this._mapRowToEntity(rows[0]);
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());

        // Check existence
        const [existing] = await sql.promise().query("SELECT id FROM notificaciones WHERE id = ? AND estado != 'eliminado'", [id]);
        if (existing.length === 0) return null;

        const camposSQL = [];
        const valoresSQL = [];

        // Logic for 'recibido'
        if (data.recibido !== undefined) {
            if (data.recibido === true || data.recibido === 'true' || data.recibido === 1) {
                camposSQL.push('recibido = IFNULL(recibido, 0) + 1');
            } else if (data.recibido === false || data.recibido === 'false' || data.recibido === 0) {
                camposSQL.push('recibido = ?');
                valoresSQL.push(0);
            }
        }

        // Logic for 'respuesta'
        if (data.respuesta !== undefined) {
            if (data.respuesta === true || data.respuesta === 'true' || data.respuesta === 1) {
                camposSQL.push('respuesta = IFNULL(respuesta, 0) + 1');
            } else if (data.respuesta === false || data.respuesta === 'false' || data.respuesta === 0) {
                camposSQL.push('respuesta = ?');
                valoresSQL.push(0);
            }
        }

        if (data.estado !== undefined) {
            camposSQL.push('estado = ?');
            valoresSQL.push(data.estado);
        }

        if (camposSQL.length === 0) return await this.findById(id);

        camposSQL.push('fecha_modificacion = ?');
        valoresSQL.push(formattedDate);
        valoresSQL.push(id);

        await sql.promise().query(`UPDATE notificaciones SET ${camposSQL.join(', ')} WHERE id = ?`, valoresSQL);

        return await this.findById(id);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());
        const [result] = await sql.promise().query("UPDATE notificaciones SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ? AND estado != 'eliminado'", [formattedDate, id]);
        return result.affectedRows > 0;
    }
    async incrementRespuesta(id) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        await sql.promise().query(
            "UPDATE notificaciones SET respuesta = IFNULL(respuesta, 0) + 1, fecha_modificacion = ? WHERE id = ?",
            [formattedDate, id]
        );
    }
}

module.exports = MysqlNotificacionRepository;
