class ObtenerRol {
    constructor(rolRepository) {
        this.rolRepository = rolRepository;
    }

    async execute(id) {
        const rol = await this.rolRepository.findById(id);

        if (!rol || rol.estado !== 'activo') {
            // If we strictly follow repo returning everything, we filter here for active only unless administrative use case (which this seems to be general).
            // Original controller returns 404 if not found or inactive.
            if (!rol) return null;
            if (rol.estado !== 'activo') return null;
        }
        return rol;
    }
}

module.exports = ObtenerRol;
