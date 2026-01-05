class ListarContactosClientes {
    constructor(contactoClienteRepository) {
        this.contactoClienteRepository = contactoClienteRepository;
    }

    async execute(incluirEliminados) {
        return await this.contactoClienteRepository.findAll(incluirEliminados);
    }
}
module.exports = ListarContactosClientes;
