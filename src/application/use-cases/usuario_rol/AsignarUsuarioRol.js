class AsignarUsuarioRol {
    constructor(usuarioRolRepository) {
        this.usuarioRolRepository = usuarioRolRepository;
    }

    async execute(datos) {
        if (!datos.usuarioId || !datos.roleId) {
            throw new Error('Faltan campos obligatorios: usuarioId y roleId.');
        }

        // Check if already exists
        const exists = await this.usuarioRolRepository.findByUserAndRole(datos.usuarioId, datos.roleId);
        if (exists) {
            if (exists.estado === 'activo') {
                throw new Error('Esta relación usuario-rol ya existe.');
            } else {
                // Reactivate
                return await this.usuarioRolRepository.update(exists.id, { estado: 'activo' });
            }
        }

        return await this.usuarioRolRepository.save(datos);
    }
}

module.exports = AsignarUsuarioRol;
