/**
 * Interface for UsuarioRol Repository
 * @interface
 */
class IUsuarioRolRepository {
    async save(usuarioRol) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findAll(filters = {}, incluirEliminados = false) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findById(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findByUserAndRole(usuarioId, roleId) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async update(id, data) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async delete(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
}

module.exports = IUsuarioRolRepository;
