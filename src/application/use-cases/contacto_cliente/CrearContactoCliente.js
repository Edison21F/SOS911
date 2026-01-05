const ContactoCliente = require('../../../domain/entities/ContactoCliente');

class CrearContactoCliente {
    constructor(contactoClienteRepository) {
        this.contactoClienteRepository = contactoClienteRepository;
    }

    async execute(data) {
        const { clienteId, contactosEmergenciaId, notificacioneId, estado } = data;

        if (!clienteId || !contactosEmergenciaId || !notificacioneId) {
            throw new Error('Los campos clienteId, contactosEmergenciaId y notificacioneId son requeridos.');
        }

        const dependencyCheck = await this.contactoClienteRepository.validateDependencies(clienteId, contactosEmergenciaId, notificacioneId);

        if (!dependencyCheck.cliente) throw new Error('Cliente no encontrado o inactivo.');
        if (!dependencyCheck.contactoEmergencia) throw new Error('Contacto de emergencia no encontrado o inactivo.');
        if (!dependencyCheck.notificacion) throw new Error('Notificación no encontrada o eliminada.');

        const exists = await this.contactoClienteRepository.exists(clienteId, contactosEmergenciaId, notificacioneId);
        if (exists) {
            throw new Error('La relación de contacto de cliente ya está registrada.');
        }

        const nuevoContacto = new ContactoCliente({
            clienteId,
            contactosEmergenciaId,
            notificacioneId,
            estado
        });

        const createdContact = await this.contactoClienteRepository.save(nuevoContacto);

        // Side effect: increment notification counter
        await this.contactoClienteRepository.incrementNotificationCounter(notificacioneId);

        return createdContact;
    }
}
module.exports = CrearContactoCliente;
