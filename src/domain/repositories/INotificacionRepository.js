/**
 * Interface for Notificacion Repository
 * @interface
 */
class INotificacionRepository {
    /**
     * Save a new notification
     * @param {import('../entities/Notificacion')} notificacion
     * @returns {Promise<import('../entities/Notificacion')>}
     */
    async save(notificacion) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * List all notifications
     * @param {boolean} incluirEliminados
     * @returns {Promise<import('../entities/Notificacion')[]>}
     */
    async findAll(incluirEliminados = false) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Find notification by ID
     * @param {string|number} id
     * @returns {Promise<import('../entities/Notificacion') | null>}
     */
    async findById(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Update a notification
     * @param {string|number} id
     * @param {Object} data
     * @returns {Promise<import('../entities/Notificacion') | null>}
     */
    async update(id, data) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }

    /**
     * Delete a notification (Soft delete)
     * @param {string|number} id
     * @returns {Promise<boolean>}
     */
    async delete(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    /**
     * Increment the 'respuesta' counter for a notification
     * @param {string|number} id
     * @returns {Promise<void>}
     */
    async incrementRespuesta(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
}

module.exports = INotificacionRepository;
