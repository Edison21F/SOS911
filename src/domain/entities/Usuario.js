/**
 * Domain Entity representing a User (Usuario).
 * Independent of database implementation (SQL/Mongo).
 */
class Usuario {
    constructor({
        id,
        nombre,
        correo_electronico,
        cedula_identidad,
        contrasena, // Raw password (only present during registration/login logic)
        fecha_nacimiento,
        direccion,
        estado,
        fecha_creacion,
        fecha_modificacion,
        // Preferences could be a sub-entity or separate, keeping simple for now
    }) {
        this.id = id;
        this.nombre = nombre;
        this.correo_electronico = correo_electronico;
        this.cedula_identidad = cedula_identidad;
        this.contrasena = contrasena;
        this.fecha_nacimiento = fecha_nacimiento;
        this.direccion = direccion;
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
    }

    // Domain methods can be added here (e.g., validateEmail format, checkIsActive)

    isActive() {
        return this.estado === 'activo';
    }
}

module.exports = Usuario;
