const IEvaluacionSituacionRepository = require('../../../../../domain/repositories/IEvaluacionSituacionRepository');
const EvaluacionSituacion = require('../../../../../domain/entities/EvaluacionSituacion');
const orm = require('../../../database/connection/dataBase.orm');
const sql = require('../../../database/connection/dataBase.sql');
const { cifrarDato, descifrarDato } = require('../../../../../application/controller/encrypDates');

class MysqlEvaluacionSituacionRepository extends IEvaluacionSituacionRepository {
    constructor() {
        super();
    }

    _safeDecrypt(data) {
        try {
            return data ? descifrarDato(data) : '';
        } catch (error) {
            console.error('Error al descifrar datos (Repo):', error.message);
            return '';
        }
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

    async save(evaluacionData) {
        const formattedDate = this._formatDate(new Date());
        const detalleCifrado = evaluacionData.detalle ? cifrarDato(evaluacionData.detalle) : null;

        const nuevaEvaluacion = await orm.evaluaciones_situacion.create({
            notificacioneId: evaluacionData.notificacioneId,
            evaluacion: evaluacionData.evaluacion,
            detalle: detalleCifrado,
            estado: evaluacionData.estado || 'activo',
            fecha_creacion: formattedDate
        });

        // Return full enriched entity
        return this.findById(nuevaEvaluacion.id);
    }

    async findAll(incluirEliminados = false) {
        const estadoQuery = incluirEliminados ? "" : " WHERE es.estado = 'activo'";
        const [rows] = await sql.promise().query(
            `SELECT 
                es.id, 
                es.notificacioneId,  
                es.evaluacion, 
                es.detalle, 
                es.estado, 
                es.fecha_creacion, 
                es.fecha_modificacion,
                n.estado AS notificacion_estado,
                pbp.marca_tiempo AS presion_marca_tiempo,
                c.nombre AS cliente_nombre,
                c.correo_electronico AS cliente_correo
            FROM 
                evaluaciones_situaciones es
            JOIN 
                notificaciones n ON es.notificacioneId = n.id  
            JOIN
                presiones_boton_panicos pbp ON n.presionesBotonPanicoId = pbp.id
            JOIN
                clientes c ON pbp.clienteId = c.id
            ${estadoQuery}
            ORDER BY 
                es.fecha_creacion DESC`
        );

        return rows.map(row => new EvaluacionSituacion({
            id: row.id,
            notificacioneId: row.notificacioneId,
            evaluacion: row.evaluacion,
            detalle: this._safeDecrypt(row.detalle),
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            notificacion_info: { estado: row.notificacion_estado },
            presion_info: { marca_tiempo: row.presion_marca_tiempo },
            cliente_info: {
                nombre: this._safeDecrypt(row.cliente_nombre),
                correo_electronico: this._safeDecrypt(row.cliente_correo)
            }
        }));
    }

    async findById(id) {
        // Note: The controller logic for getById included "AND es.estado = 'activo'" explicitly.
        // But typically findById should find even if inactive unless specified otherwise.
        // However, looking at the controller 'getSituationEvaluationById', it has WHERE es.estado = 'activo'.
        // I will stick to finding it regardless of status here, but the Use Case or Controller can filter.
        // Wait, standard repository pattern for 'findById' usually returns the entity if it exists.
        // I'll return it if it exists, Use Case can check status if needed.

        const [rows] = await sql.promise().query(
            `SELECT 
                es.id, 
                es.notificacioneId, 
                es.evaluacion, 
                es.detalle, 
                es.estado, 
                es.fecha_creacion, 
                es.fecha_modificacion,
                n.estado AS notificacion_estado,
                pbp.marca_tiempo AS presion_marca_tiempo,
                c.nombre AS cliente_nombre,
                c.correo_electronico AS cliente_correo
            FROM 
                evaluaciones_situaciones es
            JOIN 
                notificaciones n ON es.notificacioneId = n.id
            JOIN
                presiones_boton_panicos pbp ON n.presionesBotonPanicoId = pbp.id
            JOIN
                clientes c ON pbp.clienteId = c.id
            WHERE 
                es.id = ?`,
            [id]
        );

        if (rows.length === 0) return null;
        const row = rows[0];

        return new EvaluacionSituacion({
            id: row.id,
            notificacioneId: row.notificacioneId,
            evaluacion: row.evaluacion,
            detalle: this._safeDecrypt(row.detalle),
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            notificacion_info: { estado: row.notificacion_estado },
            presion_info: { marca_tiempo: row.presion_marca_tiempo },
            cliente_info: {
                nombre: this._safeDecrypt(row.cliente_nombre),
                correo_electronico: this._safeDecrypt(row.cliente_correo)
            }
        });
    }

    async update(id, data) {
        const formattedDate = this._formatDate(new Date());
        const camposSQL = [];
        const valoresSQL = [];

        if (data.evaluacion !== undefined) {
            camposSQL.push('evaluacion = ?');
            valoresSQL.push(data.evaluacion);
        }
        if (data.detalle !== undefined) {
            camposSQL.push('detalle = ?');
            valoresSQL.push(cifrarDato(data.detalle));
        }
        if (data.estado !== undefined) {
            camposSQL.push('estado = ?');
            valoresSQL.push(data.estado);
        }

        if (camposSQL.length > 0) {
            camposSQL.push('fecha_modificacion = ?');
            valoresSQL.push(formattedDate);
            valoresSQL.push(id);

            await sql.promise().query(
                `UPDATE evaluaciones_situaciones SET ${camposSQL.join(', ')} WHERE id = ?`,
                valoresSQL
            );
        }

        return this.findById(id);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());
        await sql.promise().query(
            "UPDATE evaluaciones_situaciones SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?",
            [formattedDate, id]
        );
        return true;
    }
}

module.exports = MysqlEvaluacionSituacionRepository;
