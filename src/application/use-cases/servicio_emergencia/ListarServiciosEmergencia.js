class ListarServiciosEmergencia {
    constructor(servicioEmergenciaRepository) {
        this.servicioEmergenciaRepository = servicioEmergenciaRepository;
    }

    async execute(filters = {}, incluirEliminados = false) {
        return await this.servicioEmergenciaRepository.findAll(filters, incluirEliminados);
    }
}

module.exports = ListarServiciosEmergencia;
