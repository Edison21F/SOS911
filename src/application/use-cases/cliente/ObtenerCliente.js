class ObtenerCliente {
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    async execute(id) {
        const cliente = await this.clienteRepository.findById(id);
        if (!cliente) return null; // Or throw error, depending on preference. Controller handles 404 check usually.
        return cliente;
    }
}
module.exports = ObtenerCliente;
