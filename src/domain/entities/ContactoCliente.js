/**
 * Domain Entity representing a Client Contact relation (Client -> Emergency Contact -> Notification).
 */
class ContactoCliente {
    constructor({
        id,
        clienteId,
        contactosEmergenciaId,
        notificacioneId,
        estado,
        fecha_creacion,
        fecha_modificacion,
        // Optional expanded info
        cliente_info,
        contacto_emergencia_info,
        notificacion_info
    }) {
        this.id = id;
        this.clienteId = clienteId;
        this.contactosEmergenciaId = contactosEmergenciaId;
        this.notificacioneId = notificacioneId;
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.cliente_info = cliente_info;
        this.contacto_emergencia_info = contacto_emergencia_info;
        this.notificacion_info = notificacion_info;
    }
}

module.exports = ContactoCliente;
