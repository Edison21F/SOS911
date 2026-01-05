class ClienteNumero {
    constructor({
        id,
        clienteId,
        nombre,
        numero,
        estado,
        fecha_creacion,
        fecha_modificacion,
        // Joined Data
        cliente_info // { nombre, correo_electronico }
    }) {
        this.id = id;
        this.clienteId = clienteId;
        this.nombre = nombre;
        this.numero = numero;
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.cliente_info = cliente_info || null;
    }
}

module.exports = ClienteNumero;
