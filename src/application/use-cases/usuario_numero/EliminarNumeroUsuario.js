class EliminarNumeroUsuario {
    constructor(usuarioNumeroRepository) {
        this.usuarioNumeroRepository = usuarioNumeroRepository;
    }

    async execute(id) {
        const numero = await this.usuarioNumeroRepository.findById(id);
        // Controller checked for (not found || eliminated), Repository findById returns null if not found
        // But repository findAll logic can return eliminated if requested.
        // Logic: if not found, error. if found but eliminated, error.

        if (!numero || numero.estado === 'eliminado') {
            throw new Error('Número de usuario no encontrado o ya eliminado.');
        }

        const deleted = await this.usuarioNumeroRepository.delete(id);
        if (!deleted) {
            throw new Error('No se pudo eliminar el número de usuario.');
        }
        return true;
    }
}

module.exports = EliminarNumeroUsuario;
