class Rol {
    constructor({
        id,
        nombre,
        estado,
        fecha_creacion,
        fecha_modificacion
    }) {
        this.id = id;
        this.nombre = nombre;
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
    }
}

module.exports = Rol;
