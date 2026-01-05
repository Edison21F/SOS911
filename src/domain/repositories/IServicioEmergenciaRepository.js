/**
 * Interface for ServicioEmergencia Repository
 * @interface
 */
class IServicioEmergenciaRepository {
    async save(servicio) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findAll(filters = {}, incluirEliminados = false) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findById(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findByNameAndUser(nombre, usuarioId, excludeId = null) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async update(id, data) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async delete(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
}

module.exports = IServicioEmergenciaRepository;
