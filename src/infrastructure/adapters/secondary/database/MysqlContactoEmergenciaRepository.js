const IContactoEmergenciaRepository = require('../../../../../domain/repositories/IContactoEmergenciaRepository');
const ContactoEmergencia = require('../../../../../domain/entities/ContactoEmergencia');
const orm = require('../../../../database/connection/dataBase.orm');
const sql = require('../../../../database/connection/dataBase.sql');
const SecurityService = require('../../security/SecurityService');

const securityService = new SecurityService();

class MysqlContactoEmergenciaRepository extends IContactoEmergenciaRepository {

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
        return new ContactoEmergencia({
            id: row.id,
            clienteId: row.clienteId,
            idUsuarioContactoSql: row.idUsuarioContactoSql,
            nombre: row.nombre ? securityService.decrypt(row.nombre) : '',
            descripcion: row.descripcion ? securityService.decrypt(row.descripcion) : '',
            telefono: row.telefono ? securityService.decrypt(row.telefono) : '',
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            cliente_info: (row.cliente_nombre) ? {
                nombre: securityService.decrypt(row.cliente_nombre),
                correo_electronico: row.cliente_correo ? securityService.decrypt(row.cliente_correo) : null
            } : null
        });
    }

    async save(contacto) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        const data = {
            clienteId: contacto.clienteId,
            nombre: securityService.encrypt(contacto.nombre),
            descripcion: contacto.descripcion ? securityService.encrypt(contacto.descripcion) : null,
            telefono: contacto.telefono ? securityService.encrypt(contacto.telefono) : null,
            estado: contacto.estado,
            fecha_creacion: formattedNow,
        };

        if (contacto.idUsuarioContactoSql) {
            data.idUsuarioContactoSql = contacto.idUsuarioContactoSql;
        }

        const nuevoContacto = await orm.contactos_emergencia.create(data);
        contacto.id = nuevoContacto.id;

        // Return full entity (re-fetch to be safe or just return mapped)
        return this.findById(contacto.id);
    }

    async findById(id) {
        const [rows] = await sql.promise().query(
            "SELECT * FROM contactos_emergencias WHERE id = ? AND estado != 'eliminado'",
            [id]
        );
        if (rows.length === 0) return null;
        return this._mapFromSql(rows[0]);
    }

    async findAllActive(incluirEliminados = false) {
        let query = `
            SELECT 
                ce.*,
                c.nombre AS cliente_nombre,
                c.correo_electronico AS cliente_correo
            FROM contactos_emergencias ce
            JOIN clientes c ON ce.clienteId = c.id
        `;

        if (!incluirEliminados) {
            query += " WHERE ce.estado IN ('activo', 'VINCULADO', 'PENDIENTE')";
        }
        query += " ORDER BY ce.fecha_creacion DESC";

        const [rows] = await sql.promise().query(query);
        return rows.map(r => this._mapFromSql(r));
    }

    async findByClienteId(clienteId) {
        const contactos = await orm.contactos_emergencia.findAll({
            where: {
                clienteId: clienteId,
                estado: ['activo', 'VINCULADO']
            },
            order: [['fecha_creacion', 'DESC']]
        });

        return contactos.map(c => new ContactoEmergencia({
            id: c.id,
            clienteId: c.clienteId,
            idUsuarioContactoSql: c.idUsuarioContactoSql,
            nombre: c.nombre ? securityService.decrypt(c.nombre) : '',
            descripcion: c.descripcion ? securityService.decrypt(c.descripcion) : '',
            telefono: c.telefono ? securityService.decrypt(c.telefono) : '',
            estado: c.estado,
            fecha_creacion: c.fecha_creacion,
            fecha_modificacion: c.fecha_modificacion
        }));
    }

    async update(contacto) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        const camposSQL = ['fecha_modificacion = ?'];
        const valoresSQL = [formattedNow];

        if (contacto.nombre !== undefined) {
            camposSQL.push('nombre = ?');
            valoresSQL.push(securityService.encrypt(contacto.nombre));
        }
        if (contacto.descripcion !== undefined) {
            camposSQL.push('descripcion = ?');
            valoresSQL.push(securityService.encrypt(contacto.descripcion));
        }
        if (contacto.telefono !== undefined) {
            camposSQL.push('telefono = ?');
            valoresSQL.push(securityService.encrypt(contacto.telefono));
        }
        if (contacto.estado !== undefined) {
            camposSQL.push('estado = ?');
            valoresSQL.push(contacto.estado);
        }

        valoresSQL.push(contacto.id);
        const consultaSQL = `UPDATE contactos_emergencias SET ${camposSQL.join(', ')} WHERE id = ?`;

        await sql.promise().query(consultaSQL, valoresSQL);
        return this.findById(contacto.id);
    }

    async delete(id) {
        const now = new Date();
        const formattedNow = this._formatDate(now);
        await sql.promise().query("UPDATE contactos_emergencias SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?", [formattedNow, id]);
        return true;
    }

    async findDuplicate(clienteId, nombre) {
        const nombreCifrado = securityService.encrypt(nombre);
        const [rows] = await sql.promise().query(
            "SELECT id FROM contactos_emergencias WHERE clienteId = ? AND nombre = ? AND estado = 'activo'",
            [clienteId, nombreCifrado]
        );
        return rows.length > 0;
    }

    async findPendingRequests(userId) {
        const [rows] = await sql.promise().query(
            `SELECT 
                ce.id, ce.clienteId AS requesterId, c.nombre, ce.fecha_creacion
             FROM contactos_emergencias ce
             JOIN clientes c ON ce.clienteId = c.id
             WHERE ce.idUsuarioContactoSql = ? AND ce.estado = 'PENDIENTE'`,
            [userId]
        );
        // Map manually as this is a specific projection
        return rows.map(r => ({
            id: r.id,
            requesterId: r.requesterId,
            nombre: securityService.decrypt(r.nombre),
            fecha: r.fecha_creacion
        }));
    }

    async findExistingVinculation(clienteId, idUsuarioContactoSql) {
        const [rows] = await sql.promise().query(
            "SELECT id, estado FROM contactos_emergencias WHERE clienteId = ? AND idUsuarioContactoSql = ? AND estado != 'eliminado'",
            [clienteId, idUsuarioContactoSql]
        );
        return rows[0] || null;
    }

    async findInverseVinculation(accepterId, requesterId) {
        const [rows] = await sql.promise().query(
            "SELECT id FROM contactos_emergencias WHERE clienteId = ? AND idUsuarioContactoSql = ?",
            [accepterId, requesterId]
        );
        return rows[0] || null;
    }
}

module.exports = MysqlContactoEmergenciaRepository;
