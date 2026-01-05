/**
 * Interface for ContenidoApp Repository
 * @interface
 */
class IContenidoAppRepository {
    async findActive() { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async save(contenidoApp) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async update(id, data) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    // Deletion is essentially setting state to inactive, handled by update usually, or explicit method
    async changeStatus(id, estado) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
}

module.exports = IContenidoAppRepository;
