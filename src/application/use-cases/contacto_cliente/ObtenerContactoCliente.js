class ObtenerContactoCliente {
    constructor(contactoClienteRepository) {
        this.contactoClienteRepository = contactoClienteRepository;
    }

    async execute(id) {
        return await this.contactoClienteRepository.findById(id);
    }
}
module.exports = ObtenerContactoCliente;
