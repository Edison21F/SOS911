class ListarInformesEstadisticas {
    constructor(informeRepository) {
        this.informeRepository = informeRepository;
    }

    async execute(incluirEliminados = false) {
        return await this.informeRepository.findAll(incluirEliminados);
    }
}

module.exports = ListarInformesEstadisticas;
