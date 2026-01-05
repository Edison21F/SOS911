class ListarSolicitudesPendientes {
    constructor(contactoEmergenciaRepository) {
        this.contactoEmergenciaRepository = contactoEmergenciaRepository;
    }

    async execute(userId) {
        return await this.contactoEmergenciaRepository.findPendingRequests(userId);
    }
}
module.exports = ListarSolicitudesPendientes;
