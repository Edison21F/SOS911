class ObtenerNumeroCliente {
    constructor(clienteNumeroRepository) {
        this.clienteNumeroRepository = clienteNumeroRepository;
    }

    async execute(id) {
        const numero = await this.clienteNumeroRepository.findById(id);
        if (!numero || numero.estado !== 'activo') {
            return null;
        }
        return numero;
    }
}

module.exports = ObtenerNumeroCliente;
