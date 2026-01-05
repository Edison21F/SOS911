/**
 * Interface for InformeEstadistica Repository
 * @interface
 */
class IInformeEstadisticaRepository {
    async save(informe) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findAll(incluirEliminados = false) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findById(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async update(id, data) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async delete(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
}

module.exports = IInformeEstadisticaRepository;
