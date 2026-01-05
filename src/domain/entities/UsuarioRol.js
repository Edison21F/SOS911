class UsuarioRol {
    constructor({
        id,
        usuarioId,
        roleId,
        estado,
        fecha_creacion,
        fecha_modificacion,
        // Optional joined data
        usuario_info, // { nombre, correo_electronico }
        rol_info      // { nombre }
    }) {
        this.id = id;
        this.usuarioId = usuarioId; // Foreign Key
        this.roleId = roleId;       // Foreign Key
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.usuario_info = usuario_info || null;
        this.rol_info = rol_info || null;
    }
}

module.exports = UsuarioRol;
