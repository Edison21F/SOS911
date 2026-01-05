class EliminarCliente {
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    async execute(id) {
        const cliente = await this.clienteRepository.findById(id);
        if (!cliente) throw new Error('Cliente no encontrado o ya estaba eliminado.');

        return await this.clienteRepository.delete(id);
    }
}
module.exports = EliminarCliente;
