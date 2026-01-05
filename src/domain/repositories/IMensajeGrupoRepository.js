/**
 * Interface for MensajeGrupo Repository
 * @interface
 */
class IMensajeGrupoRepository {
    /**
     * Save a new group message
     * @param {import('../entities/MensajeGrupo')} mensaje
     * @returns {Promise<import('../entities/MensajeGrupo')>}
     */
    async save(mensaje) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Find messages by Group ID
     * @param {string|number} grupoId
     * @returns {Promise<import('../entities/MensajeGrupo')[]>}
     */
    async findByGroup(grupoId) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Find message by ID (Mongo ID)
     * @param {string} id
     * @returns {Promise<import('../entities/MensajeGrupo') | null>}
     */
    async findById(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Update a message
     * @param {string} id
     * @param {Object} data - Fields to update
     * @returns {Promise<import('../entities/MensajeGrupo') | null>}
     */
    async update(id, data) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Soft delete a message
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    async delete(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
}

module.exports = IMensajeGrupoRepository;
