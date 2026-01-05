class ListarUbicacionesClientes {
    constructor(ubicacionClienteRepository) {
        this.ubicacionClienteRepository = ubicacionClienteRepository;
    }

    async execute(filters = {}, incluirEliminados = false) {
        return await this.ubicacionClienteRepository.findAll(filters, incluirEliminados);
    }
}

module.exports = ListarUbicacionesClientes;
