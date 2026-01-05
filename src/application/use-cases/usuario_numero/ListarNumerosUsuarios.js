class ListarNumerosUsuarios {
    constructor(usuarioNumeroRepository) {
        this.usuarioNumeroRepository = usuarioNumeroRepository;
    }

    async execute(filters = {}, incluirEliminados = false) {
        return await this.usuarioNumeroRepository.findAll(filters, incluirEliminados);
    }
}

module.exports = ListarNumerosUsuarios;
