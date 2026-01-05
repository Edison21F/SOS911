/**
 * Domain Entity representing a Client.
 */
class Cliente {
    constructor({
        id,
        nombre,
        correo_electronico,
        cedula_identidad,
        contrasena_hash, // Internal use only
        direccion,
        fecha_nacimiento,
        numero_ayudas,
        estado,
        foto_perfil,
        ficha_medica,
        fecha_creacion,
        fecha_modificacion
    }) {
        this.id = id;
        this.nombre = nombre;
        this.correo_electronico = correo_electronico;
        this.cedula_identidad = cedula_identidad;
        this.contrasena_hash = contrasena_hash;
        this.direccion = direccion;
        this.fecha_nacimiento = fecha_nacimiento;
        this.numero_ayudas = numero_ayudas || 0;
        this.estado = estado || 'activo';
        this.foto_perfil = foto_perfil;
        this.ficha_medica = ficha_medica;
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
    }
}

module.exports = Cliente;
