class EliminarRol {
    constructor(rolRepository) {
        this.rolRepository = rolRepository;
    }

    async execute(id) {
        const rolExistente = await this.rolRepository.findById(id);
        if (!rolExistente || rolExistente.estado === 'eliminado') {
            throw new Error('Rol no encontrado o ya eliminado.');
        }

        const eliminado = await this.rolRepository.delete(id);
        if (!eliminado) {
            throw new Error('No se pudo eliminar el rol.');
        }
        return true;
    }
}

module.exports = EliminarRol;
