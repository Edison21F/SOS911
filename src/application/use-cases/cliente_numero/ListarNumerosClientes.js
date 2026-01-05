class ListarNumerosClientes {
    constructor(clienteNumeroRepository) {
        this.clienteNumeroRepository = clienteNumeroRepository;
    }

    async execute(filters = {}, incluirEliminados = false) {
        return await this.clienteNumeroRepository.findAll(filters, incluirEliminados);
    }
}

module.exports = ListarNumerosClientes;
