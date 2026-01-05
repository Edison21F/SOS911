/**
 * Use Case: Update User
 */
class ActualizarUsuario {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(id, updateData) {
        // 1. Get existing
        const user = await this.usuarioRepository.findById(id);
        if (!user) throw new Error('Usuario no encontrado.');

        // 2. Update fields
        // We merge existing with new (Domain logic should ideally be inside Entity like user.updateDetails(...))
        if (updateData.nombre) user.nombre = updateData.nombre;
        if (updateData.correo_electronico) user.correo_electronico = updateData.correo_electronico;
        if (updateData.cedula_identidad) user.cedula_identidad = updateData.cedula_identidad;
        if (updateData.fecha_nacimiento) user.fecha_nacimiento = updateData.fecha_nacimiento;
        if (updateData.direccion) user.direccion = updateData.direccion;
        if (updateData.estado) user.estado = updateData.estado;
        if (updateData.contrasena) user.contrasena = updateData.contrasena;

        // 3. Save
        return await this.usuarioRepository.update(user);
    }
}
module.exports = ActualizarUsuario;
