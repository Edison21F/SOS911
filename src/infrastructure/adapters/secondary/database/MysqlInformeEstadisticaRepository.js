const IInformeEstadisticaRepository = require('../../../../domain/repositories/IInformeEstadisticaRepository');
const InformeEstadistica = require('../../../../domain/entities/InformeEstadistica');
const orm = require('../../../database/connection/dataBase.orm.js');
const sql = require('../../../database/connection/dataBase.sql.js');
const { descifrarDato } = require('../../../../application/controller/encrypDates');

class MysqlInformeEstadisticaRepository extends IInformeEstadisticaRepository {
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

    async save(data) {
        const formattedDate = this._formatDate(new Date());

        const nuevoInforme = await orm.informes_estadisticas.create({
            presionesBotonPanicoId: data.presionesBotonPanicoId,
            numero_notificaciones: data.numero_notificaciones || 0,
            numero_respuestas: data.numero_respuestas || 0,
            evaluaciones_SOS: data.evaluaciones_SOS || 0,
            evaluaciones_911: data.evaluaciones_911 || 0,
            evaluaciones_innecesaria: data.evaluaciones_innecesaria || 0,
            estado: data.estado || 'activo',
            fecha_creacion: formattedDate
        });

        return this.findById(nuevoInforme.id);
    }

    async findAll(incluirEliminados = false) {
        const estadoQuery = incluirEliminados ? "" : " WHERE ie.estado = 'activo'";
        const [rows] = await sql.promise().query(
            `SELECT 
                ie.id, 
                ie.presionesBotonPanicoId, 
                ie.numero_notificaciones,
                ie.numero_respuestas,
                ie.evaluaciones_SOS,
                ie.evaluaciones_911,
                ie.evaluaciones_innecesaria,
                ie.estado,
                ie.fecha_creacion, 
                ie.fecha_modificacion,
                pbp.marca_tiempo AS presion_marca_tiempo,
                c.nombre AS cliente_nombre,
                c.correo_electronico AS cliente_correo
            FROM 
                informes_estadisticas ie
            JOIN 
                presiones_boton_panicos pbp ON ie.presionesBotonPanicoId = pbp.id
            JOIN
                clientes c ON pbp.clienteId = c.id
            ${estadoQuery}
            ORDER BY 
                ie.fecha_creacion DESC`
        );

        return rows.map(row => new InformeEstadistica({
            id: row.id,
            presionesBotonPanicoId: row.presionesBotonPanicoId,
            numero_notificaciones: row.numero_notificaciones,
            numero_respuestas: row.numero_respuestas,
            evaluaciones_SOS: row.evaluaciones_SOS,
            evaluaciones_911: row.evaluaciones_911,
            evaluaciones_innecesaria: row.evaluaciones_innecesaria,
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            presion_info: { marca_tiempo: row.presion_marca_tiempo },
            cliente_info: {
                nombre: this._safeDecrypt(row.cliente_nombre),
                correo_electronico: this._safeDecrypt(row.cliente_correo)
            }
        }));
    }

    async findById(id) {
        const [rows] = await sql.promise().query(
            `SELECT 
                ie.id, 
                ie.presionesBotonPanicoId, 
                ie.numero_notificaciones,
                ie.numero_respuestas,
                ie.evaluaciones_SOS,
                ie.evaluaciones_911,
                ie.evaluaciones_innecesaria,
                ie.estado,
                ie.fecha_creacion, 
                ie.fecha_modificacion,
                pbp.marca_tiempo AS presion_marca_tiempo,
                c.nombre AS cliente_nombre,
                c.correo_electronico AS cliente_correo
            FROM 
                informes_estadisticas ie
            JOIN 
                presiones_boton_panicos pbp ON ie.presionesBotonPanicoId = pbp.id
            JOIN
                clientes c ON pbp.clienteId = c.id
            WHERE 
                ie.id = ?`,
            [id]
        );

        if (rows.length === 0) return null;
        const row = rows[0];

        return new InformeEstadistica({
            id: row.id,
            presionesBotonPanicoId: row.presionesBotonPanicoId,
            numero_notificaciones: row.numero_notificaciones,
            numero_respuestas: row.numero_respuestas,
            evaluaciones_SOS: row.evaluaciones_SOS,
            evaluaciones_911: row.evaluaciones_911,
            evaluaciones_innecesaria: row.evaluaciones_innecesaria,
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
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

        if (data.numero_notificaciones !== undefined) { camposSQL.push('numero_notificaciones = ?'); valoresSQL.push(data.numero_notificaciones); }
        if (data.numero_respuestas !== undefined) { camposSQL.push('numero_respuestas = ?'); valoresSQL.push(data.numero_respuestas); }
        if (data.evaluaciones_SOS !== undefined) { camposSQL.push('evaluaciones_SOS = ?'); valoresSQL.push(data.evaluaciones_SOS); }
        if (data.evaluaciones_911 !== undefined) { camposSQL.push('evaluaciones_911 = ?'); valoresSQL.push(data.evaluaciones_911); }
        if (data.evaluaciones_innecesaria !== undefined) { camposSQL.push('evaluaciones_innecesaria = ?'); valoresSQL.push(data.evaluaciones_innecesaria); }
        if (data.estado !== undefined) { camposSQL.push('estado = ?'); valoresSQL.push(data.estado); }

        if (camposSQL.length > 0) {
            camposSQL.push('fecha_modificacion = ?');
            valoresSQL.push(formattedDate);
            valoresSQL.push(id);

            await sql.promise().query(
                `UPDATE informes_estadisticas SET ${camposSQL.join(', ')} WHERE id = ?`,
                valoresSQL
            );
        }

        return this.findById(id);
    }

    async delete(id) {
        const formattedDate = this._formatDate(new Date());
        await sql.promise().query(
            "UPDATE informes_estadisticas SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?",
            [formattedDate, id]
        );
        return true;
    }
}

module.exports = MysqlInformeEstadisticaRepository;
