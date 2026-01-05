class Notificacion {
    constructor({
        id,
        presionesBotonPanicoId,
        clienteId,
        recibido,
        respuesta,
        estado,
        fecha_creacion,
        fecha_modificacion,
        presion_info, // Optional: { marca_tiempo }
        cliente_info // Optional: { nombre, correo_electronico }
    }) {
        this.id = id;
        this.presionesBotonPanicoId = presionesBotonPanicoId;
        this.clienteId = clienteId;
        this.recibido = recibido || 0;
        this.respuesta = respuesta || 0;
        this.estado = estado || 'pendiente';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.presion_info = presion_info || null;
        this.cliente_info = cliente_info || null;
    }
}

module.exports = Notificacion;
