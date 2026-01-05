/**
 * Interface for ContactoEmergencia Repository.
 */
class IContactoEmergenciaRepository {
    async save(contacto) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async findAllActive(incluirEliminados) { throw new Error('Method not implemented'); }
    async findByClienteId(clienteId) { throw new Error('Method not implemented'); }
    async update(contacto) { throw new Error('Method not implemented'); }
    async delete(id) { throw new Error('Method not implemented'); }

    // Domain specific queries
    async findDuplicate(clienteId, nombre) { throw new Error('Method not implemented'); }

    // Vinculation logic queries
    async findPendingRequests(userId) { throw new Error('Method not implemented'); }
    async findExistingVinculation(clienteId, idUsuarioContactoSql) { throw new Error('Method not implemented'); }
    async findInverseVinculation(accepterId, requesterId) { throw new Error('Method not implemented'); }
}

module.exports = IContactoEmergenciaRepository;
