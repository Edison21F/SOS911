class ActualizarUsuarioRol {
    constructor(usuarioRolRepository) {
        this.usuarioRolRepository = usuarioRolRepository;
    }

    async execute(id, datos) {
        const relacion = await this.usuarioRolRepository.findById(id);
        if (!relacion || relacion.estado === 'eliminado') {
            throw new Error('Relación no encontrada o inactiva.');
        }

        return await this.usuarioRolRepository.update(id, datos);
    }
}

module.exports = ActualizarUsuarioRol;
