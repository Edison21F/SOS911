class EliminarContactoCliente {
    constructor(contactoClienteRepository) {
        this.contactoClienteRepository = contactoClienteRepository;
    }

    async execute(id) {
        const relation = await this.contactoClienteRepository.findById(id);
        if (!relation) throw new Error('Contacto de cliente no encontrado o ya estaba eliminado.');

        return await this.contactoClienteRepository.delete(id);
    }
}
module.exports = EliminarContactoCliente;
