/**
 * Domain Entity representing an Emergency Contact.
 */
class ContactoEmergencia {
    constructor({
        id,
        clienteId,
        idUsuarioContactoSql, // Optional: Link to another registered user
        nombre,
        descripcion,
        telefono,
        estado,
        fecha_creacion,
        fecha_modificacion,
        // Enriched info
        cliente_info
    }) {
        this.id = id;
        this.clienteId = clienteId;
        this.idUsuarioContactoSql = idUsuarioContactoSql;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.telefono = telefono;
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.cliente_info = cliente_info;
    }
}

module.exports = ContactoEmergencia;
