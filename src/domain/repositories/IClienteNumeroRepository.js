/**
 * Interface for ClienteNumero Repository
 * @interface
 */
class IClienteNumeroRepository {
    async save(numero) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findAll(filters = {}, incluirEliminados = false) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findById(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findByClientAndNumber(clienteId, numero) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findByClientId(clienteId) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async update(id, data) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async delete(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
}

module.exports = IClienteNumeroRepository;
