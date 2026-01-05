class Grupo {
    constructor({
        id,
        clienteId,
        nombre,
        codigo_acceso,
        estado,
        fecha_creacion,
        fecha_modificacion,
        descripcion, // From MongoDB
        imagen,      // From MongoDB or file path
        miembros,    // Calculated count
        cliente_info // Optional creator info
    }) {
        this.id = id;
        this.clienteId = clienteId;
        this.nombre = nombre;
        this.codigo_acceso = codigo_acceso;
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.descripcion = descripcion || '';
        this.imagen = imagen || null;
        this.miembros = miembros || 0;
        this.cliente_info = cliente_info || null;
    }
}

module.exports = Grupo;
