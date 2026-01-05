class EliminarNumeroCliente {
    constructor(clienteNumeroRepository) {
        this.clienteNumeroRepository = clienteNumeroRepository;
    }

    async execute(id) {
        const numero = await this.clienteNumeroRepository.findById(id);
        if (!numero || numero.estado === 'eliminado') {
            throw new Error('Número de cliente no encontrado o ya eliminado.');
        }

        const deleted = await this.clienteNumeroRepository.delete(id);
        if (!deleted) {
            throw new Error('No se pudo eliminar el número de cliente.');
        }
        return true;
    }
}

module.exports = EliminarNumeroCliente;
