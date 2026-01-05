class ObtenerContactoEmergencia {
    constructor(contactoEmergenciaRepository) {
        this.contactoEmergenciaRepository = contactoEmergenciaRepository;
    }

    async execute(id) {
        return await this.contactoEmergenciaRepository.findById(id);
    }
}
module.exports = ObtenerContactoEmergencia;
