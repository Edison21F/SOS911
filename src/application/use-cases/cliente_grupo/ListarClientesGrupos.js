class ListarClientesGrupos {
    constructor(clienteGrupoRepository) {
        this.clienteGrupoRepository = clienteGrupoRepository;
    }

    async execute(filters = {}, incluirEliminados = false) {
        return await this.clienteGrupoRepository.findAll(filters, incluirEliminados);
    }
}

module.exports = ListarClientesGrupos;
