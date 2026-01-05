/**
 * Interface for ContactoCliente Repository.
 */
class IContactoClienteRepository {
    async save(contactoCliente) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async findAll(incluirEliminados) { throw new Error('Method not implemented'); }
    async update(contactoCliente) { throw new Error('Method not implemented'); }
    async delete(id) { throw new Error('Method not implemented'); }
    async validateDependencies(clienteId, contactosEmergenciaId, notificacioneId) { throw new Error('Method not implemented'); }
    async exists(clienteId, contactosEmergenciaId, notificacioneId) { throw new Error('Method not implemented'); }
    async incrementNotificationCounter(notificacioneId) { throw new Error('Method not implemented'); }
}

module.exports = IContactoClienteRepository;
