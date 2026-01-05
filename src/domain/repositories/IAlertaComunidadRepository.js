/**
 * Interface for AlertaComunidad Repository
 * @interface
 */
class IAlertaComunidadRepository {
    async save(alerta) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findById(id) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async update(id, data) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findByUsuario(idUsuarioSql) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findNearby(lat, lng, maxDistance) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
    async findRecentExcludingUser(idUsuarioSql, limit) { throw new Error('ERR_METHOD_NOT_IMPLEMENTED'); }
}

module.exports = IAlertaComunidadRepository;
