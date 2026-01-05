class ActualizarContactoEmergencia {
    constructor(contactoEmergenciaRepository) {
        this.contactoEmergenciaRepository = contactoEmergenciaRepository;
    }

    async execute(id, data) {
        const { nombre, relacion, numero, telefono, descripcion, estado } = data;

        // Compatibility mapping
        const phone = numero || telefono;
        const desc = relacion || descripcion;

        if (nombre === undefined && desc === undefined && phone === undefined && estado === undefined) {
            throw new Error('No se proporcionaron campos para actualizar.');
        }

        const contact = await this.contactoEmergenciaRepository.findById(id);
        if (!contact) throw new Error('Contacto de emergencia no encontrado o inactivo para actualizar.');

        // Update fields
        if (nombre !== undefined) contact.nombre = nombre;
        if (desc !== undefined) contact.descripcion = desc;
        if (phone !== undefined) contact.telefono = phone;
        if (estado !== undefined) contact.estado = estado;

        return await this.contactoEmergenciaRepository.update(contact);
    }
}
module.exports = ActualizarContactoEmergencia;
