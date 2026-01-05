class EliminarUbicacionCliente {
    constructor(ubicacionClienteRepository) {
        this.ubicacionClienteRepository = ubicacionClienteRepository;
    }

    async execute(id) {
        const ubicacion = await this.ubicacionClienteRepository.findById(id);
        if (!ubicacion || ubicacion.estado === 'eliminado') {
            throw new Error('Ubicación no encontrada o ya eliminada.');
        }

        return await this.ubicacionClienteRepository.delete(id);
    }
}

module.exports = EliminarUbicacionCliente;
