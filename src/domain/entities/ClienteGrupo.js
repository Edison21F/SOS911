class ClienteGrupo {
    constructor({
        id,
        clienteId,
        grupoId,
        estado,
        fecha_creacion,
        fecha_modificacion,
        cliente_info, // Optional: { nombre, correo_electronico }
        grupo_info    // Optional: { nombre, estado }
    }) {
        this.id = id;
        this.clienteId = clienteId;
        this.grupoId = grupoId;
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.cliente_info = cliente_info || null;
        this.grupo_info = grupo_info || null;
    }
}

module.exports = ClienteGrupo;
