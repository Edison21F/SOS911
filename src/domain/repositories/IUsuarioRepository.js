/**
 * Interface for Usuario Repository.
 * This is a Port in Hexagonal Architecture.
 * Implementations (Adapters) must adhere to this contract.
 */
class IUsuarioRepository {
    /**
     * Save a new user.
     * @param {Usuario} usuario 
     * @returns {Promise<Usuario>} The saved user with ID
     */
    async save(usuario) { throw new Error('Method not implemented'); }

    /**
     * Find user by ID.
     * @param {string|number} id 
     * @returns {Promise<Usuario|null>}
     */
    async findById(id) { throw new Error('Method not implemented'); }

    /**
     * Find user by Email.
     * @param {string} email 
     * @returns {Promise<Usuario|null>}
     */
    async findByEmail(email) { throw new Error('Method not implemented'); }

    /**
     * Find user by Cedula.
     * @param {string} cedula 
     * @returns {Promise<Usuario|null>}
     */
    async findByCedula(cedula) { throw new Error('Method not implemented'); }

    /**
     * Update user.
     * @param {Usuario} usuario 
     * @returns {Promise<Usuario>}
     */
    async update(usuario) { throw new Error('Method not implemented'); }

    /**
     * Delete user (soft delete).
     * @param {string|number} id 
     * @returns {Promise<boolean>}
     */
    async delete(id) { throw new Error('Method not implemented'); }

    // Stats for Auth/Availability
    async countUsers() { throw new Error('Method not implemented'); }
    async getMaxId() { throw new Error('Method not implemented'); }
}

module.exports = IUsuarioRepository;
