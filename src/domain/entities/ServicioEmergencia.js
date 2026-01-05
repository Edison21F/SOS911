class ServicioEmergencia {
    constructor({
        id,
        nombre,
        descripcion,
        telefono,
        estado,
        usuarioId,
        fecha_creacion,
        fecha_modificacion,
        // Joined Data
        usuario_info // { nombre, correo_electronico }
    }) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion || '';
        this.telefono = telefono;
        this.estado = estado || 'activo';
        this.usuarioId = usuarioId;
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.usuario_info = usuario_info || null;
    }
}

module.exports = ServicioEmergencia;
