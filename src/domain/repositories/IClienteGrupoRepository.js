/**
 * Interface for ClienteGrupo Repository
 * @interface
 */
class IClienteGrupoRepository {
    /**
     * Save a new client-group relationship
     * @param {import('../entities/ClienteGrupo')} clienteGrupo
     * @returns {Promise<import('../entities/ClienteGrupo')>}
     */
    async save(clienteGrupo) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * List all relationships
     * @param {boolean} incluirEliminados
     * @returns {Promise<import('../entities/ClienteGrupo')[]>}
     */
    async findAll(incluirEliminados = false) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Find relationship by ID
     * @param {string|number} id
     * @returns {Promise<import('../entities/ClienteGrupo') | null>}
     */
    async findById(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Find by Client and Group (Uniqueness check)
     * @param {string|number} clienteId
     * @param {string|number} grupoId
     * @returns {Promise<import('../entities/ClienteGrupo') | null>}
     */
    async findByClientAndGroup(clienteId, grupoId) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Update a relationship
     * @param {string|number} id
     * @param {Object} data
     * @returns {Promise<import('../entities/ClienteGrupo') | null>}
     */
    async update(id, data) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Delete a relationship (Soft delete)
     * @param {string|number} id
     * @returns {Promise<boolean>}
     */
    async delete(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
}

module.exports = IClienteGrupoRepository;
