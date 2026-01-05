class ObtenerUbicacionCliente {
    constructor(ubicacionClienteRepository) {
        this.ubicacionClienteRepository = ubicacionClienteRepository;
    }

    async execute(id) {
        const ubicacion = await this.ubicacionClienteRepository.findById(id);
        if (!ubicacion || ubicacion.estado !== 'activo') {
            // Let controller handle 404/null
            return null;
        }
        return ubicacion;
    }
}

module.exports = ObtenerUbicacionCliente;
