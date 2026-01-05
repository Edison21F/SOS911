/**
 * Interface for Rol Repository
 * @interface
 */
class IRolRepository {
    /**
     * Save a new role
     * @param {import('../entities/Rol')} rol
     * @returns {Promise<import('../entities/Rol')>}
     */
    async save(rol) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * List all roles
     * @param {boolean} incluirEliminados
     * @returns {Promise<import('../entities/Rol')[]>}
     */
    async findAll(incluirEliminados = false) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Find role by ID
     * @param {string|number} id
     * @returns {Promise<import('../entities/Rol') | null>}
     */
    async findById(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Find role by Name (for uniqueness check)
     * @param {string} nombre
     * @returns {Promise<import('../entities/Rol') | null>}
     */
    async findByName(nombre) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Update a role
     * @param {string|number} id
     * @param {Object} data
     * @returns {Promise<import('../entities/Rol') | null>}
     */
    async update(id, data) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Delete a role (Soft delete)
     * @param {string|number} id
     * @returns {Promise<boolean>}
     */
    async delete(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
}

module.exports = IRolRepository;
