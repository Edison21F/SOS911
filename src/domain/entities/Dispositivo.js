class Dispositivo {
    constructor({
        id,
        clienteId,
        token_dispositivo,
        tipo_dispositivo,
        modelo_dispositivo,
        estado,
        fecha_creacion,
        fecha_modificacion,
        cliente_info // Optional: { nombre, correo_electronico, cedula_identidad }
    }) {
        this.id = id;
        this.clienteId = clienteId;
        this.token_dispositivo = token_dispositivo;
        this.tipo_dispositivo = tipo_dispositivo;
        this.modelo_dispositivo = modelo_dispositivo;
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.cliente_info = cliente_info || null;
    }
}

module.exports = Dispositivo;
