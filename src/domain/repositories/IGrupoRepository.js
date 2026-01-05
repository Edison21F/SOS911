/**
 * Interface for Grupo Repository
 * @interface
 */
class IGrupoRepository {
    /**
     * Save a new group (Hybrid: SQL + Mongo)
     * @param {import('../entities/Grupo')} grupo
     * @returns {Promise<import('../entities/Grupo')>}
     */
    async save(grupo) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * List all groups (with filters)
     * @param {Object} filters
     * @param {boolean} incluirEliminados
     * @returns {Promise<import('../entities/Grupo')[]>}
     */
    async findAll(filters = {}, incluirEliminados = false) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Find group by ID
     * @param {string|number} id
     * @returns {Promise<import('../entities/Grupo') | null>}
     */
    async findById(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Find group by Access Code
     * @param {string} codigo
     * @returns {Promise<import('../entities/Grupo') | null>}
     */
    async findByCodigo(codigo) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Update a group (Hybrid)
     * @param {string|number} id
     * @param {Object} data
     * @returns {Promise<import('../entities/Grupo') | null>}
     */
    async update(id, data) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Delete a group (Soft delete in both DBs)
     * @param {string|number} id
     * @returns {Promise<boolean>}
     */
    async delete(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
}

module.exports = IGrupoRepository;
