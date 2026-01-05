class EliminarContactoEmergencia {
    constructor(contactoEmergenciaRepository) {
        this.contactoEmergenciaRepository = contactoEmergenciaRepository;
    }

    async execute(id) {
        const contact = await this.contactoEmergenciaRepository.findById(id);
        if (!contact) throw new Error('Contacto de emergencia no encontrado o ya estaba eliminado.');

        return await this.contactoEmergenciaRepository.delete(id);
    }
}
module.exports = EliminarContactoEmergencia;
