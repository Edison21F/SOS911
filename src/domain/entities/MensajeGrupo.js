class MensajeGrupo {
    constructor({
        id,
        grupoId,
        clienteId,
        mensaje,
        fecha_envio,
        tipo_mensaje,
        estado,
        fecha_creacion,
        fecha_modificacion,
        cliente_info // Optional: { nombre, correo_electronico }
    }) {
        this.id = id;
        this.grupoId = grupoId;
        this.clienteId = clienteId;
        this.mensaje = mensaje;
        this.fecha_envio = fecha_envio;
        this.tipo_mensaje = tipo_mensaje || 'texto';
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.cliente_info = cliente_info || null;
    }
}

module.exports = MensajeGrupo;
