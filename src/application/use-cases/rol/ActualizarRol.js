class ActualizarRol {
    constructor(rolRepository) {
        this.rolRepository = rolRepository;
    }

    async execute(id, datos) {
        // Validation of existence first
        const rolExistente = await this.rolRepository.findById(id);
        if (!rolExistente || rolExistente.estado !== 'activo') {
            throw new Error('Rol no encontrado o inactivo para actualizar.');
        }

        if (datos.nombre) {
            const existingWithName = await this.rolRepository.findByName(datos.nombre);
            if (existingWithName && existingWithName.id !== id) {
                throw new Error('El nuevo nombre de rol ya está registrado por otro rol.');
            }
        }

        const rolActualizado = await this.rolRepository.update(id, datos);
        return rolActualizado;
    }
}

module.exports = ActualizarRol;
