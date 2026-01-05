/**
 * Interface for Pagina Repository.
 */
class IPaginaRepository {
    async save(pagina) { throw new Error('Method not implemented'); }
    async findById(id) { throw new Error('Method not implemented'); }
    async findActive() { throw new Error('Method not implemented'); } // Usually only one active page config?
    async update(pagina) { throw new Error('Method not implemented'); }
    async delete(id) { throw new Error('Method not implemented'); }
    async findByNombre(nombre) { throw new Error('Method not implemented'); }
}

module.exports = IPaginaRepository;
