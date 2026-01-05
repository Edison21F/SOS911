class UsuarioNumero {
    constructor({
        id,
        usuarioId,
        nombre,
        numero,
        estado,
        fecha_creacion,
        fecha_modificacion,
        // Joined Data
        usuario_info // { nombre, correo_electronico }
    }) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.nombre = nombre;
        this.numero = numero;
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.usuario_info = usuario_info || null;
    }
}

module.exports = UsuarioNumero;
