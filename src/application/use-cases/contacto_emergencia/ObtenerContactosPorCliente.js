class ObtenerContactosPorCliente {
    constructor(contactoEmergenciaRepository) {
        this.contactoEmergenciaRepository = contactoEmergenciaRepository;
    }

    async execute(clienteId) {
        return await this.contactoEmergenciaRepository.findByClienteId(clienteId);
    }
}
module.exports = ObtenerContactosPorCliente;
