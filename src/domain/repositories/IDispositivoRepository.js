/**
 * Interface for Dispositivo Repository
 * @interface
 */
class IDispositivoRepository {
    /**
     * Save a new device
     * @param {import('../entities/Dispositivo')} dispositivo
     * @returns {Promise<import('../entities/Dispositivo')>}
     */
    async save(dispositivo) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Find devices
     * @param {boolean} incluirEliminados
     * @returns {Promise<import('../entities/Dispositivo')[]>}
     */
    async findAll(incluirEliminados = false) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Find device by ID
     * @param {string|number} id
     * @returns {Promise<import('../entities/Dispositivo') | null>}
     */
    async findById(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Find device by Token (for uniqueness check)
     * @param {string|number} clienteId
     * @param {string} token (Raw, repository treats it as per encryption strategy)
     * @returns {Promise<import('../entities/Dispositivo') | null>}
     */
    async findByToken(clienteId, token) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Update a device
     * @param {string|number} id
     * @param {Object} data
     * @returns {Promise<import('../entities/Dispositivo') | null>}
     */
    async update(id, data) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Delete a device (Soft delete)
     * @param {string|number} id
     * @returns {Promise<boolean>}
     */
    async delete(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
}

module.exports = IDispositivoRepository;
