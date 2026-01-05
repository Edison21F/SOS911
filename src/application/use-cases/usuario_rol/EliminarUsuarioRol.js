class EliminarUsuarioRol {
    constructor(usuarioRolRepository) {
        this.usuarioRolRepository = usuarioRolRepository;
    }

    async execute(id) {
        const relacion = await this.usuarioRolRepository.findById(id);
        if (!relacion || relacion.estado === 'eliminado') {
            throw new Error('Relación no encontrada o ya eliminada.');
        }

        return await this.usuarioRolRepository.delete(id);
    }
}

module.exports = EliminarUsuarioRol;
