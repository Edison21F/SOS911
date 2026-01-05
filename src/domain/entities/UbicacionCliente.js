class UbicacionCliente {
    constructor({
        id,
        clienteId,
        latitud,
        longitud,
        marca_tiempo,
        estado,
        fecha_creacion,
        fecha_modificacion,
        // Joined Data
        cliente_info // { nombre, correo_electronico }
    }) {
        this.id = id;
        this.clienteId = clienteId;
        this.latitud = latitud;
        this.longitud = longitud;
        this.marca_tiempo = marca_tiempo;
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.cliente_info = cliente_info || null;
    }
}

module.exports = UbicacionCliente;
