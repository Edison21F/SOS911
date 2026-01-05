class ObtenerEstadisticasCliente {
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    async execute(id) {
        return await this.clienteRepository.getStats(id);
    }
}
module.exports = ObtenerEstadisticasCliente;
