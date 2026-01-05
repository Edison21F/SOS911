/**
 * Interface for Alerta Repository.
 */
class IAlertaRepository {
    async save(alerta) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async findAll(incluirEliminados) { throw new Error('Method not implemented'); }
    async update(alerta) { throw new Error('Method not implemented'); }
    async delete(id) { throw new Error('Method not implemented'); }
}

module.exports = IAlertaRepository;
