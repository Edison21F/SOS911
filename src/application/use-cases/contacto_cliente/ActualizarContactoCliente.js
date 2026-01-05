class ActualizarContactoCliente {
    constructor(contactoClienteRepository) {
        this.contactoClienteRepository = contactoClienteRepository;
    }

    async execute(id, data) {
        if (data.estado === undefined) {
            throw new Error('No se proporcionaron campos para actualizar (solo se permite "estado").');
        }

        const relation = await this.contactoClienteRepository.findById(id);
        if (!relation) throw new Error('Contacto de cliente no encontrado o inactivo para actualizar.');

        relation.estado = data.estado;

        return await this.contactoClienteRepository.update(relation);
    }
}
module.exports = ActualizarContactoCliente;
