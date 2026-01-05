class EliminarServicioEmergencia {
    constructor(servicioEmergenciaRepository) {
        this.servicioEmergenciaRepository = servicioEmergenciaRepository;
    }

    async execute(id) {
        const servicio = await this.servicioEmergenciaRepository.findById(id);
        if (!servicio || servicio.estado === 'eliminado') {
            throw new Error('Servicio no encontrado o ya estaba eliminado.');
        }

        const deleted = await this.servicioEmergenciaRepository.delete(id);
        if (!deleted) {
            throw new Error('No se pudo eliminar el servicio.');
        }
        return true;
    }
}

module.exports = EliminarServicioEmergencia;
