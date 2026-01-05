class ObtenerUsuarioRol {
    constructor(usuarioRolRepository) {
        this.usuarioRolRepository = usuarioRolRepository;
    }

    async execute(id) {
        const relacion = await this.usuarioRolRepository.findById(id);
        if (!relacion || relacion.estado !== 'activo') {
            // Return null to let controller handle 404
            return null;
        }
        return relacion;
    }
}

module.exports = ObtenerUsuarioRol;
