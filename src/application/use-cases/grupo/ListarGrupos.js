class ListarGrupos {
    constructor(grupoRepository) {
        this.grupoRepository = grupoRepository;
    }

    async execute(filters = {}, incluirEliminados = false) {
        return await this.grupoRepository.findAll(filters, incluirEliminados);
    }
}

module.exports = ListarGrupos;
