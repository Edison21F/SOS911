const path = require('path');
const BASE_PATH = path.resolve(__dirname, '../../../..');
const IContactoClienteRepository = require(path.join(BASE_PATH, 'domain/repositories/IContactoClienteRepository'));
const ContactoCliente = require(path.join(BASE_PATH, 'domain/entities/ContactoCliente'));
const orm = require(path.join(BASE_PATH, 'infrastructure/database/connection/dataBase.orm'));
const sql = require(path.join(BASE_PATH, 'infrastructure/database/connection/dataBase.sql'));
const SecurityService = require(path.join(BASE_PATH, 'infrastructure/adapters/secondary/security/SecurityService'));

const securityService = new SecurityService();

class MysqlContactoClienteRepository extends IContactoClienteRepository {

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
        return new ContactoCliente({
            id: row.id,
            clienteId: row.clienteId,
            contactosEmergenciaId: row.contactosEmergenciaId,
            notificacioneId: row.notificacioneId,
            estado: row.estado,
            fecha_creacion: row.fecha_creacion,
            fecha_modificacion: row.fecha_modificacion,
            cliente_info: row.cliente_nombre ? {
                nombre: securityService.decrypt(row.cliente_nombre),
                correo_electronico: securityService.decrypt(row.cliente_correo)
            } : null,
            contacto_emergencia_info: row.contacto_emergencia_nombre ? {
                nombre: securityService.decrypt(row.contacto_emergencia_nombre),
                telefono: securityService.decrypt(row.contacto_emergencia_telefono)
            } : null,
            notificacion_info: row.notificacion_estado ? {
                estado: row.notificacion_estado
            } : null
        });
    }

    async validateDependencies(clienteId, contactosEmergenciaId, notificacioneId) {
        const [cliente] = await sql.promise().query("SELECT id FROM clientes WHERE id = ? AND estado = 'activo'", [clienteId]);
        const [contacto] = await sql.promise().query("SELECT id FROM contactos_emergencias WHERE id = ? AND estado = 'activo'", [contactosEmergenciaId]);
        const [notificacion] = await sql.promise().query("SELECT id FROM notificaciones WHERE id = ? AND estado != 'eliminado'", [notificacioneId]);

        return {
            cliente: cliente.length > 0,
            contactoEmergencia: contacto.length > 0,
            notificacion: notificacion.length > 0
        };
    }

    async exists(clienteId, contactosEmergenciaId, notificacioneId) {
        const [rows] = await sql.promise().query(
            "SELECT id FROM contactos_clientes WHERE clienteId = ? AND contactosEmergenciaId = ? AND notificacioneId = ? AND estado = 'activo'",
            [clienteId, contactosEmergenciaId, notificacioneId]
        );
        return rows.length > 0;
    }

    async incrementNotificationCounter(notificacioneId) {
        const now = new Date();
        const formattedNow = this._formatDate(now);
        await sql.promise().query(
            "UPDATE notificaciones SET recibido = IFNULL(recibido, 0) + 1, fecha_modificacion = ? WHERE id = ?",
            [formattedNow, notificacioneId]
        );
    }

    async save(contactoCliente) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        const nuevaRelacion = await orm.contactos_clientes.create({
            clienteId: contactoCliente.clienteId,
            contactosEmergenciaId: contactoCliente.contactosEmergenciaId,
            notificacioneId: contactoCliente.notificacioneId,
            estado: contactoCliente.estado,
            fecha_creacion: formattedNow,
        });

        // Map ID back to entity
        contactoCliente.id = nuevaRelacion.id;

        return this.findById(contactoCliente.id);
    }

    async findById(id) {
        const query = `
            SELECT 
                cc.id, cc.clienteId, cc.contactosEmergenciaId, cc.notificacioneId, 
                cc.estado, cc.fecha_creacion, cc.fecha_modificacion,
                c.nombre AS cliente_nombre, c.correo_electronico AS cliente_correo,
                ce.nombre AS contacto_emergencia_nombre, ce.telefono AS contacto_emergencia_telefono,
                n.estado AS notificacion_estado
            FROM contactos_clientes cc
            JOIN clientes c ON cc.clienteId = c.id
            JOIN contactos_emergencias ce ON cc.contactosEmergenciaId = ce.id
            JOIN notificaciones n ON cc.notificacioneId = n.id
            WHERE cc.id = ? AND cc.estado = 'activo'
        `;
        const [rows] = await sql.promise().query(query, [id]);
        return this._mapFromSql(rows[0]);
    }

    async findAll(incluirEliminados = false) {
        let query = `
            SELECT 
                cc.id, cc.clienteId, cc.contactosEmergenciaId, cc.notificacioneId, 
                cc.estado, cc.fecha_creacion, cc.fecha_modificacion,
                c.nombre AS cliente_nombre, c.correo_electronico AS cliente_correo,
                ce.nombre AS contacto_emergencia_nombre, ce.telefono AS contacto_emergencia_telefono,
                n.estado AS notificacion_estado
            FROM contactos_clientes cc
            JOIN clientes c ON cc.clienteId = c.id
            JOIN contactos_emergencias ce ON cc.contactosEmergenciaId = ce.id
            JOIN notificaciones n ON cc.notificacioneId = n.id
        `;

        if (!incluirEliminados) {
            query += " WHERE cc.estado = 'activo'";
        }
        query += " ORDER BY cc.fecha_creacion DESC";

        const [rows] = await sql.promise().query(query);
        return rows.map(r => this._mapFromSql(r));
    }

    async update(contactoCliente) {
        const now = new Date();
        const formattedNow = this._formatDate(now);

        // Typically only 'estado' is updated here based on controller logic
        await sql.promise().query(
            "UPDATE contactos_clientes SET estado = ?, fecha_modificacion = ? WHERE id = ?",
            [contactoCliente.estado, formattedNow, contactoCliente.id]
        );

        return this.findById(contactoCliente.id);
    }

    async delete(id) {
        const now = new Date();
        const formattedNow = this._formatDate(now);
        await sql.promise().query("UPDATE contactos_clientes SET estado = 'eliminado', fecha_modificacion = ? WHERE id = ?", [formattedNow, id]);
        return true;
    }
}

module.exports = MysqlContactoClienteRepository;
