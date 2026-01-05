class ActualizarUbicacionCliente {
    constructor(ubicacionClienteRepository) {
        this.ubicacionClienteRepository = ubicacionClienteRepository;
    }

    async execute(id, datos) {
        const ubicacion = await this.ubicacionClienteRepository.findById(id);
        if (!ubicacion || ubicacion.estado !== 'activo') {
            throw new Error('Ubicación no encontrada o inactiva.');
        }

        return await this.ubicacionClienteRepository.update(id, datos);
    }
}

module.exports = ActualizarUbicacionCliente;
