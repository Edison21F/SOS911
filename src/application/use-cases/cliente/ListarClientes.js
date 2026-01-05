class ListarClientes {
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    async execute(incluirEliminados) {
        return await this.clienteRepository.findAll(incluirEliminados);
    }
}
module.exports = ListarClientes;
