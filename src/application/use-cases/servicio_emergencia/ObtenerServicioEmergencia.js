class ObtenerServicioEmergencia {
    constructor(servicioEmergenciaRepository) {
        this.servicioEmergenciaRepository = servicioEmergenciaRepository;
    }

    async execute(id) {
        const servicio = await this.servicioEmergenciaRepository.findById(id);
        if (!servicio || servicio.estado !== 'activo') {
            return null;
        }
        return servicio;
    }
}

module.exports = ObtenerServicioEmergencia;
