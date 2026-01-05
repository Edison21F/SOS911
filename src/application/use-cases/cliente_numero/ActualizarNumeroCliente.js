class ActualizarNumeroCliente {
    constructor(clienteNumeroRepository) {
        this.clienteNumeroRepository = clienteNumeroRepository;
    }

    async execute(id, datos) {
        const numero = await this.clienteNumeroRepository.findById(id);
        if (!numero || numero.estado !== 'activo') {
            throw new Error('Número de cliente no encontrado o inactivo.');
        }

        return await this.clienteNumeroRepository.update(id, datos);
    }
}

module.exports = ActualizarNumeroCliente;
