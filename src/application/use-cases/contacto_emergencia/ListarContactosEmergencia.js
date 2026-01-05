class ListarContactosEmergencia {
    constructor(contactoEmergenciaRepository) {
        this.contactoEmergenciaRepository = contactoEmergenciaRepository;
    }

    async execute(incluirEliminados) {
        return await this.contactoEmergenciaRepository.findAllActive(incluirEliminados);
    }
}
module.exports = ListarContactosEmergencia;
