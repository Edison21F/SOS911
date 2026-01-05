const ContactoEmergencia = require('../../../domain/entities/ContactoEmergencia');

class CrearContactoEmergencia {
    constructor(contactoEmergenciaRepository) {
        this.contactoEmergenciaRepository = contactoEmergenciaRepository;
    }

    async execute(data) {
        const { clienteId, nombre, relacion, numero, telefono, descripcion, estado } = data;

        // Compatibility mapping
        const phone = numero || telefono;
        const desc = relacion || descripcion;

        if (!clienteId || !nombre || !phone) {
            throw new Error('Los campos clienteId, nombre y número/teléfono son requeridos.');
        }

        const isDuplicate = await this.contactoEmergenciaRepository.findDuplicate(clienteId, nombre);
        if (isDuplicate) {
            throw new Error('El contacto de emergencia ya está registrado para este cliente con ese nombre.');
        }

        const nuevoContacto = new ContactoEmergencia({
            clienteId,
            nombre,
            descripcion: desc,
            telefono: phone,
            estado
        });

        return await this.contactoEmergenciaRepository.save(nuevoContacto);
    }
}
module.exports = CrearContactoEmergencia;
